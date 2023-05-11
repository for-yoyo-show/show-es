/* eslint-disable @typescript-eslint/no-empty-function */
import { createRenderer, create2dRenderer, importScence } from './utils/shared-orbitcontrols';

const mouseEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'pointerType',
  'clientX',
  'clientY',
  'pageX',
  'pageY'
]);
const wheelEventHandlerImpl = makeSendPropertiesHandler(['deltaX', 'deltaY']);
const keydownEventHandler = makeSendPropertiesHandler(['ctrlKey', 'metaKey', 'shiftKey', 'keyCode']);

function wheelEventHandler(event, sendFn) {
  event.preventDefault();
  wheelEventHandlerImpl(event, sendFn);
}

function preventDefaultHandler(event) {
  event.preventDefault();
}

function copyProperties(src, properties, dst) {
  for (const name of properties) {
    dst[name] = src[name];
  }
}

function makeSendPropertiesHandler(properties) {
  return function sendProperties(event, sendFn) {
    const data = { type: event.type };
    copyProperties(event, properties, data);
    sendFn(data);
  };
}

function touchEventHandler(event, sendFn) {
  const touches = [];
  const data = { type: event.type, touches };
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY
    });
  }
  sendFn(data);
}

// The four arrow keys
const orbitKeys = {
  37: true, // left
  38: true, // up
  39: true, // right
  40: true // down
};
function filteredKeydownEventHandler(event, sendFn) {
  const { keyCode } = event;
  if (orbitKeys[keyCode]) {
    event.preventDefault();
    keydownEventHandler(event, sendFn);
  }
}

let nextProxyId = 0;
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = data => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data
      });
    };

    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id
    });
    sendSize();
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function (event) {
        handler(event, sendEvent);
      });
    }

    function sendSize() {
      const rect = element.getBoundingClientRect();
      sendEvent({
        type: 'size',
        left: rect.left,
        top: rect.top,
        devicePixelRatio: window.devicePixelRatio,
        width: element.clientWidth,
        height: element.clientHeight
      });
    }

    // really need to use ResizeObserver
    window.addEventListener('resize', sendSize);
  }
}

function startWorker(canvas) {
  canvas.focus();
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL('./render.worker', import.meta.url), {
    type: 'module'
  });

  const eventHandlers = {
    contextmenu: preventDefaultHandler,
    mousedown: mouseEventHandler,
    mousemove: mouseEventHandler,
    mouseup: mouseEventHandler,
    pointerdown: mouseEventHandler,
    pointermove: mouseEventHandler,
    pointerup: mouseEventHandler,
    touchstart: touchEventHandler,
    touchmove: touchEventHandler,
    touchend: touchEventHandler,
    wheel: wheelEventHandler,
    keydown: filteredKeydownEventHandler
  };
  const proxy = new ElementProxy(canvas, worker, eventHandlers);
  worker.postMessage(
    {
      type: 'start',
      canvas: offscreen,
      canvasId: proxy.id
    },
    [offscreen]
  );
  console.log('using OffscreenCanvas'); /* eslint-disable-line no-console */
}

// 非离屏渲染
class CanvasController {
  canvas2dRender;
  canvas3dRender;
  canvasRender;
  /**
   * @param {HTMLCanvasElement} canvas2d
   * @param {HTMLCanvasElement} canvas3d
   */
  constructor(canvas2d, canvas3d) {
    this.canvas2dRender = create2dRenderer({ canvas: canvas2d, inputElement: canvas2d });
    this.canvas3dRender = createRenderer({ canvas: canvas3d, inputElement: canvas3d });
  }

  async setShowCreator(scenceName) {
    const showCreator = (await importScence(scenceName)).default;
    this.canvasRender = showCreator.canvasType === '2d' ? this.canvas2dRender : this.canvas3dRender;
    await this.canvasRender.setShowCreator(showCreator);
    this.canvasRender.startRender();
    return showCreator.canvasType === '2d' ? '2d' : '3d';
  }

  stopRender() {
    this.canvasRender?.stopRender();
  }
}

// 离屏渲染
class CanvasController2 {
  canvas2dRender;
  canvas3dRender;
  canvasRender;
  worker;
  setShowCreatorCallBack;

  /**
   * @param {HTMLCanvasElement} canvas2d
   * @param {HTMLCanvasElement} canvas3d
   */
  constructor(canvas2d, canvas3d) {
    console.log('use worker!!');
    canvas2d.focus();
    canvas3d.focus();
    const worker = new Worker(new URL('./render.worker', import.meta.url), {
      type: 'module'
    });
    worker.onmessage = event => {
      const { data } = event;
      if (data.type === 'setShowCreator') {
        this.setShowCreatorCallBack(data);
      }
    };
    worker.onerror = function (event) {
      console.error(event);
    };
    this.worker = worker;
    const eventHandlers = {
      contextmenu: preventDefaultHandler,
      mousedown: mouseEventHandler,
      mousemove: mouseEventHandler,
      mouseup: mouseEventHandler,
      pointerdown: mouseEventHandler,
      pointermove: mouseEventHandler,
      pointerup: mouseEventHandler,
      touchstart: touchEventHandler,
      touchmove: touchEventHandler,
      touchend: touchEventHandler,
      wheel: wheelEventHandler,
      keydown: filteredKeydownEventHandler
    };

    const offscreen2d = canvas2d.transferControlToOffscreen();
    const proxy2d = new ElementProxy(canvas2d, worker, eventHandlers);

    const offscreen3d = canvas3d.transferControlToOffscreen();
    const proxy3d = new ElementProxy(canvas3d, worker, eventHandlers);

    worker.postMessage(
      {
        type: 'init',
        canvas2d: {
          canvas: offscreen2d,
          canvasId: proxy2d.id
        },
        canvas3d: {
          canvas: offscreen3d,
          canvasId: proxy3d.id
        }
      },
      [offscreen2d, offscreen3d]
    );
  }

  async setShowCreator(scenceName) {
    return new Promise(resolve => {
      this.worker?.postMessage({
        type: 'setShowCreator',
        scenceName
      });
      this.setShowCreatorCallBack = data => {
        resolve(data.canvasType);
      };
    });
  }

  async stopRender() {
    this.worker?.postMessage({
      type: 'stopRender'
    });
  }
}

export default CanvasController2;
