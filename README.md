# Campus Unimet 3D - Centro Mundo X

Portafolio/experiencia interactiva 3D del campus universitario, inspirado en [Bruno Simon](https://bruno-simon.com).

## Características

- Navegación en 3D con un personaje controlable
- Física realista usando React Three Rapier
- Cámara en tercera persona que sigue suavemente al personaje
- Sistema preparado para cargar modelos GLTF/GLB de edificios
- Estilo visual lowpoly/estilizado

## Stack Técnico

- **React** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Three.js** - Motor 3D (via React Three Fiber)
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers y componentes útiles
- **@react-three/rapier** - Motor de física 3D

## Comandos

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Controles

- **Flechas** o **WASD** - Mover el personaje
- **Espacio** - Saltar

## Estructura del Proyecto

```
src/
├── components/
│   ├── Scene.tsx              # Escena principal con física y luces
│   ├── Player.tsx             # Personaje controlable
│   ├── Ground.tsx             # Terreno del campus
│   ├── CameraController.tsx   # Cámara tercera persona
│   └── Building.example.tsx   # Ejemplo para cargar modelos GLTF
├── hooks/
│   └── useKeyboard.ts         # Hook para controles de teclado
├── App.tsx                    # Componente principal
└── main.tsx                   # Entry point
```

## Cómo Agregar Edificios 3D

1. Coloca tus modelos `.gltf` o `.glb` en la carpeta `/public/models/`

2. Crea un componente para cada edificio (ver `Building.example.tsx`):

```tsx
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export function MiEdificio({ position = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/mi-edificio.glb')

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} position={position} castShadow receiveShadow />
    </RigidBody>
  )
}
```

3. Importa y usa el componente en `Scene.tsx`:

```tsx
import { MiEdificio } from './MiEdificio'

// Dentro del componente Physics:
<MiEdificio position={[10, 0, -10]} />
```

## Personalización

### Ajustar velocidad de movimiento

En `src/components/Player.tsx`:
```tsx
const MOVE_SPEED = 5  // Aumenta o disminuye este valor
const JUMP_FORCE = 5  // Fuerza del salto
```

### Ajustar posición de cámara

En `src/components/CameraController.tsx`:
```tsx
const CAMERA_OFFSET = new THREE.Vector3(0, 5, 10)  // [x, y, z]
```

### Cambiar colores del terreno

En `src/components/Ground.tsx`:
```tsx
<meshStandardMaterial color="#7cb342" />  // Cambia el color hexadecimal
```

## Roadmap

- [ ] Agregar modelos 3D de los edificios del campus
- [ ] Implementar sistema de carga de modelos
- [ ] Agregar interacciones con edificios (click para ver información)
- [ ] Optimizar performance con LOD (Level of Detail)
- [ ] Agregar mapa/minimap
- [ ] Agregar música/sonidos ambiente

## Inspiración

Este proyecto está inspirado en el portafolio de [Bruno Simon](https://bruno-simon.com), conocido por su innovador uso de Three.js para crear experiencias web 3D interactivas.

## Licencia

MIT
