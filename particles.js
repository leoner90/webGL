import * as THREE from 'three';

export function createLeafParticles(scene, manager, waterLvl, initPosition = { x: 0, y: 0, z: 0 }) 
{
  const leafTexture = new THREE.TextureLoader(manager).load('textures/leaf.png');

  const leafCount = 50;
  const leafGeometry = new THREE.BufferGeometry();

  const positions = [];
  const velocities = [];


  for (let i = 0; i < leafCount; i++) 
  {
    const x = initPosition.x + (Math.random() - 0.5) * 5;
    const y = initPosition.y + (Math.random() - 0.5) * 5;
    const z = initPosition.z + (Math.random() - 0.5) * 5;

    positions.push(x, y, z);
 
    velocities.push((Math.random()  * 2 - 1) * 0.05);
    velocities.push(-(Math.random() * 0.004 + 0.05));
    velocities.push((Math.random()  * 2 - 1) * 0.05);
  }

  leafGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  leafGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

  const leafMaterial = new THREE.PointsMaterial(
  {
    size: 0.35,
    map: leafTexture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    alphaTest: 0.1,
    blending: THREE.AdditiveBlending,
  });

  const leafParticles = new THREE.Points(leafGeometry, leafMaterial);
  leafParticles.frustumCulled = false;
  scene.add(leafParticles);

  const posAttr = leafParticles.geometry.attributes.position;
  const velAttr = leafParticles.geometry.attributes.velocity;

  function animateLeaves() 
  {
    for (let i = 0; i < posAttr.count; i++) {
      posAttr.array[i * 3 + 0] += velAttr.array[i * 3 + 0]; // x
      posAttr.array[i * 3 + 1] += velAttr.array[i * 3 + 1]; // y
      posAttr.array[i * 3 + 2] += velAttr.array[i * 3 + 2]; // z

      //reset if <30 waterLVL
      if (posAttr.array[i * 3 + 1] < 30) 
      {
        posAttr.array[i * 3 + 1] = 90 + Math.random() * 10; // not init position, let's say it's a wind :)
      }
    }
 
    posAttr.needsUpdate = true;
  }

  return animateLeaves; 
}