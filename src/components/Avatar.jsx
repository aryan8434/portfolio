import { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar(props) {
  const group = useRef();

  // 1. Load the model. Ensure 'wave.glb' is in your /public folder.
  const { scene, animations } = useGLTF("/wave.glb");

  // 2. Initialize animations linked to the group ref
  const { actions, names } = useAnimations(animations, group);

  // Center and scale the model
  useEffect(() => {
    if (scene) {
      // Calculate bounding box to center the model
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Calculate scale to fit in view (max dimension should be around 3-4 units)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 3 / maxDim : 1;
      
      // Center the model
      scene.position.x = -center.x * scale;
      scene.position.y = -center.y * scale;
      scene.position.z = -center.z * scale;
      scene.scale.set(scale, scale, scale);
      
      console.log("Model centered. Size:", size, "Scale:", scale, "Center:", center);
    }
  }, [scene]);

  useEffect(() => {
    // Log names to your console (F12) to verify the exact animation name
    console.log("Animations in file:", names);
    console.log("Model loaded successfully:", scene);

    if (names.length > 0 && actions[names[0]]) {
      // 3. Play the animation in a loop forever
      const waveAction = actions[names[0]];

      // 4. Configure: Loop forever
      waveAction.reset().setLoop(THREE.LoopRepeat).play();
    } else {
      console.log("No animations found in the model");
    }
  }, [actions, names, scene]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
