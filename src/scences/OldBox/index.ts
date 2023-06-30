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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);

  scene.add(directionLight);
  scene.add(ambientLight);
  scene.background = new THREE.Color(0.2, 0.2, 0.2);
  camera.position.set(5, 5, 5);
  camera.lookAt(scene.position);

  let mixer;
  let keyDownEvent;

  new GLTFLoader().load('models/glb/oldbox/scene.gltf', gltf => {
    const root = gltf.scene;
    const animations = gltf.animations;
    logDumpObject(root);
    scene.add(root);
    keyDownEvent = e => {
      if (e.key == 'w') {
        mixer = startAnimation(root, animations, 'crate.006_low|Action');
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
