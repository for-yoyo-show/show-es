/* eslint-disable @typescript-eslint/no-empty-function */
import * as THREE from 'three';
export * from './map.mjs';

export const importScence = scenceName => {
  return import(`../scence/${scenceName}`);
};

export const isBasicType = obj => !(typeof obj === 'object' || typeof obj === 'function');

function resizeRendererToDisplaySize(renderer, inputElement) {
  const canvas = renderer.domElement;
  const pixelRatio = self?.devicePixelRatio || 1;
  const width = (inputElement.clientWidth * pixelRatio) | 0;
  const height = (inputElement.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
}

function resizeRendererToDisplaySize2d(canvas, inputElement) {
  const pixelRatio = self?.devicePixelRatio || 1;
  const width = (inputElement.clientWidth * pixelRatio) | 0;
  const height = (inputElement.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    canvas.width = width;
    canvas.height = height;
  }

  return needResize;
}

export const createRenderer = ({ canvas, inputElement } = {}) => {
  // 设置渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const state = {
    scene: null,
    canvas,
    camera: null,
    start: () => null,
    update: null,
    end: () => null,
    ui: null,
    running: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const render = ({ updateControls } = {}) => {
    // 更新大小
    if (resizeRendererToDisplaySize(renderer, inputElement)) {
      const canvas = renderer.domElement;
      state.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      state.camera.updateProjectionMatrix();
    }
    console.log('render');
    renderer.render(state.scene, state.camera);
  };

  const update = timestamp => {
    if (!state.update) {
      return;
    }
    timestamp *= 0.001;
    state.update({ timestamp, render });

    if (state.running) {
      requestAnimationFrame(update);
    }
  };

  const start = () => {
    state.start({ render, controls: state.controls });
  };

  const end = () => {
    state.end();
  };

  const setShowCreator = async showCreator => {
    const {
      scene,
      camera,
      update,
      start = () => {},
      end = () => {},
      ui
    } = await showCreator({ canvas: state.canvas, renderer: renderer, render, inputElement });
    state.scene = scene;
    state.camera = camera;
    state.update = update;
    state.start = start;
    state.ui = ui;
    state.end = end;
  };

  const stopRender = () => {
    end();
    state.running = false;
  };

  const startRender = () => {
    state.running = true;
    start();
    render();
    update();
  };

  return {
    state,
    stopRender,
    startRender,
    setShowCreator
  };
};

export const create2dRenderer = ({ canvas, inputElement } = {}) => {
  const state = {
    draw: () => {},
    update: null,
    canvas,
    camera: null,
    start: () => {},
    end: () => {},
    ui: null,
    running: false
  };

  const render = () => {
    resizeRendererToDisplaySize2d(canvas, inputElement);
    state.draw();
  };

  const start = () => {
    state.start({ render });
  };

  const update = timestamp => {
    if (!state.update) {
      return;
    }
    timestamp *= 0.001;
    state.update({ timestamp, render });

    if (state.running) {
      requestAnimationFrame(update);
    }
  };

  const end = () => {
    state.end();
  };

  const setShowCreator = async showCreator => {
    const { draw, update, start = () => {}, end = () => {}, ui } = await showCreator({ canvas: state.canvas });
    state.draw = draw;
    state.update = update;
    state.start = start;
    state.ui = ui;
    state.end = end;
  };

  const stopRender = () => {
    state.running = false;
    end();
  };

  const startRender = () => {
    state.running = true;
    start();
    render();
    update();
  };

  return {
    state,
    stopRender,
    startRender,
    setShowCreator
  };
};
