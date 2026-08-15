/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";

function CoreMesh() {
  const outerRef = useRef();
  const innerRef = useRef();
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.4;
      outerRef.current.rotation.x += delta * 0.15;
    }
    if (innerRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.0015) * 0.06;
      innerRef.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#8b5cf6"
          emissiveIntensity={1.1}
          wireframe
          roughness={0.3}
        />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#120f17"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          roughness={0.5}
        />
      </mesh>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={1.4} color="#a78bfa" />
      <pointLight position={[-2, -1, -2]} intensity={0.5} color="#34d399" />
    </>
  );
}

export default function MiniCore() {
  return (
    <div className="nx-mini-core-canvas" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} gl={{ antialias: true, alpha: true }}>
        <CoreMesh />
      </Canvas>
    </div>
  );
}
