import * as THREE from 'three';
import { eventBus } from './EventBus.js';

export function initRaycaster(camera, canvas, interactiveObjects) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check intersections against targets
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
      // Find root interactive parent object
      let target = intersects[0].object;
      while (target.parent && target.parent.type === 'Group' && !target.userData.name) {
        target = target.parent;
      }

      eventBus.emit('target:selected', target);
    }
  });
}