import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// Movimiento de cámara centrada en Cuni
function CameraAnimation() {
  const { camera } = useThree();
  const cuniPosition = useMemo(() => new THREE.Vector3(0, 0, 6), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Movimiento suave circular de la cámara alrededor de Cuni
    camera.position.x = Math.sin(t * 0.15) * 2;
    camera.position.y = Math.cos(t * 0.1) * 0.5 + 0.5;
    camera.position.z = 10 + Math.sin(t * 0.08) * 1;
    // Siempre mirando a Cuni
    camera.lookAt(cuniPosition);
  });

  return null;
}

// Regalos navideños flotantes (cubos)
function FloatingGifts() {
  const giftsRef = useRef<THREE.Group>(null);

  const gifts = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 20; i++) {
      positions.push([
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 20 - 5,
      ]);
    }
    return positions;
  }, []);

  const colors = ["#ff0000", "#00aa00", "#ffd700", "#ff0000", "#ffffff"];

  useFrame((state) => {
    if (giftsRef.current) {
      giftsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={giftsRef}>
      {gifts.map((pos, i) => (
        <Float
          key={i}
          speed={0.3 + Math.random()}
          rotationIntensity={0.3 + Math.random() * 0.5}
          floatIntensity={0.5 + Math.random()}
        >
          <mesh position={pos} scale={0.2 + Math.random() * 0.3}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              metalness={0.3}
              roughness={0.4}
              emissive={colors[i % colors.length]}
              emissiveIntensity={0.15}
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

// Cuni animado caminando - centrado
function AnimatedCuni() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/CuniAnimacion.glb");
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    // Buscar y reproducir la animación de caminar
    const walkAction =
      actions["Walk"] ||
      actions["walk"] ||
      actions["WalkCycle"] ||
      actions["Armature|Walk"] ||
      Object.values(actions)[0];

    if (walkAction) {
      walkAction.setLoop(THREE.LoopRepeat, Infinity);
      walkAction.play();
    }
  }, [actions]);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotación suave para que se vea desde diferentes ángulos
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, -0.2, 6]} scale={0.4}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

// Copos de nieve cayendo
function Snowflakes() {
  const snowRef = useRef<THREE.Points>(null);

  const snowflakes = useMemo(() => {
    const positions = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 40 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (snowRef.current) {
      const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 1500; i++) {
        positions[i * 3 + 1] -= 0.02 + Math.random() * 0.02; // Caer
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002; // Movimiento lateral

        // Reset cuando llega abajo
        if (positions[i * 3 + 1] < -15) {
          positions[i * 3 + 1] = 25;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={snowRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[snowflakes, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// Esferas navideñas flotando
function ChristmasOrnaments() {
  const ornaments = useMemo(() => [
    { pos: [-6, 3, -2], color: "#ff0000", scale: 0.4 },
    { pos: [5, 4, -4], color: "#00ff00", scale: 0.35 },
    { pos: [-4, -2, -3], color: "#ffd700", scale: 0.45 },
    { pos: [7, 1, -5], color: "#ff0000", scale: 0.3 },
    { pos: [-7, 0, -1], color: "#00ff00", scale: 0.4 },
    { pos: [4, -3, -2], color: "#ffd700", scale: 0.35 },
    { pos: [-3, 5, -6], color: "#ff0000", scale: 0.5 },
    { pos: [6, -1, -3], color: "#00ff00", scale: 0.4 },
  ], []);

  return (
    <>
      {ornaments.map((item, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={item.pos as [number, number, number]} scale={item.scale}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={item.color}
              metalness={0.9}
              roughness={0.1}
              emissive={item.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Entorno flotando en el fondo
function FloatingEntorno() {
  const { scene } = useGLTF("/Entorno.glb");
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      // Rotación lenta
      groupRef.current.rotation.y = t * 0.05;
      // Movimiento flotante
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.5 - 8;
    }
  });

  return (
    <group ref={groupRef} position={[0, -8, -25]} scale={0.15}>
      <primitive object={scene} />
    </group>
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

      {/* Elementos 3D navideños */}
      <FloatingEntorno />
      <FloatingGifts />
      <DistortedSphere />
      <OrbitingRings />
      <Snowflakes />
      <ChristmasOrnaments />
      <AnimatedCuni />

      {/* Fog navideño (azul oscuro) */}
      <fog attach="fog" args={["#0a1628", 20, 50]} />
    </>
  );
}

useGLTF.preload("/CuniAnimacion.glb");
useGLTF.preload("/Entorno.glb");
