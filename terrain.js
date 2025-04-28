// terrain.js
import * as THREE from 'three';

export let terrainMaterial;
export function loadTerrain(scene, manager, textureLoader) 
{
  textureLoader.load('./worldHM.jpg', (heightmapTexture) => 
  {
    // Set up canvas
    const heightmapCanvas = document.createElement('canvas');
    const context = heightmapCanvas.getContext('2d');
    heightmapCanvas.width = heightmapTexture.image.width;
    heightmapCanvas.height = heightmapTexture.image.height;
    context.drawImage(heightmapTexture.image, 0, 0);

    const imageData = context.getImageData(0, 0, heightmapCanvas.width, heightmapCanvas.height);
    const data = imageData.data;
    heightMapData.data = data;
    heightMapData.width = heightmapCanvas.width;
    heightMapData.height = heightmapCanvas.height;

    // Create geometry
    const terrainWidth = 700;
    const terrainHeight = 700;
    const widthSegments = 32;
    const heightSegments = 32;
    const terrainGeometry = new THREE.PlaneGeometry(terrainWidth, terrainHeight, widthSegments, heightSegments);
    const positions = terrainGeometry.attributes.position.array;

    for (let i = 0, l = positions.length / 3; i < l; i++) 
    {
      const u = (i % (widthSegments + 1)) / widthSegments;
      const v = Math.floor(i / (widthSegments + 1)) / heightSegments;
      const x = Math.floor(u * heightmapCanvas.width);
      const y = Math.floor(v * heightmapCanvas.height);
      const pixelIndex = (y * heightmapCanvas.width + x) * 4;
      const grayscale = data[pixelIndex];

      // Check if grayscale is a valid number before applying it:  error fix
      if (!isNaN(grayscale)) 
      {
        positions[i * 3 + 2] = grayscale * 0.55; // Apply the height modifier
      } 
      terrainGeometry.attributes.uv.array[i * 2] = u;
      terrainGeometry.attributes.uv.array[i * 2 + 1] = v;
    }

    terrainGeometry.computeVertexNormals();

  // Load textures
  const bedTexture = textureLoader.load('textures/shore.jpg');
  const shoreTexture = textureLoader.load('textures/grass.jpg');
  const normalMap = textureLoader.load('textures/grassNormal.jpg');

  bedTexture.wrapS = bedTexture.wrapT = THREE.RepeatWrapping;
  shoreTexture.wrapS = shoreTexture.wrapT = THREE.RepeatWrapping;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;


 /*
    //Lambert, not supporting multitexturin i guess, SUPPORTS LIGHT
    
    // Load textures
    heightmapTexture.wrapS = heightmapTexture.wrapT = THREE.RepeatWrapping;
    const terrainTexture = textureLoader.load('textures/grass.jpg');
    terrainTexture.wrapS = terrainTexture.wrapT = THREE.RepeatWrapping;
    terrainTexture.repeat.set(20, 20);

  const grassTexture = textureLoader.load('textures/grass.jpg');
  const sandTexture = textureLoader.load('textures/shore.jpg');

    const terrainMaterial = new THREE.MeshLambertMaterial({
      map: terrainTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.2, 0.2),
      wireframe: false,
    });
 */

// Custom ShaderMaterial
  terrainMaterial = new THREE.ShaderMaterial
  ({
    vertexShader: document.getElementById('terrainVertexShader').textContent,
    fragmentShader: document.getElementById('terrainFragmentShader').textContent,
    uniforms:
    {
      waterLevel: { value: 30 },
      bedTexture: { value: bedTexture },
      repeatFactor: { value: 30 }, // uv repeat
      shoreTexture: { value: shoreTexture },
      lightPosition: { value: new THREE.Vector3(0, 0, 0) },  // default light
    },
    transparent: false,
    //normalMap: normalMap,
    //normalScale: new THREE.Vector2(1.2, 1.2)
  });

    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);
  });
}

//for camera and boat collision
export let heightMapData = 
{
  data: null,
  width: 0,
  height: 0
};

export function getTerrainHeightAt(x, z, terrainWidth = 700, terrainHeight = 700, scale = 0.55) 
{
  if (!heightMapData.data) return 0;

  // Convert world coords to UV (0-1)
  const u = (x + terrainWidth / 2) / terrainWidth;
  const v = (z + terrainHeight / 2) / terrainHeight;

  if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

  const px = Math.floor(u * heightMapData.width);
  const py = Math.floor(v * heightMapData.height);
  const index = (py * heightMapData.width + px) * 4;

  const grayscale = heightMapData.data[index];// red channel
  return grayscale * scale;
}