import * as THREE from 'three';

export function initSound(camera, scene, filePath = 'sound/sound.mp3') 
{
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load(filePath, function(buffer) 
  {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);

    // Wait for user gesture
    function resumeAudio() 
    {
      if (THREE.AudioContext.getContext().state === 'suspended') 
      {
        THREE.AudioContext.getContext().resume();
      }
      sound.play();
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    }

    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
  });

    //static sound at a specific position 
    const staticSound = new THREE.PositionalAudio(listener);
    audioLoader.load('sound/waterfall.mp3', function(buffer) 
    {
      staticSound.setBuffer(buffer);
      staticSound.setRefDistance(10);
      staticSound.setVolume(7);
      staticSound.setLoop(true);
      staticSound.position.set(260, 5, -230); 
      staticSound.play(); 
      scene.add(staticSound);
    });
}

