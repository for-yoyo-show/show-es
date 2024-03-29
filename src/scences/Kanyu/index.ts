import * as THREE from 'three';

import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/examples/jsm/animation/MMDAnimationHelper.js';
import { Scence } from '@/utils/controller';

import Ammo from '@/libs/ammo';

const scene: Scence = ({ canvas, ui, loadCallback }) => {
  let stats;

  let mesh, camera, scene, renderer, effect;
  let helper, ikHelper, physicsHelper;

  const clock = new THREE.Clock();

  Ammo().then(function (AmmoLib) {
    window.Ammo = AmmoLib;
    init();
    animate();
  });

  function init() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 30;

    // scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const gridHelper = new THREE.PolarGridHelper(30, 0);
    gridHelper.position.y = -10;
    scene.add(gridHelper);

    const ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(0, 10, 10).normalize();
    // scene.add(directionalLight);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    effect = new OutlineEffect(renderer);

    // STATS

    stats = new Stats();
    stats.dom.style.position = '';
    ui.appendChild(stats.dom);

    // model

    function onProgress(xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        console.log(Math.round(percentComplete) + '% downloaded');
      }
    }

    const modelFile = 'models/mmd/naxitan/naxitan.pmx';
    const vmdFiles = ['models/mmd/vmds/ayaka-dance.vmd'];

    helper = new MMDAnimationHelper({
      afterglow: 2.0
    });

    const loader = new MMDLoader();

    loader.loadWithAnimation(
      modelFile,
      vmdFiles,
      function (mmd) {
        loadCallback();
        mesh = mmd.mesh;
        mesh.castShadow = true;
        mesh.position.y = -10;
        scene.add(mesh);

        helper.add(mesh, {
          animation: mmd.animation,
          physics: true
        });

        ikHelper = helper.objects.get(mesh).ikSolver.createHelper();
        ikHelper.visible = false;
        scene.add(ikHelper);

        physicsHelper = helper.objects.get(mesh).physics.createHelper();
        physicsHelper.visible = false;
        scene.add(physicsHelper);

        initGui();
      },
      onProgress,
      null
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 10;
    controls.maxDistance = 100;

    window.addEventListener('resize', onWindowResize);

    function initGui() {
      const api = {
        animation: true,
        ik: true,
        outline: true,
        physics: true,
        'show IK bones': false,
        'show rigid bodies': false
      };

      // TODO
      const gui = new GUI({ container: ui });

      gui.add(api, 'animation').onChange(function () {
        helper.enable('animation', api['animation']);
      });

      gui.add(api, 'ik').onChange(function () {
        helper.enable('ik', api['ik']);
      });

      gui.add(api, 'outline').onChange(function () {
        effect.enabled = api['outline'];
      });

      gui.add(api, 'physics').onChange(function () {
        helper.enable('physics', api['physics']);
      });

      gui.add(api, 'show IK bones').onChange(function () {
        ikHelper.visible = api['show IK bones'];
      });

      gui.add(api, 'show rigid bodies').onChange(function () {
        if (physicsHelper !== undefined) physicsHelper.visible = api['show rigid bodies'];
      });
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
  }

  const state = {
    running: true
  };

  function animate() {
    if (state.running) {
      requestAnimationFrame(animate);
    }

    stats.begin();
    render();
    stats.end();
  }

  function render() {
    helper.update(clock.getDelta());
    effect.render(scene, camera);
  }

  const finish = () => {
    state.running = false;
  };

  return {
    finish
  };
};

export default scene;
