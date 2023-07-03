import * as THREE from 'three';
// 轨道
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { resizeRendererToDisplaySizeThree, logDumpObject } from '@/utils/utils';
import { Scence } from '@/utils/controller';

function startAnimation(skinnedMesh, animations, animationName) {
  const m_mixer = new THREE.AnimationMixer(skinnedMesh);
  const clip = THREE.AnimationClip.findByName(animations, animationName);
  if (clip) {
    const action = m_mixer.clipAction(clip);
    action.play();
  }
  return m_mixer;
}

const addLight = scene => {
  const intensity = 1;
  // 创建八个平行光源
  const light1 = new THREE.DirectionalLight(0xffffff, intensity);
  const light2 = new THREE.DirectionalLight(0xffffff, intensity);
  const light3 = new THREE.DirectionalLight(0xffffff, intensity);
  const light4 = new THREE.DirectionalLight(0xffffff, intensity);
  const light5 = new THREE.DirectionalLight(0xffffff, intensity);
  const light6 = new THREE.DirectionalLight(0xffffff, intensity);
  const light7 = new THREE.DirectionalLight(0xffffff, intensity);
  const light8 = new THREE.DirectionalLight(0xffffff, intensity);

  // 设置每个平行光源的位置和目标
  light1.position.set(1, 0, 0);
  light1.target.position.set(0, 0, 0);

  light2.position.set(-1, 0, 0);
  light2.target.position.set(0, 0, 0);

  light3.position.set(0, 1, 0);
  light3.target.position.set(0, 0, 0);

  light4.position.set(0, -1, 0);
  light4.target.position.set(0, 0, 0);

  light5.position.set(0, 0, 1);
  light5.target.position.set(0, 0, 0);

  light6.position.set(0, 0, -1);
  light6.target.position.set(0, 0, 0);

  light7.position.set(1, 1, 1);
  light7.target.position.set(0, 0, 0);

  light8.position.set(-1, -1, -1);
  light8.target.position.set(0, 0, 0);

  // 将平行光源添加到场景中
  scene.add(light1, light2, light3, light4, light5, light6, light7, light8);
  scene.add(
    light1.target,
    light2.target,
    light3.target,
    light4.target,
    light5.target,
    light6.target,
    light7.target,
    light8.target
  );
};

const OldBox: Scence = async ({ canvas, loadCallback }) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  const scene = new THREE.Scene();
  const controls = new OrbitControls(camera, renderer.domElement);
  addLight(scene);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const directionLight = new THREE.DirectionalLight(0xffffff, 1);

  scene.add(ambientLight);
  scene.add(directionLight);
  scene.background = new THREE.Color(0.2, 0.2, 0.2);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(new THREE.Color(0x000000));
  camera.position.set(5, 5, 5);
  camera.lookAt(scene.position);

  let mixer;
  let keyDownEvent;
  let touchStartEvent;
  let touchEndEvent;

  const loader = new GLTFLoader().setPath('models/glb/hovercar/');
  loader.load('scene.gltf', gltf => {
    const root = gltf.scene;

    // root.traverse(function (node) {
    //   if (node.isMesh) {
    //     //设置mesh的一些属性
    //     node.frustumCulled = false;
    //     node.castShadow = true;
    //     if (!node.material.emissive || !node.material.emissiveMap) {
    //       node.material.emissive = node.material.color;
    //       node.material.emissiveMap = node.material.map;
    //     }
    //   }
    // });

    const animations = gltf.animations;
    logDumpObject(root);
    scene.add(root);
    keyDownEvent = e => {
      if (e.key == 'w') {
        mixer = startAnimation(root, animations, 'Take 01');
      }
      if (e.key == 's') {
        mixer?.stopAllAction();
      }
    };
    touchStartEvent = () => {
      mixer = startAnimation(root, animations, 'Take 01');
    };
    touchEndEvent = () => {
      mixer?.stopAllAction();
    };

    loadCallback();
    window.addEventListener('touchstart', touchStartEvent);
    window.addEventListener('touchend', touchEndEvent);
    window.addEventListener('keydown', keyDownEvent);
  });
  const state = {
    running: true
  };

  const clock = new THREE.Clock();
  const render = () => {
    // 更新大小
    if (resizeRendererToDisplaySizeThree(renderer)) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    if (mixer) {
      mixer.update(clock.getDelta());
    }
  };

  function animate() {
    if (state.running) {
      requestAnimationFrame(animate);
    }
    render();
  }

  animate();

  const finish = () => {
    state.running = false;
    window.removeEventListener('keydown', keyDownEvent);
    window.removeEventListener('touchstart', touchStartEvent);
    window.removeEventListener('touchend', touchEndEvent);
  };

  return {
    finish
  };
};

export default OldBox;
