import { forwardRef, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useKeyboard } from "../hooks/useKeyboard";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";

const MOVE_SPEED = 5;
const SPRINT_SPEED = 12;

export const Player = forwardRef<RapierRigidBody, object>((_props, ref) => {
  const keys = useKeyboard();
  const walkGltf = useGLTF("/CuniAnimacion.glb");
  const idleGltf = useGLTF("/IdleCuni.glb");
  const groupRef = useRef<THREE.Group>(null);
  const { actions: walkActions } = useAnimations(walkGltf.animations, groupRef);
  const { actions: idleActions } = useAnimations(idleGltf.animations, groupRef);
  const wasMoving = useRef(false);

  // Habilitar sombras en el modelo del player
  useEffect(() => {
    idleGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [idleGltf.scene]);

  // Start with idle animation
  useEffect(() => {
    const idleAction = Object.values(idleActions)[0];
    if (idleAction) {
      idleAction.play();
    }
  }, [idleActions]);

  useFrame(() => {
    if (!ref || typeof ref === "function" || !ref.current) return;

    // Debug: mostrar posición del jugador
    // const pos = ref.current.translation();
    // console.log(
    //   `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`
    // );

    const linvel = ref.current.linvel();
    const moveSpeed = new THREE.Vector2(linvel.x, linvel.z).length();
    const isMoving = moveSpeed > 0.1;

    // Switch animations based on movement with crossfade
    const FADE_DURATION = 0.2;

    if (isMoving && !wasMoving.current) {
      // Started moving - crossfade to walk
      const idleAction = Object.values(idleActions)[0];
      const walkAction =
        walkActions["Walk"] ||
        walkActions["walk"] ||
        walkActions["WalkCycle"] ||
        walkActions["Armature|Walk"] ||
        Object.values(walkActions)[0];

      if (walkAction && idleAction) {
        walkAction.reset().fadeIn(FADE_DURATION).play();
        idleAction.fadeOut(FADE_DURATION);
      } else if (walkAction) {
        walkAction.reset().play();
      }
      wasMoving.current = true;
    } else if (!isMoving && wasMoving.current) {
      // Stopped moving - crossfade to idle
      const walkAction =
        walkActions["Walk"] ||
        walkActions["walk"] ||
        walkActions["WalkCycle"] ||
        walkActions["Armature|Walk"] ||
        Object.values(walkActions)[0];
      const idleAction = Object.values(idleActions)[0];

      if (idleAction && walkAction) {
        idleAction.reset().fadeIn(FADE_DURATION).play();
        walkAction.fadeOut(FADE_DURATION);
      } else if (idleAction) {
        idleAction.reset().play();
      }
      wasMoving.current = false;
    }

    // Keyboard control
    const currentSpeed = keys.sprint ? SPRINT_SPEED : MOVE_SPEED;
    const impulse = { x: 0, y: 0, z: 0 };

    if (keys.forward) impulse.z -= currentSpeed;
    if (keys.backward) impulse.z += currentSpeed;
    if (keys.left) impulse.x -= currentSpeed;
    if (keys.right) impulse.x += currentSpeed;

    ref.current.setLinvel(
      {
        x: impulse.x,
        y: linvel.y,
        z: impulse.z,
      },
      true
    );

    // Rotate towards movement direction
    if (groupRef.current && (impulse.x !== 0 || impulse.z !== 0)) {
      const angle = Math.atan2(impulse.x, impulse.z);
      groupRef.current.rotation.y = angle;
    }
  });

  return (
    <RigidBody
      ref={ref}
      colliders={false}
      mass={1}
      type="dynamic"
      position={[1, 6, 20]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.75, 0.75]} position={[0, 1.5, 0]} />
      <group ref={groupRef} scale={1.2}>
        <primitive object={idleGltf.scene} />
      </group>
    </RigidBody>
  );
});

Player.displayName = "Player";

// Preload models for better performance
useGLTF.preload("/CuniAnimacion.glb");
useGLTF.preload("/IdleCuni.glb");
