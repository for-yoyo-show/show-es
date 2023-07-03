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

const OldBox: Scence = async ({ canvas, loadCallback }) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  const scene = new THREE.Scene();
  const controls = new OrbitControls(camera, renderer.domElement);
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const ambientLight2 = new THREE.AmbientLight(0xffffff, 1);
  const ambientLight3 = new THREE.AmbientLight(0xffffff, 1);
  const directionLight = new THREE.DirectionalLight(0xffffff, 1);
  directionLight.position.set(0, 100, 0); // 平行光的位置（没有实际意义）
  directionLight.target.position.set(0, 0, 0); // 平行光的目标位置

  const directionLight2 = new THREE.DirectionalLight(0xffffff, 1);
  directionLight2.position.set(100, 0, 0); // 平行光的位置（没有实际意义）
  directionLight2.target.position.set(0, 0, 0); // 平行光的目标位置

  const directionLight3 = new THREE.DirectionalLight(0xffffff, 1);
  directionLight3.position.set(-100, 0, 0); // 平行光的位置（没有实际意义）
  directionLight3.target.position.set(0, 0, 0); // 平行光的目标位置

  const directionLight4 = new THREE.DirectionalLight(0xffffff, 1);
  directionLight4.position.set(100, 100, 100); // 平行光的位置（没有实际意义）
  directionLight4.target.position.set(0, 0, 0); // 平行光的目标位置

  scene.add(ambientLight);
  scene.add(ambientLight2);
  scene.add(ambientLight3);
  scene.add(directionLight);
  scene.add(directionLight2);
  scene.add(directionLight3);
  scene.add(directionLight4);
  scene.background = new THREE.Color(0.2, 0.2, 0.2);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(new THREE.Color(0x000000));
  camera.position.set(5, 5, 5);
  camera.lookAt(scene.position);

  let mixer;
  let keyDownEvent;

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

    loadCallback();

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
  };

  return {
    finish
  };
};

export default OldBox;
