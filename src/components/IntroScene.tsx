import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// Movimiento de cámara
function CameraAnimation() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Movimiento suave circular de la cámara
    camera.position.x = Math.sin(t * 0.2) * 3;
    camera.position.y = Math.cos(t * 0.15) * 1.5 + 1;
    camera.position.z = 10 + Math.sin(t * 0.1) * 2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Cubos flotantes animados
function FloatingCubes() {
  const cubesRef = useRef<THREE.Group>(null);

  const cubes = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 30; i++) {
      positions.push([
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20 - 5,
      ]);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (cubesRef.current) {
      cubesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={cubesRef}>
      {cubes.map((pos, i) => (
        <Float
          key={i}
          speed={0.5 + Math.random() * 1.5}
          rotationIntensity={0.5 + Math.random()}
          floatIntensity={0.5 + Math.random()}
        >
          <mesh position={pos} scale={0.2 + Math.random() * 0.4}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#F68629" : i % 3 === 1 ? "#003087" : "#1859A9"}
              metalness={0.7}
              roughness={0.2}
              emissive={i % 3 === 0 ? "#F68629" : "#003087"}
              emissiveIntensity={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Esfera distorsionada central
function DistortedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, -5]} scale={1.5}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color="#1859A9"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          emissive="#1859A9"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Anillos orbitando
function OrbitingRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5;
      ring1Ref.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = t * 0.3;
      ring2Ref.current.rotation.z = t * 0.4;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.6;
      ring3Ref.current.rotation.z = t * 0.2;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshStandardMaterial color="#F68629" metalness={0.9} roughness={0.1} emissive="#F68629" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3, 0.03, 16, 100]} />
        <meshStandardMaterial color="#003087" metalness={0.9} roughness={0.1} emissive="#003087" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[3.5, 0.03, 16, 100]} />
        <meshStandardMaterial color="#1859A9" metalness={0.9} roughness={0.1} emissive="#1859A9" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Múltiples Cunis flotando
function FloatingCunis() {
  const { scene } = useGLTF("/Cuni.glb");

  const positions = useMemo(() => [
    { pos: [4, -1, 2] as [number, number, number], scale: 1.2, speed: 0.5 },
    { pos: [-5, 1, -3] as [number, number, number], scale: 0.8, speed: 0.7 },
    { pos: [6, 2, -5] as [number, number, number], scale: 0.6, speed: 0.6 },
    { pos: [-4, -2, 0] as [number, number, number], scale: 1, speed: 0.8 },
  ], []);

  return (
    <>
      {positions.map((item, i) => (
        <Float key={i} speed={item.speed} rotationIntensity={0.3} floatIntensity={1}>
          <group position={item.pos} scale={item.scale}>
            <primitive object={scene.clone()} />
          </group>
        </Float>
      ))}
    </>
  );
}

// Partículas de fondo mejoradas
function Particles() {
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(800 * 3);
    for (let i = 0; i < 800; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 10;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#F68629"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

export function IntroScene() {
  return (
    <>
      {/* Animación de cámara */}
      <CameraAnimation />

      {/* Estrellas de fondo */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* Luces */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#F68629" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#003087" />
      <pointLight position={[0, 5, 5]} intensity={1} color="#ffffff" />
      <spotLight
        position={[0, 15, 10]}
        angle={0.4}
        penumbra={1}
        intensity={2}
        color="#F68629"
      />

      {/* Elementos 3D */}
      <FloatingCubes />
      <DistortedSphere />
      <OrbitingRings />
      <Particles />
      <FloatingCunis />

      {/* Fog para profundidad */}
      <fog attach="fog" args={["#0a0a1a", 15, 40]} />
    </>
  );
}

useGLTF.preload("/Cuni.glb");
