import * as THREE from 'three';

export function createOrbitalTrajectories() {
  const trajectoriesGroup = new THREE.Group();

  // 1. Primary Orbit Ring around Kepler-186F
  const ringGeo = new THREE.RingGeometry(6.8, 6.85, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const orbitRing = new THREE.Mesh(ringGeo, ringMat);
  orbitRing.rotation.x = Math.PI / 2.3;
  orbitRing.position.set(7, -2, -12);
  trajectoriesGroup.add(orbitRing);

  // 2. Dynamic Ship Approach Path (3D Ellipse Curve)
  const curve = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    8.5, 4.2,        // xRadius, yRadius
    0, 2 * Math.PI,  // aStartAngle, aEndAngle
    false,           // aClockwise
    0                // aRotation
  );

  const points = curve.getPoints(100);
  const points3D = points.map(p => new THREE.Vector3(p.x, 0, p.y));
  const trajectoryGeo = new THREE.BufferGeometry().setFromPoints(points3D);

  const trajectoryMat = new THREE.LineDashedMaterial({
    color: 0x22c55e,
    dashSize: 0.4,
    gapSize: 0.2,
    transparent: true,
    opacity: 0.5,
  });

  const trajectoryLine = new THREE.Line(trajectoryGeo, trajectoryMat);
  trajectoryLine.computeLineDistances();
  trajectoryLine.position.set(0, -0.5, -4);
  trajectoryLine.rotation.x = 0.2;
  trajectoriesGroup.add(trajectoryLine);

  trajectoriesGroup.userData = {
    update: (elapsedTime) => {
      orbitRing.rotation.z = elapsedTime * 0.02;
      trajectoryLine.rotation.y = elapsedTime * 0.01;
    }
  };

  return trajectoriesGroup;
}