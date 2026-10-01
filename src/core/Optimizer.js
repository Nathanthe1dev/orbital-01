export class PerformanceOptimizer {
  static configureRenderer(renderer) {
    // Cap pixel ratio to 1.5 to prevent GPU overload on 4K / Retina displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Optimize shadow maps if enabled
    renderer.shadowMap.autoUpdate = true;
  }

  static disposeObject(obj) {
    if (!obj) return;

    if (obj.geometry) {
      obj.geometry.dispose();
    }

    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => this.disposeMaterial(mat));
      } else {
        this.disposeMaterial(obj.material);
      }
    }
  }

  static disposeMaterial(material) {
    Object.keys(material).forEach((prop) => {
      if (material[prop] && typeof material[prop].dispose === 'function') {
        material[prop].dispose();
      }
    });
    material.dispose();
  }
}