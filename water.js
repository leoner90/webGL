import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export function createShaderWater(scene, waterLvl) 
{
  const waterMaterial = new THREE.ShaderMaterial(
  {
    uniforms: 
    {
      waterColor: { value: new THREE.Vector3(0.2, 0.22, 1) },
      skyColor: { value: new THREE.Vector3(0.2, 0.6, 1.0) },
      t: { value: 0.0 }
    },
    vertexShader: document.getElementById('waterVertexShader').textContent,
    fragmentShader: document.getElementById('waterFragmentShader').textContent,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    depthTest: true,
    blending: THREE.NormalBlending
  });

  const loader = new OBJLoader();
  loader.load('./models/water.obj', (obj) => 
  {
    obj.traverse((child) => 
    {
      if (child instanceof THREE.Mesh) 
      {
        child.geometry.computeVertexNormals();
        const waterMesh = new THREE.Mesh(child.geometry, waterMaterial);
        waterMesh.position.y = waterLvl;
        waterMesh.scale.set(5.5, 1.5, 5.5);
        scene.add(waterMesh);
      }
    });
  });

  return waterMaterial;
}

export function createReflectiveWater(scene, waterLvl) 
{
  const waterGeometry = new THREE.PlaneGeometry(730, 750);
  const water = new Reflector(waterGeometry, 
  {
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: new THREE.Color(0x4466aa),
    clipBias: 0.003
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = waterLvl;

  // material
  
  water.material.transparent = true;
  water.material.opacity = 0.65;
  water.material.depthWrite = false;
  water.material.depthTest = true;
  water.material.blending = THREE.MultiplyBlending;

  scene.add(water);
  return water;
}