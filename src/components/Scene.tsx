import { useRef, useEffect, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useGLTF, ContactShadows, SoftShadows } from "@react-three/drei";
import { Player } from "./Player";
import { CameraController } from "./CameraController";
import { InvisibleWalls } from "./InvisibleWalls";
import * as THREE from "three";

// Datos de las zonas interactivas - exportado para usar en App.tsx
export const ZONE_DATA: Record<
  string,
  {
    name: string;
    title: string;
    description: string;
    emoji: string;
    radius: number;
  }
> = {
  SamanMadera: {
    name: "SamanMadera",
    title: "El Samán",
    emoji: "🌳",
    description:
      "Emblema arbóreo de la UNIMET. Este árbol es hijo del samán original de San Bernardino donde nació la universidad en 1970. Sembrado en 1976, representa 'inquietud, convivencia y honor' según el Himno de la UNIMET.",
    radius: 25,
  },
  EMG: {
    name: "EMG",
    title: "Edificio Eugenio Mendoza",
    emoji: "🏛️",
    description:
      "Nombrado en honor al fundador de la universidad, Don Eugenio Mendoza Goiticoa. Aquí se forman los ingenieros del mañana en las áreas de Producción, Química, Eléctrica, Mecánica y Computación.",
    radius: 45,
  },
  Biblioteca: {
    name: "Biblioteca",
    title: "Biblioteca Pedro Grases",
    emoji: "📚",
    description:
      "Inaugurada en 1983, lleva el nombre del bibliógrafo que donó más de 70,000 volúmenes. Es la biblioteca #1 de Venezuela según rankings del sector. ¡Un templo del conocimiento!",
    radius: 35,
  },
  CirculoCruz: {
    name: "CirculoCruz",
    title: "Cromoestructura Cruz-Diez",
    emoji: "🎨",
    description:
      "Obra monumental del artista cinético Carlos Cruz-Diez, donada antes de su muerte en 2019. Dos semicírculos de aluminio de 3.5m de altura que juegan con la luz y el color.",
    radius: 20,
  },
};

// Componente para el entorno completo del campus
function Entorno({
  onObjectsFound,
}: {
  onObjectsFound: (objects: Map<string, THREE.Vector3>) => void;
}) {
  const { scene } = useGLTF("/Entorno.glb");

  // Clonar la escena para evitar conflictos con IntroScene que usa el mismo modelo
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    return clone;
  }, [scene]);

  useEffect(() => {
    const objectPositions = new Map<string, THREE.Vector3>();

    clonedScene.traverse((child) => {
      // Habilitar sombras en todos los meshes
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      const zoneNames = Object.keys(ZONE_DATA);
      for (const zoneName of zoneNames) {
        if (child.name.includes(zoneName)) {
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          objectPositions.set(zoneName, worldPos);
          console.log(`Found ${zoneName} at:`, worldPos);
        }
      }
    });

    onObjectsFound(objectPositions);
  }, [clonedScene, onObjectsFound]);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={clonedScene} position={[0, 1.5, 0]} />
    </RigidBody>
  );
}

useGLTF.preload("/Entorno.glb");

interface SceneProps {
  onZoneChange?: (zone: string | null) => void;
  cinematicMode?: boolean;
  onCinematicEnd?: () => void;
}

export function Scene({ onZoneChange, cinematicMode = true, onCinematicEnd }: SceneProps) {
  const playerRef = useRef<RapierRigidBody>(null);
  const [objectPositions, setObjectPositions] = useState<
    Map<string, THREE.Vector3>
  >(new Map());
  const prevNearbyZone = useRef<string | null>(null);

  // Detectar proximidad a zonas
  useFrame(() => {
    if (!playerRef.current) return;

    const currentPlayerPos = playerRef.current.translation();

    let closestZone: string | null = null;
    let closestDistance = Infinity;

    // Buscar la zona más cercana
    for (const [zoneName, zonePos] of objectPositions.entries()) {
      const zoneData = ZONE_DATA[zoneName];
      if (!zoneData) continue;

      const distance = Math.sqrt(
        Math.pow(currentPlayerPos.x - zonePos.x, 2) +
          Math.pow(currentPlayerPos.z - zonePos.z, 2)
      );

      if (distance < zoneData.radius && distance < closestDistance) {
        closestZone = zoneName;
        closestDistance = distance;
      }
    }

    // Notificar cambio de zona
    if (closestZone !== prevNearbyZone.current) {
      onZoneChange?.(closestZone);
      prevNearbyZone.current = closestZone;
    }
  });

  return (
    <>
      {/* Soft shadows para sombras más realistas */}
      <SoftShadows size={25} samples={16} focus={0.5} />

      {/* Lights */}
      <ambientLight intensity={3} />
      <hemisphereLight args={["#87CEEB", "#3d2817", 1]} />
      <directionalLight
        castShadow
        position={[50, 80, 30]}
        intensity={3}
        color="#fff5e6"
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* Contact shadows para sombras suaves en el suelo */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={100}
        blur={2}
        far={50}
      />

      {/* Physics world */}
      <Physics gravity={[0, -9.81, 0]}>
        {/* Entorno completo del campus */}
        <Entorno onObjectsFound={setObjectPositions} />

        <Player ref={playerRef} />

        {/* Barreras invisibles para evitar caídas */}
        <InvisibleWalls size={50} height={10} />
      </Physics>

      {/* Camera controller */}
      <CameraController target={playerRef} cinematicMode={cinematicMode} onCinematicEnd={onCinematicEnd} />
    </>
  );
}
