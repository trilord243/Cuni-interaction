import { forwardRef, useRef, useEffect, useMemo } from "react";
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
  const gltf = useGLTF("/CuniAnimacion.glb");
  const groupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(gltf.animations, groupRef);
  const wasMoving = useRef(false);

  // Clonar la escena para evitar conflictos
  const scene = useMemo(() => {
    return gltf.scene.clone(true);
  }, [gltf.scene]);

  // Habilitar sombras en el modelo del player
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!ref || typeof ref === "function" || !ref.current) return;

    const linvel = ref.current.linvel();
    const moveSpeed = new THREE.Vector2(linvel.x, linvel.z).length();
    const isMoving = moveSpeed > 0.1;

    // Obtener la acción de caminar
    const walkAction =
      actions["Walk"] ||
      actions["walk"] ||
      actions["WalkCycle"] ||
      actions["Armature|Walk"] ||
      Object.values(actions)[0];

    // Iniciar/detener animación de caminar
    if (isMoving && !wasMoving.current) {
      if (walkAction) {
        walkAction.reset().play();
      }
      wasMoving.current = true;
    } else if (!isMoving && wasMoving.current) {
      if (walkAction) {
        walkAction.stop();
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
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
});

Player.displayName = "Player";

// Preload model
useGLTF.preload("/CuniAnimacion.glb");
