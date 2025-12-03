# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start development server (Vite)
npm run build   # TypeScript compile + Vite production build
npm run lint    # Run ESLint
npm run preview # Preview production build
```

## Architecture

This is a 3D interactive campus experience built with React Three Fiber. The application features a guided tour mode where a character automatically moves between waypoints, and a free exploration mode where users control movement directly.

### Core Components

- **App.tsx**: Root component managing popup state and tour mode transitions (auto/guided → free mode)
- **Scene.tsx**: Main 3D scene containing physics world, buildings, waypoints, and orchestrating the guided tour via `useGuidedTour` hook
- **Player.tsx**: Character controller with two movement modes:
  - Guided mode: Automatically moves toward target waypoints using velocity-based physics
  - Free mode: WASD/arrow key control with animation support (loads `CuniAnimacion.glb`)
- **CameraController.tsx**: Third-person camera that smoothly follows the player using lerp interpolation
- **GuidedTour.tsx**: Hook-based waypoint navigation system managing tour state and transitions
- **Building.tsx**: Generic GLTF model loader with physics colliders (RigidBody + CuboidCollider)

### Key Patterns

- Physics via `@react-three/rapier` - all collidable objects wrapped in `RigidBody`
- Models loaded with `useGLTF` from `/public` directory (GLB format)
- Tour waypoints defined in `Scene.tsx` as `TOUR_WAYPOINTS` array
- State lifted to App.tsx for popup display; Scene communicates via callbacks (`onZoneEnter`, `onZoneExit`)
- Camera offset constants in `CameraController.tsx`: `CAMERA_OFFSET` for position, `LERP_FACTOR` for smoothness
- Movement speeds defined at top of `Player.tsx`: `GUIDED_MOVE_SPEED` and `FREE_MOVE_SPEED`

### Adding New Buildings

1. Place `.glb` model in `/public/`
2. Use the `Building` component in `Scene.tsx`:
```tsx
<Building
  modelPath="/ModelName.glb"
  position={[x, y, z]}
  scale={0.25}
  colliderSize={[width, height, depth]}
/>
```

### Controls

- **Guided Tour**: Close popup to advance to next waypoint
- **Free Mode**: WASD/Arrow keys to move
