import * as THREE from 'three';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import Ammo from '@/libs/ammo';
import { Scence } from '@/utils/controller';

const scene: Scence = ({ canvas, loadCallback }) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.outputColorSpace = THREE.DisplayP3ColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color(0x000000));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
  const loader = new MMDLoader();
  const helper = new MMDAnimationHelper();

  loader.loadWithAnimation(
    'models/mmd/hutao/hutao.pmx', // called when the resource is loaded
    'models/mmd/vmds/ayaka-dance.vmd',
    function onLoad(mmd) {
      loadCallback();
      helper.add(mmd.mesh, {
        animation: mmd.animation
      });
      scene.add(mmd.mesh);
    }
  );

  loader.loadAnimation('models/mmd/vmds/ayaka-camera.vmd', camera, function (cameraAnimation) {
    helper.add(camera, {
      animation: cameraAnimation as THREE.AnimationClip
    });
  });

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const clock = new THREE.Clock();

  const state = {
    running: true
  };

  const render = () => {
    requestAnimationFrame(() => {
      const time = clock.getDelta();
      helper.update(time);
      renderer.render(scene, camera);
      if (state.running) {
        render();
      }
    });
  };

  Ammo().then(AmmoLib => {
    window.Ammo = AmmoLib;
    render();
  });

  const finish = () => {
    state.running = false;
  };

  return {
    finish
  };
};

export default scene;
