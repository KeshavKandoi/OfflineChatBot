/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import useReducedMotion from "../../hooks/useReducedMotion";

const NODE_TYPES = [
  { kind: "model", label: "Qwen2.5", color: "#8b5cf6", radius: 2.1, speed: 0.18, size: 0.16 },
  { kind: "model", label: "Qwen2.5-Coder", color: "#8b5cf6", radius: 2.1, speed: 0.14, size: 0.14 },
  { kind: "model", label: "MiniCPM-V", color: "#a78bfa", radius: 2.1, speed: 0.11, size: 0.15 },
  { kind: "doc", label: "PDF", color: "#34d399", radius: 2.9, speed: -0.09, size: 0.11 },
  { kind: "doc", label: "DOCX", color: "#34d399", radius: 2.9, speed: -0.12, size: 0.1 },
  { kind: "doc", label: "TXT", color: "#34d399", radius: 2.9, speed: -0.15, size: 0.09 },
  { kind: "memory", label: "Session", color: "#fbbf24", radius: 3.6, speed: 0.07, size: 0.13 },
  { kind: "memory", label: "Embeddings", color: "#fbbf24", radius: 3.6, speed: 0.055, size: 0.12 },
];

function CoreNode({ node, angleOffset, pulse }) {
  const ref = useRef();
  const angle = useRef(angleOffset);

  useFrame((_, delta) => {
    if (!ref.current) return;
    angle.current += node.speed * delta * pulse.current;
    const x = Math.cos(angle.current) * node.radius;
    const z = Math.sin(angle.current) * node.radius;
    const y = Math.sin(angle.current * 1.7 + angleOffset) * 0.35;
    ref.current.position.set(x, y, z);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[node.size, 24, 24]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={0.9}
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

function ConnectionLines({ count }) {
  const ref = useRef();
  const positions = useMemo(() => new Float32Array(count * 2 * 3), [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const a = t * 0.15 + i * 1.3;
      const r1 = 0.4;
      const r2 = 2.1 + (i % 3) * 0.7;
      positions[i * 6 + 0] = Math.cos(a) * r1;
      positions[i * 6 + 1] = 0;
      positions[i * 6 + 2] = Math.sin(a) * r1;
      positions[i * 6 + 3] = Math.cos(a * 1.4 + i) * r2;
      positions[i * 6 + 4] = Math.sin(a * 0.6 + i) * 0.3;
      positions[i * 6 + 5] = Math.sin(a * 1.4 + i) * r2;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#8b5cf6" transparent opacity={0.18} />
    </lineSegments>
  );
}

function CoreScene({ pointer, reducedMotion }) {
  const groupRef = useRef();
  const coreRef = useRef();
  const pulse = useRef(1);
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion) {
      const targetX = pointer.current.y * 0.25;
      const targetY = pointer.current.x * 0.35;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y + delta * 0.12) * 1;
    } else {
      groupRef.current.rotation.y += delta * 0.05;
    }

    if (coreRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.001) * 0.04;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#8b5cf6"
          emissiveIntensity={1.1}
          roughness={0.25}
          metalness={0.3}
          wireframe
        />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color="#0f0a1a"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          roughness={0.5}
        />
      </mesh>

      {!reducedMotion && <ConnectionLines count={10} />}

      {NODE_TYPES.map((node, i) => (
        <CoreNode key={node.label} node={node} angleOffset={(i / NODE_TYPES.length) * Math.PI * 2} pulse={pulse} />
      ))}

      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color="#a78bfa" />
      <pointLight position={[-3, -2, -3]} intensity={0.6} color="#34d399" />
    </group>
  );
}

export default function ComputeCore() {
  const pointer = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    function handlePointerMove(e) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current = { x, y };
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  if (!ready) return <div className="nx-core-fallback" aria-hidden="true" />;

  return (
    <div className="nx-core-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 7], fov: 42 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true }}
      >
        <CoreScene pointer={pointer} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
