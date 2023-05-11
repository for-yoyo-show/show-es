/* eslint-disable @typescript-eslint/no-empty-function */
import { EventDispatcher } from 'three';
import { createRenderer, create2dRenderer, importScence } from './utils/shared-orbitcontrols';

function noop() {}

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
    // because OrbitControls try to set style.touchAction;
    this.style = {};
  }
  get clientWidth() {
    return this.width;
  }
  get clientHeight() {
    return this.height;
  }
  // OrbitControls call these as of r132. Maybe we should implement them
  setPointerCapture() {}
  releasePointerCapture() {}
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height
    };
  }
  handleEvent(data) {
    if (data.type === 'size') {
      this.left = data.left;
      this.top = data.top;
      this.width = data.width;
      this.height = data.height;
      self.devicePixelRatio = data.devicePixelRatio;

      this.dispatchEvent(data);
      return;
    }

    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}

class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const { id } = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}

const proxyManager = new ProxyManager();

const state = {
  render2d: null,
  canvas2d: null,
  canvas2dProxy: null,
  render3d: null,
  canvas3d: null,
  canvas3dProxy: null,
  render: null
};

async function init({ canvas2d, canvas3d }) {
  self.document = {}; // HACK!
  {
    const proxy = proxyManager.getProxy(canvas2d.canvasId);
    proxy.ownerDocument = proxy; // HACK!
    state.canvas2d = canvas2d.canvas;
    state.canvas2dProxy = proxy;
  }
  {
    const proxy = proxyManager.getProxy(canvas3d.canvasId);
    proxy.ownerDocument = proxy; // HACK!
    state.canvas3d = canvas3d.canvas;
    state.canvas3dProxy = proxy;
  }
  state.render2d = create2dRenderer({
    canvas: state.canvas2d,
    inputElement: state.canvas2dProxy
  });
  state.render3d = createRenderer({
    canvas: state.canvas3d,
    inputElement: state.canvas3dProxy
  });
}

const setShowCreator = async ({ scenceName }) => {
  const showCreator = (await importScence(scenceName)).default;

  state.render = showCreator.canvasType === '2d' ? state.render2d : state.render3d;
  await state.render.setShowCreator(showCreator);
  state.render.startRender();
  self.postMessage({
    type: 'setShowCreator',
    canvasType: showCreator.canvasType === '2d' ? '2d' : '3d'
  });

  return showCreator.canvasType;
};

const stopRender = async () => {
  state.render?.stopRender();
};

function makeProxy(data) {
  proxyManager.makeProxy(data);
}

// TODO 1.使用init 2.setShowCreator

const handlers = {
  init,
  setShowCreator,
  stopRender,
  makeProxy,
  event: proxyManager.handleEvent
};

self.onmessage = function (e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }

  fn(e.data);
};
