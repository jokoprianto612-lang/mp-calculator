import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Inner rotating geometry — stylized "O" form via torus + accent ring.
 */
function LogoCore({ hover }: { hover: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Auto-rotate
      groupRef.current.rotation.y += delta * (hover ? 1.2 : 0.5);
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.6;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.9;
      innerRef.current.rotation.z += delta * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={hover ? 1.1 : 1}>
      {/* Outer torus — the main "O" silhouette */}
      <mesh ref={torusRef} castShadow>
        <torusGeometry args={[0.7, 0.22, 32, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.5}
          roughness={0.1}
          chromaticAberration={0.05}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#76b900"
          attenuationColor="#9eff3a"
          attenuationDistance={1}
        />
     </mesh>

      {/* Inner icosahedron — the brand mark */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#76b900"
          emissive="#76b900"
          emissiveIntensity={hover ? 1.2 : 0.7}
          metalness={0.9}
          roughness={0.15}
        />
     </mesh>

      {/* Accent ring — decorative orbit */}
      <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.0, 0.015, 8, 64]} />
        <meshBasicMaterial color="#9eff3a" transparent opacity={0.55} />
     </mesh>
   </group>
  );
}

/**
 * OkongzINC 3D Logo — auto-rotating glass-green torus with inner icosahedron.
 * Lightweight: ~3 meshes, no postprocessing, transmission only on outer torus.
 *
 * @param size logo size in pixels (width + height)
 * @param interactive when true, hover speeds up rotation
 */
export interface OkongzINCLogoProps {
  size?: number;
  interactive?: boolean;
  className?: string;
}

export function OkongzINCLogo({
  size = 40,
  interactive = true,
  className = '',
}: OkongzINCLogoProps) {
  const [hover, setHover] = useState(false);

  // Memoize scene config to avoid re-creating lights per render
  const scene = useMemo(
    () => ({
      camera: { position: [0, 0, 2.6], fov: 45 },
      lights: [
        { type: 'ambient', intensity: 0.4 },
        { type: 'point', position: [2, 2, 2], intensity: 1.2, color: '#9eff3a' },
        { type: 'point', position: [-2, -1, 2], intensity: 0.8, color: '#76b900' },
      ],
    }),
    []
  );

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        cursor: interactive ? 'pointer' : 'default',
      }}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      data-testid="okongzinc-logo"
    >
      <Canvas
        camera={{ position: [0, 0, 2.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={scene.lights[0].intensity} />
        <pointLight
          position={scene.lights[1].position as [number, number, number]}
          intensity={scene.lights[1].intensity as number}
          color={scene.lights[1].color as string}
        />
        <pointLight
          position={scene.lights[2].position as [number, number, number]}
          intensity={scene.lights[2].intensity as number}
          color={scene.lights[2].color as string}
        />
        <Float
          speed={hover ? 2 : 1}
          rotationIntensity={hover ? 0.4 : 0.15}
          floatIntensity={hover ? 0.6 : 0.3}
        >
          <LogoCore hover={hover} />
       </Float>
        <Environment preset="city" />
     </Canvas>
   </div>
  );
}

export default OkongzINCLogo;
