import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function initPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);

  // 1. Render Pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 2. Unreal Bloom Pass
  const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
  const bloomPass = new UnrealBloomPass(
    resolution,
    0.8,  // Strength
    0.4,  // Radius
    0.25  // Threshold (low value = more elements glow)
  );
  composer.addPass(bloomPass);

  return {
    composer,
    bloomPass,
    toggleBloom: () => {
      bloomPass.enabled = !bloomPass.enabled;
      return bloomPass.enabled;
    },
    setIntensity: (value) => {
      bloomPass.strength = value;
    },
    resize: (width, height) => {
      composer.setSize(width, height);
      bloomPass.resolution.set(width, height);
    }
  };
}