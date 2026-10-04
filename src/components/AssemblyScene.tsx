"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, PerspectiveCamera, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Mode = "feed" | "forming";
type Point = [number, number, number];

const steel = "#aebbbc";
const brightSteel = "#d1dbd9";
const darkSteel = "#455358";
const fastener = "#e6e9e5";
const caramel = "#c78348";
const filling = "#f0d7aa";
const belt = "#aa332c";
const wheelX = -0.65;
const beltZ = 0.15;
const wheelGap = 0.15;
const wheelRadius = 0.32;
const wheelNearZ = beltZ + wheelRadius + wheelGap / 2;
const wheelFarZ = beltZ - wheelRadius - wheelGap / 2;

function path(points: Point[]) {
  return new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)), false, "centripetal");
}

const productPaths = [
  path([
    [0.65, 0.66, -0.48],
    [0.78, 0.6, -0.33],
    [0.97, 0.61, -0.04],
    [1.07, 0.62, 0.15],
  ]),
  path([
    [1.75, 0.66, -0.48],
    [1.76, 0.6, -0.27],
    [1.68, 0.61, 0.05],
    [1.41, 0.62, 0.15],
  ]),
];

function Box({
  position,
  size,
  color = steel,
  metalness = 0.65,
}: {
  position: Point;
  size: Point;
  color?: string;
  metalness?: number;
}) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={Math.min(...size) * 0.11}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshPhysicalMaterial color={color} metalness={metalness} roughness={0.3} clearcoat={0.14} />
    </RoundedBox>
  );
}

function Pipe({
  points,
  color = steel,
  radius = 0.035,
  opacity = 1,
}: {
  points: Point[];
  color?: string;
  radius?: number;
  opacity?: number;
}) {
  const curve = useMemo(() => path(points), [points]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 40, radius, 8, false]} />
      <meshPhysicalMaterial
        color={color}
        metalness={opacity === 1 ? 0.8 : 0.1}
        roughness={opacity === 1 ? 0.24 : 0.18}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

const framePipes: Point[][] = [
  [[-2.52, -1.38, 0.84], [-2.52, -0.13, 0.84], [-2.49, -0.02, 0.84], [-2.38, 0.03, 0.84], [-2.2, 0.03, 0.84], [2.2, 0.03, 0.84], [2.4, 0.03, 0.84], [2.5, -0.03, 0.84], [2.52, -0.13, 0.84], [2.52, -1.38, 0.84]],
  [[-2.52, -1.38, -0.84], [-2.52, -0.13, -0.84], [-2.49, -0.02, -0.84], [-2.38, 0.03, -0.84], [-2.2, 0.03, -0.84], [2.2, 0.03, -0.84], [2.4, 0.03, -0.84], [2.5, -0.03, -0.84], [2.52, -0.13, -0.84], [2.52, -1.38, -0.84]],
  [[-2.52, -1.31, 0.84], [-2.52, -1.31, -0.84]],
  [[2.52, -1.31, 0.84], [2.52, -1.31, -0.84]],
  [[-2.52, 0.03, 0.84], [-2.52, 0.03, -0.84]],
  [[2.52, 0.03, 0.84], [2.52, 0.03, -0.84]],
  [[0.05, 0.03, -0.84], [0.05, 1.96, -0.84]],
  [[2.52, 0.03, -0.84], [2.52, 1.96, -0.84]],
];

const tankProfile = [
  new THREE.Vector2(0.1, 0.68),
  new THREE.Vector2(0.145, 0.73),
  new THREE.Vector2(0.39, 1.12),
  new THREE.Vector2(0.39, 1.15),
  new THREE.Vector2(0.395, 1.19),
  new THREE.Vector2(0.395, 1.98),
  new THREE.Vector2(0.405, 2.01),
  new THREE.Vector2(0.405, 2.09),
  new THREE.Vector2(0.39, 2.1),
];

const airHoses: Point[][] = [
  [[-1.3, -0.92, -0.52], [-0.7, -0.68, -0.68], [0.05, -0.62, -0.87], [0.04, 1.26, -0.91], [0.14, 2.08, -0.83], [0.41, 2.25, -0.39]],
  [[-1.3, -0.92, -0.52], [0.45, -0.85, -0.9], [2.5, -0.28, -0.9], [2.64, 1.72, -0.9], [2.4, 2.16, -0.72], [1.99, 2.25, -0.39]],
];

function RibbedHose({ points }: { points: Point[] }) {
  const curve = useMemo(() => path(points), [points]);
  const ribs = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!ribs.current) return;
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const normal = new THREE.Vector3(0, 0, 1);
    for (let index = 0; index < 64; index += 1) {
      const t = (index + 0.5) / 64;
      rotation.setFromUnitVectors(normal, curve.getTangent(t).normalize());
      matrix.compose(curve.getPoint(t), rotation, new THREE.Vector3(1, 1, 1));
      ribs.current.setMatrixAt(index, matrix);
    }
    ribs.current.instanceMatrix.needsUpdate = true;
    ribs.current.computeBoundingSphere();
  }, [curve]);

  return (
    <group>
      <mesh castShadow>
        <tubeGeometry args={[curve, 100, 0.044, 10, false]} />
        <meshPhysicalMaterial color="#eb791b" roughness={0.42} metalness={0.08} />
      </mesh>
      <instancedMesh ref={ribs} args={[undefined, undefined, 64]} castShadow>
        <torusGeometry args={[0.044, 0.0045, 5, 12]} />
        <meshStandardMaterial color="#fa9232" roughness={0.48} />
      </instancedMesh>
    </group>
  );
}

function Hopper({ x, highlighted }: { x: number; highlighted: boolean }) {
  return (
    <group position={[x, 0, -0.48]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[tankProfile, 48]} />
        <meshPhysicalMaterial color={highlighted ? "#dce7e4" : "#bfcaca"} metalness={0.75} roughness={0.26} clearcoat={0.16} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.07, 0]} castShadow>
        <cylinderGeometry args={[0.405, 0.405, 0.18, 36]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.83} roughness={0.24} />
      </mesh>
      {[1.14, 1.97].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[0.412, 0.412, 0.085, 36]} />
            <meshPhysicalMaterial color="#879798" metalness={0.86} roughness={0.24} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, y + side * 0.047, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.413, 0.012, 8, 36]} />
              <meshStandardMaterial color={fastener} metalness={0.84} roughness={0.23} />
            </mesh>
          ))}
          {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => (
            <group key={angle} rotation={[0, angle, 0]}>
              <Box position={[0, y, 0.44]} size={[0.13, 0.075, 0.08]} color={brightSteel} metalness={0.85} />
              <mesh position={[0, y, 0.488]}>
                <sphereGeometry args={[0.027, 10, 8]} />
                <meshStandardMaterial color={fastener} metalness={0.88} roughness={0.21} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.67, 0]} castShadow>
        <cylinderGeometry args={[0.115, 0.115, 0.14, 24]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.85} roughness={0.23} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.12, 24]} />
        <meshStandardMaterial color={darkSteel} metalness={0.76} roughness={0.28} />
      </mesh>
      {[-0.24, 0.24].map((offset) => (
        <group key={offset} position={[offset, 0, 0.09]}>
          <mesh position={[0, 2.24, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.23, 16]} />
            <meshPhysicalMaterial color={brightSteel} metalness={0.86} roughness={0.23} />
          </mesh>
          <mesh position={[0, 2.37, 0]} castShadow>
            <cylinderGeometry args={[0.086, 0.086, 0.05, 16]} />
            <meshStandardMaterial color={darkSteel} metalness={0.76} roughness={0.26} />
          </mesh>
        </group>
      ))}
      <Box position={[0, 1.52, 0.393]} size={[0.2, 0.32, 0.038]} color="#a8b7b7" metalness={0.83} />
      <Box position={[0, 1.25, 0.397]} size={[0.22, 0.13, 0.06]} color={brightSteel} metalness={0.83} />
      <Pipe points={[[0.31, 1.93, 0.25], [0.45, 1.93, 0.25], [0.49, 1.9, 0.25]]} radius={0.028} color={brightSteel} />
      <mesh position={[0.49, 1.9, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.054, 0.054, 0.065, 16]} />
        <meshStandardMaterial color={darkSteel} metalness={0.7} roughness={0.27} />
      </mesh>
    </group>
  );
}

function FeedManifold({ highlighted }: { highlighted: boolean }) {
  return (
    <group position={[1.24, 0, beltZ]}>
      {[-0.18, 0.18].map((x) => (
        <mesh key={x} position={[x, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.082, 0.082, 0.09, 20]} />
          <meshPhysicalMaterial color={brightSteel} metalness={0.87} roughness={0.23} />
        </mesh>
      ))}
      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.07, 32]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.86} roughness={0.22} />
      </mesh>
      <Pipe points={[[-0.17, 0.61, 0], [-0.075, 0.54, 0], [0, 0.48, 0]]} color={caramel} radius={0.037} opacity={highlighted ? 1 : 0.75} />
      <Pipe points={[[0.17, 0.61, 0], [0.075, 0.54, 0], [0, 0.48, 0]]} color={filling} radius={0.026} opacity={highlighted ? 1 : 0.75} />
      <mesh position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.175, 0.175, 0.19, 32]} />
        <meshPhysicalMaterial color="#bdd2d1" metalness={0.1} roughness={0.12} transparent opacity={0.33} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.475, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.035, 32]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.87} roughness={0.23} />
      </mesh>
      <mesh position={[0, 0.39, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.075, 0.16, 32]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.84} roughness={0.23} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.068, 0.085, 24]} />
        <meshPhysicalMaterial color="#758689" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.231, 0]}>
        <sphereGeometry args={[0.054, 16, 12]} />
        <meshStandardMaterial color={caramel} roughness={0.39} />
      </mesh>
    </group>
  );
}

function FormingWheel({
  position,
  highlighted,
  wheelRef,
}: {
  position: Point;
  highlighted: boolean;
  wheelRef: React.RefObject<THREE.Group | null>;
}) {
  const shape = useMemo(() => {
    const outline = new THREE.Shape();
    const teeth = 16;
    for (let i = 0; i < teeth * 4; i += 1) {
      const angle = (i / (teeth * 4)) * Math.PI * 2;
      const radius = i % 4 === 1 || i % 4 === 2 ? wheelRadius : 0.265;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) outline.moveTo(x, y);
      else outline.lineTo(x, y);
    }
    outline.closePath();
    return outline;
  }, []);

  return (
    <group position={position}>
      <group ref={wheelRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <extrudeGeometry
            args={[shape, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }]}
          />
          <meshPhysicalMaterial color={highlighted ? "#435052" : "#2b3438"} metalness={0.62} roughness={0.36} clearcoat={0.18} />
        </mesh>
        <mesh position={[0, 0.154, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.192, 0.009, 8, 32]} />
          <meshStandardMaterial color="#7c898a" metalness={0.83} roughness={0.24} />
        </mesh>
        {Array.from({ length: 16 }, (_, index) => {
          const angle = (index / 16) * Math.PI * 2;
          return (
            <mesh
              key={`die-${index}`}
              position={[Math.cos(angle) * 0.275, 0.144, Math.sin(angle) * 0.275]}
              castShadow
            >
              <cylinderGeometry args={[0.038, 0.038, 0.012, 12]} />
              <meshStandardMaterial color="#172125" metalness={0.32} roughness={0.5} />
            </mesh>
          );
        })}
        {Array.from({ length: 6 }, (_, index) => {
          const angle = (index / 6) * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 0.18, 0.157, Math.sin(angle) * 0.18]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshStandardMaterial color={fastener} metalness={0.82} roughness={0.23} />
            </mesh>
          );
        })}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.065, 24]} />
          <meshStandardMaterial color={darkSteel} metalness={0.76} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.24, 16]} />
          <meshStandardMaterial color={brightSteel} metalness={0.85} roughness={0.21} />
        </mesh>
      </group>
      <Box position={[0, -0.23, 0]} size={[0.42, 0.06, 0.39]} color={steel} />
      <mesh position={[0, -0.52, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.56, 16]} />
        <meshStandardMaterial color={darkSteel} metalness={0.75} roughness={0.27} />
      </mesh>
    </group>
  );
}

function DriveGear({
  position,
  radius,
  gearRef,
}: {
  position: Point;
  radius: number;
  gearRef: React.RefObject<THREE.Group | null>;
}) {
  const shape = useMemo(() => {
    const outline = new THREE.Shape();
    const teeth = 24;
    for (let index = 0; index < teeth * 4; index += 1) {
      const angle = (index / (teeth * 4)) * Math.PI * 2;
      const r = index % 4 === 1 || index % 4 === 2 ? radius : radius * 0.9;
      if (index === 0) outline.moveTo(r, 0);
      else outline.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    outline.closePath();
    return outline;
  }, [radius]);

  return (
    <group position={position} ref={gearRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <extrudeGeometry args={[shape, { depth: 0.075, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 }]} />
        <meshPhysicalMaterial color="#9caba9" metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.084, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.045, 24]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.85} roughness={0.23} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius * 0.65, 0.083, Math.sin(angle) * radius * 0.65]}>
            <cylinderGeometry args={[0.017, 0.017, 0.008, 10]} />
            <meshStandardMaterial color="#55666a" metalness={0.84} roughness={0.28} />
          </mesh>
        );
      })}
    </group>
  );
}

function Candy({ candyRef }: { candyRef: (node: THREE.Group | null) => void }) {
  return (
    <group ref={candyRef} position={[wheelX - 0.3, 0.29, beltZ]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.21, 16]} />
        <meshStandardMaterial color={caramel} roughness={0.37} metalness={0.03} />
      </mesh>
      {[-0.112, 0.112].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.052, 0.052, 0.01, 16]} />
            <meshStandardMaterial color={filling} roughness={0.51} />
          </mesh>
          <mesh position={[x > 0 ? 0.007 : -0.007, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.058, 0.017, 8, 16]} />
            <meshStandardMaterial color="#df9a58" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MovingLine({ active, running }: { active: Mode; running: boolean }) {
  const wheelNear = useRef<THREE.Group>(null);
  const wheelFar = useRef<THREE.Group>(null);
  const driveNear = useRef<THREE.Group>(null);
  const driveMotor = useRef<THREE.Group>(null);
  const candies = useRef<(THREE.Group | null)[]>([]);
  const flow = useRef<(THREE.Mesh | null)[]>([]);
  const beltMarks = useRef<(THREE.Mesh | null)[]>([]);
  const ropeRings = useRef<(THREE.Mesh | null)[]>([]);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!running) return;
    elapsed.current += Math.min(delta, 0.05);
    const t = elapsed.current;
    if (wheelNear.current) wheelNear.current.rotation.y = t * 2.5;
    if (wheelFar.current) wheelFar.current.rotation.y = -t * 2.5;
    if (driveNear.current) driveNear.current.rotation.y = t * 2.5;
    if (driveMotor.current) driveMotor.current.rotation.y = -t * 2.5;

    candies.current.forEach((candy, index) => {
      if (candy) candy.position.x = wheelX - 0.34 - ((t * 0.58 + index * 0.29) % 1.17);
    });
    beltMarks.current.forEach((mark, index) => {
      if (mark) mark.position.x = 2.24 - ((t * 0.72 + index * 0.47) % 4.48);
    });
    ropeRings.current.forEach((ring, index) => {
      if (ring) ring.position.x = 1.1 - ((t * 0.72 + index * 0.41) % 1.68);
    });
    flow.current.forEach((bead, index) => {
      if (!bead) return;
      const curve = productPaths[Math.floor(index / 4)];
      bead.position.copy(curve.getPoint((t * 0.42 + (index % 4) * 0.25) % 1));
    });
  });

  return (
    <>
      <mesh position={[0.225, 0.28, beltZ]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.072, 0.072, 1.94, 16]} />
        <meshStandardMaterial color={caramel} roughness={0.37} />
      </mesh>
      <mesh position={[1.2, 0.28, beltZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
        <meshStandardMaterial color={filling} roughness={0.51} />
      </mesh>
      {Array.from({ length: 4 }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => { ropeRings.current[index] = node; }}
          position={[1.1 - index * 0.41, 0.28, beltZ]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <torusGeometry args={[0.073, 0.005, 6, 16]} />
          <meshStandardMaterial color="#edb27e" roughness={0.4} />
        </mesh>
      ))}
      {productPaths.map((curve, index) => (
        <group key={index}>
          <mesh>
            <tubeGeometry args={[curve, 40, 0.033, 10, false]} />
            <meshStandardMaterial color={index === 0 ? caramel : filling} roughness={0.4} emissive={index === 0 ? "#794026" : "#6d593c"} emissiveIntensity={active === "feed" ? 0.2 : 0.06} />
          </mesh>
          <mesh>
            <tubeGeometry args={[curve, 40, 0.054, 10, false]} />
            <meshStandardMaterial color={brightSteel} metalness={0.15} roughness={0.18} transparent opacity={0.16} depthWrite={false} />
          </mesh>
          {Array.from({ length: 4 }, (_, bead) => (
            <mesh
              key={bead}
              ref={(node) => { flow.current[index * 4 + bead] = node; }}
              position={curve.getPoint(bead / 4)}
            >
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshStandardMaterial color={index === 0 ? caramel : filling} emissive={index === 0 ? "#9b4524" : "#8a6945"} emissiveIntensity={active === "feed" ? 0.2 : 0.07} />
            </mesh>
          ))}
        </group>
      ))}
      <FormingWheel position={[wheelX, 0.29, wheelFarZ]} highlighted={active === "forming"} wheelRef={wheelFar} />
      <FormingWheel position={[wheelX, 0.29, wheelNearZ]} highlighted={active === "forming"} wheelRef={wheelNear} />
      <DriveGear position={[wheelX, -0.17, wheelNearZ]} radius={0.31} gearRef={driveNear} />
      <DriveGear position={[0.31, -0.17, wheelNearZ]} radius={0.17} gearRef={driveMotor} />
      <Pipe points={[[-0.65, -0.185, 0.79], [0.31, -0.185, 0.79]]} color="#242e31" radius={0.025} />
      <Pipe points={[[-0.65, -0.185, 0.34], [0.31, -0.185, 0.34]]} color="#242e31" radius={0.025} />
      <Box position={[0.31, -0.15, 0.57]} size={[0.17, 0.065, 0.24]} color={steel} />
      <Box position={[0.42, -0.075, 0.57]} size={[0.18, 0.19, 0.18]} color={darkSteel} />
      {Array.from({ length: 4 }, (_, index) => (
        <Candy key={index} candyRef={(node) => { candies.current[index] = node; }} />
      ))}
      {Array.from({ length: 10 }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => { beltMarks.current[index] = node; }}
          position={[2.24 - index * 0.47, 0.201, -0.23]}
        >
          <boxGeometry args={[0.08, 0.006, 0.02]} />
          <meshStandardMaterial color="#d97a65" roughness={0.57} />
        </mesh>
      ))}
    </>
  );
}

function Caster({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -1.4, z]}>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.058, 0.058, 0.3, 16]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.85} roughness={0.24} />
      </mesh>
      {[-0.1, 0.1].map((side) => (
        <Box key={side} position={[0, -0.015, side]} size={[0.17, 0.21, 0.035]} color={steel} metalness={0.83} />
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.17, 24]} />
        <meshStandardMaterial color="#374246" metalness={0.22} roughness={0.55} />
      </mesh>
      {[-0.092, 0.092].map((side) => (
        <mesh key={side} position={[0, 0, side]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.064, 0.064, 0.015, 16]} />
          <meshPhysicalMaterial color={brightSteel} metalness={0.88} roughness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function Assembly({ active, running }: { active: Mode; running: boolean }) {
  return (
    <group scale={[0.96, 1.1, 0.96]}>
      <Box position={[0, -0.28, 0]} size={[5.2, 0.14, 1.76]} color="#a5b1b1" metalness={0.82} />
      <Box position={[0, -1.25, 0]} size={[5.06, 0.08, 1.69]} color="#829091" metalness={0.81} />
      <Box position={[-1.91, -0.77, 0]} size={[1.28, 0.9, 1.55]} color="#849294" metalness={0.78} />
      <Box position={[-1.91, -0.77, 0.78]} size={[1.22, 0.85, 0.028]} color="#738082" metalness={0.78} />
      <Box position={[-2.49, -0.78, 0.78]} size={[0.022, 0.86, 0.05]} color={brightSteel} />
      <Box position={[-1.31, -0.78, 0.78]} size={[0.022, 0.86, 0.05]} color={brightSteel} />
      {[-2.39, -1.43].map((x) =>
        [-1.12, -0.46].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 0.807]}>
            <cylinderGeometry args={[0.018, 0.018, 0.008, 10]} />
            <meshStandardMaterial color={fastener} metalness={0.88} roughness={0.24} />
          </mesh>
        )),
      )}
      <mesh position={[-2.33, -0.84, 0.806]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.03, 24]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.87} roughness={0.24} />
      </mesh>
      <Box position={[0.47, -0.73, 0]} size={[3.74, 0.055, 1.59]} color="#9eaaa9" metalness={0.77} />
      <Box position={[0.47, -0.69, 0.79]} size={[3.74, 0.025, 0.034]} color={brightSteel} metalness={0.84} />
      <Box position={[0.31, -0.88, -0.78]} size={[3.42, 0.72, 0.085]} color="#768687" metalness={0.76} />
      <Box position={[0.42, -0.59, 0.01]} size={[0.08, 0.65, 1.62]} color="#9aa8a8" metalness={0.79} />
      <Box position={[0, -0.31, 0.87]} size={[5.19, 0.05, 0.045]} color={brightSteel} metalness={0.86} />
      <Box position={[0, -1.2, 0.84]} size={[5.02, 0.055, 0.045]} color={brightSteel} metalness={0.84} />
      {framePipes.map((points, index) => (
        <Pipe key={index} points={points} color={steel} radius={0.055} />
      ))}
      {[-2.4, 2.4].map((x) =>
        [-0.74, 0.74].map((z) => (
          <Caster key={`${x}-${z}`} x={x} z={z} />
        )),
      )}

      <Box position={[0, 0.12, beltZ]} size={[4.48, 0.16, 0.92]} color={darkSteel} />
      <Box position={[0, 0.195, beltZ]} size={[4.43, 0.022, 0.83]} color={belt} metalness={0.13} />
      {[-2.21, 2.21].map((x) => (
        <mesh key={`belt-return-${x}`} position={[x, 0.115, beltZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.117, 0.117, 0.85, 24]} />
          <meshStandardMaterial color={belt} metalness={0.1} roughness={0.58} />
        </mesh>
      ))}
      {[-0.38, 0.69].map((z) => (
        <Box key={z} position={[0, 0.265, z]} size={[4.58, 0.09, 0.06]} color={brightSteel} />
      ))}
      {[-2.25, 2.25].map((x) => (
        <mesh key={x} position={[x, 0.11, beltZ]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 1.02, 24]} />
          <meshStandardMaterial color={steel} metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
      <Box position={[2.36, -0.11, -0.4]} size={[0.28, 0.29, 0.25]} color={darkSteel} />
      <Box position={[-2.37, -0.1, -0.4]} size={[0.28, 0.29, 0.25]} color={darkSteel} />
      {[-1.7, -0.6, 0.7, 1.8].map((x) => (
        <group key={x}>
          <Box position={[x, 0.155, 0.73]} size={[0.055, 0.16, 0.08]} color={brightSteel} metalness={0.85} />
          <mesh position={[x, 0.26, 0.73]}>
            <sphereGeometry args={[0.027, 10, 8]} />
            <meshStandardMaterial color={fastener} metalness={0.85} roughness={0.23} />
          </mesh>
        </group>
      ))}

      <Hopper x={0.65} highlighted={active === "feed"} />
      <Hopper x={1.75} highlighted={active === "feed"} />
      {[1.14, 1.94].map((y) => (
        <group key={y}>
          <Box position={[0.16, y, -0.67]} size={[0.25, 0.075, 0.33]} color={brightSteel} />
          <Box position={[2.34, y, -0.67]} size={[0.38, 0.075, 0.33]} color={brightSteel} />
        </group>
      ))}
      <FeedManifold highlighted={active === "feed"} />
      <Box position={[1.78, 0.47, -0.69]} size={[0.43, 0.44, 0.15]} color="#aab6b5" metalness={0.81} />
      {[-0.16, 0.16].map((x) =>
        [-0.15, 0.15].map((y) => (
          <mesh key={`${x}-${y}`} position={[1.78 + x, 0.47 + y, -0.608]}>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshStandardMaterial color={fastener} metalness={0.85} roughness={0.23} />
          </mesh>
        )),
      )}
      {airHoses.map((points, index) => (
        <RibbedHose key={index} points={points} />
      ))}
      {[0.13, 0.82, 1.5].map((y) => (
        <Box key={y} position={[2.64, y, -0.9]} size={[0.13, 0.07, 0.13]} color={steel} metalness={0.78} />
      ))}

      <mesh position={[-1.32, -0.9, 0.13]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.31, 0.31, 1.03, 28]} />
        <meshPhysicalMaterial color="#cbd4d1" metalness={0.78} roughness={0.28} />
      </mesh>
      {[-1.86, -0.78].map((x) => (
        <mesh key={x} position={[x, -0.9, 0.13]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.33, 0.33, 0.045, 28]} />
          <meshPhysicalMaterial color={steel} metalness={0.85} roughness={0.23} />
        </mesh>
      ))}
      <Box position={[-1.32, -0.585, 0.13]} size={[0.37, 0.05, 0.33]} color={brightSteel} metalness={0.82} />
      <RibbedHose points={[[-0.92, -0.83, 0.37], [-0.61, -0.81, 0.49], [-0.12, -0.96, 0.48], [0.55, -0.95, 0.47]]} />
      <Box position={[0.06, -0.55, 0.33]} size={[1.42, 0.17, 0.28]} color="#d0d9d6" metalness={0.67} />
      {[-0.35, 0.06, 0.47].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.98, 0.33]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.35, 20]} />
            <meshPhysicalMaterial color="#e3e8e5" metalness={0.42} roughness={0.31} />
          </mesh>
          <mesh position={[x, -0.76, 0.33]}>
            <cylinderGeometry args={[0.15, 0.15, 0.07, 20]} />
            <meshStandardMaterial color={steel} metalness={0.78} roughness={0.27} />
          </mesh>
        </group>
      ))}
      <Box position={[-0.55, -0.56, 0.38]} size={[0.31, 0.35, 0.36]} color={darkSteel} />
      <mesh position={[-0.65, -0.37, 0.38]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.07, 32]} />
        <meshPhysicalMaterial color={brightSteel} metalness={0.83} roughness={0.23} />
      </mesh>
      <MovingLine active={active} running={running} />
    </group>
  );
}

function SceneCamera() {
  const { size } = useThree();
  const narrow = size.width < 360;
  const mobile = size.width < 560;
  return (
    <PerspectiveCamera
      makeDefault
      position={narrow ? [-4.5, 3.3, 8.8] : mobile ? [-4.4, 2.9, 8.2] : [-4.2, 2.75, 7.5]}
      fov={narrow ? 52 : mobile ? 44 : size.width < 900 ? 48 : 36}
      near={0.1}
      far={80}
    />
  );
}

export default function AssemblyScene({ active, running }: { active: Mode; running: boolean }) {
  return (
    <Canvas
      aria-label="Анимированная 3D-линия: два бункера подают компоненты к соплу, жгут проходит между парными колесами, изделия отводятся по конвейеру"
      role="img"
      dpr={[1, 1.8]}
      frameloop={running ? "always" : "demand"}
      camera={{ position: [-4.2, 2.75, 7.5], fov: 36, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      shadows
      fallback={<p>Трёхмерная визуализация недоступна в этом браузере.</p>}
    >
      <color attach="background" args={["#18252b"]} />
      <Environment resolution={256} environmentIntensity={1.05}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 5]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[-4, 2, -3]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#f5d2b5" position={[5, 3, 1]} scale={[2, 5, 1]} />
      </Environment>
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#eaf3f0", "#34434b", 1.25]} />
      <directionalLight position={[1, 7, 5]} intensity={2.65} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -3]} intensity={1.05} color="#efba8a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.77, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.18} />
      </mesh>
      <SceneCamera />
      <Assembly active={active} running={running} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={0.55}
        maxPolarAngle={1.42}
        minAzimuthAngle={-1.15}
        maxAzimuthAngle={1.15}
        target={[0, 0.38, 0]}
      />
    </Canvas>
  );
}
