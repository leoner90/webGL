import * as THREE from 'three';
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

export class Player 
{
  constructor(scene, paddlingUrl, idleUrl, paddleUrl, position = { x: 0, y: 0, z: 0 }, scale = 0.1) 
  {
    this.scene = scene;
    this.model = null;
    this.paddle = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.velocity = new THREE.Vector3();

    this.loadCharacter(paddlingUrl, idleUrl, position, scale, paddleUrl);
  }

  loadCharacter(paddlingUrl, idleUrl, position, scale, paddleUrl) 
  {
    const loader = new FBXLoader();

    // Load the paddling model (with skeleton and mesh)
    loader.load(paddlingUrl, (fbx) => {
      this.model = fbx;
      this.model.position.set(position.x, position.y, position.z);
      this.model.scale.set(scale, scale, scale);
      this.scene.add(this.model);

      // Create an animation mixer for controlling animations
      this.mixer = new THREE.AnimationMixer(this.model);

      // Load paddling animation
      const paddlingAnimation = fbx.animations[0];
      this.animations['paddling'] = this.mixer.clipAction(paddlingAnimation);

      // Load the idle animation (no skeleton)
      this.loadIdleAnimation(idleUrl);

      // Attach paddle to hand
      this.loadPaddle(paddleUrl);
    });
  }

  loadIdleAnimation(idleUrl) 
  {
    const loader = new FBXLoader();
    loader.load(idleUrl, (fbx) => 
      {
 
      /*print Bone Names
      this.model.traverse((child) => {
        if (child.isBone) {
          console.log('Bone found:', child.name);
        }
      });
      */

      // Only the animation part is needed, as it doesn't contain a mesh
      const idleAnimation = fbx.animations[0];
      const action = this.mixer.clipAction(idleAnimation);
      this.animations['idle'] = action;

      // Play the idle animation by default
      if (!this.currentAction) {
        this.playAnimation('idle');
      }
    });
  }

  loadPaddle(paddleUrl) 
  {
    // Ensure paddleUrl is a string
    if (typeof paddleUrl !== 'string' || paddleUrl.trim() === '') {
      console.error('Invalid paddleUrl provided:', paddleUrl);
      return;
    }
  
    const loader = new FBXLoader();
  
    // Load the paddle
    loader.load(paddleUrl, (fbx) => {
      this.paddle = fbx;
      this.paddle.scale.set(6000, 6000, 6000);
      this.paddle.visible = true;
  
      // Attach the paddle to the character's hand
      this.attachPaddleToHand();
    })
  }

  attachPaddleToHand() {
    if (this.model && this.paddle) {
      // Find the right hand bone
      const handBone = this.model.getObjectByName('mixamorigRightHand'); // 'mixamorig:RightHand' bone name
      if (handBone) {
        // Attach the paddle to the hand bone
        this.paddle.position.set(0, 0, 0); //position relative to the hand bone
        this.paddle.rotation.set(Math.PI / 2, Math.PI, 0); // the paddle's rotation

        handBone.add(this.paddle); // Attach paddle to the hand bone
      }  
    }
  }

  playAnimation(name) {
    if (this.animations[name]) {
      // Fade out the previous animation if one is playing
      if (this.currentAction) {
        this.currentAction.fadeOut(0.2);
      }

      // Switch and play the new animation
      this.currentAction = this.animations[name];
      this.currentAction.reset().fadeIn(0.2).play();
    }
  }

  update(delta) {
    if (this.model) {
      // Update animation
      if (this.mixer) {
        this.mixer.update(delta);
      }
    }
  }

  // Check if a specific animation is playing
  isAnimationPlaying(animationName) {
    if (this.mixer) {
      const action = this.mixer.clipAction(animationName);
      if (action && action.isRunning()) {
        return true; // playing
      }
    }
    return false; // not playing
  }
}
