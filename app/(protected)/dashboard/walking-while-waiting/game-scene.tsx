"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Cloud, Instances, Instance } from "@react-three/drei";
import { useState, useMemo, memo, useRef } from "react";
import * as THREE from "three";

// --- Constants ---
const CHUNK_SIZE = 40;
const CHUNK_LENGTH = 6; 
const SIDE_CHUNKS = 2; 
const BASE_SPEED = 5;
const DAY_DURATION = 180000; 
const SEASON_DURATION = 300000; 

// --- Noise Helper ---
const P = new Uint8Array(256);
for (let i = 0; i < 256; i++) P[i] = i;
for (let i = 0; i < 255; i++) {
  const r = i + ~~(Math.random() * (256 - i));
  const t = P[i]; P[i] = P[r]; P[r] = t;
}
const PERM = new Uint8Array(512);
for (let i = 0; i < 512; i++) PERM[i] = P[i & 255];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t: number, a: number, b: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function noise(x: number, y: number) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const A = PERM[X] + Y, B = PERM[X + 1] + Y;
  return lerp(v, lerp(u, grad(PERM[A], x, y, 0), grad(PERM[B], x - 1, y, 0)),
             lerp(u, grad(PERM[A + 1], x, y - 1, 0), grad(PERM[B + 1], x - 1, y - 1, 0)));
}

function randomDet(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// --- Path & Terrain Logic ---

function getElevation(x: number, z: number, seed: number) {
    const base = noise(x * 0.01, z * 0.01 + seed) * 10; 
    const detail = noise(x * 0.03, z * 0.03 + seed) * 2;
    return base + detail;
}

function getMainPathX(z: number, seed: number) {
  const n1 = noise(z * 0.002, seed) * 80;
  const n2 = noise(z * 0.0005, seed + 100) * 200;
  return n1 + n2;
}

function getAnyPathX(z: number, x: number, seed: number) {
    const mainX = getMainPathX(z, seed);
    
    const intersectionSpacing = 150; 
    const bucket = Math.floor(z / intersectionSpacing);
    
    const h = Math.sin(bucket * 12.9898 + seed * 78.233) * 43758.5453;
    const bucketRand = h - Math.floor(h); 
    
    if (bucketRand > 0.4) { 
        const startZ = bucket * intersectionSpacing;
        const progress = z - startZ;
        if (progress > 0 && progress < 120) {
            const dir = bucketRand > 0.7 ? 1 : -1;
            const branchX = getMainPathX(startZ, seed) + (progress * 0.8 * dir);
            
            if (Math.abs(x - branchX) < Math.abs(x - mainX)) {
                return branchX;
            }
        }
    }
    return mainX;
}

function getPathWidth(z: number, seed: number) {
  return 8 + (noise(z * 0.005, seed + 500) + 1) * 6; 
}

// --- Types ---
type Season = "spring" | "summer" | "autumn" | "winter";
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

const SEASON_COLORS = {
  spring: { ground: "#5c8f42", tree: "#82b84c", wood: "#8b5a2b", flower: "#ff69b4", path: "#8b7355" },
  summer: { ground: "#3a6b2e", tree: "#2d5a1e", wood: "#654321", flower: "#ff0000", path: "#7c6a4a" },
  autumn: { ground: "#8b6b2e", tree: "#d97d26", wood: "#5c4033", flower: "#d2691e", path: "#5d4a35" },
  winter: { ground: "#e5e5e5", tree: "#ffffff", wood: "#4a3728", flower: "#ffffff", path: "#dcdcdc" },
};

// --- Components ---
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

function generateTreeStructure(x: number, y: number, z: number, scale: number, seed: number) {
    const woods = [];
    const leaves = [];
    
    let r = randomDet(seed);
    const nextR = () => { r = randomDet(r * 1000); return r; };

    const trunkHeight = 2.5 + nextR() * 2.5; 
    const trunkWidth = 0.3 + nextR() * 0.2;
    
    woods.push({
        pos: [x, y + (trunkHeight * scale * 0.5), z], 
        scale: [trunkWidth * scale, trunkHeight * scale, trunkWidth * scale],
        rot: [0, 0, 0]
    });

    const canopyBaseY = y + (trunkHeight * scale) * 0.8; 
    const mainSize = (1.5 + nextR()) * scale;
    leaves.push({
        pos: [x, canopyBaseY + (mainSize * 0.5), z],
        scale: [mainSize, mainSize * 0.8, mainSize],
        rot: [0, 0, 0]
    });

    const numSideBlocks = 3 + Math.floor(nextR() * 2);
    for(let i=0; i<numSideBlocks; i++) {
        const angle = (i / numSideBlocks) * Math.PI * 2 + (nextR() * 0.5);
        const offset = 0.6 * mainSize * 0.5;
        const sideSize = 0.7 * mainSize;

        leaves.push({
            pos: [
                x + Math.cos(angle) * offset, 
                canopyBaseY + (mainSize * 0.4), 
                z + Math.sin(angle) * offset
            ],
            scale: [sideSize, sideSize * 0.8, sideSize],
            rot: [0, nextR(), 0]
        });
    }

    leaves.push({
        pos: [x, canopyBaseY + mainSize * 0.8, z],
        scale: [mainSize * 0.6, mainSize * 0.5, mainSize * 0.6],
        rot: [0, nextR(), 0]
    });

    return { woods, leaves };
}

// --- Chihuahua Component ---
const Dog = ({ cameraZ, seed }: { cameraZ: number, seed: number }) => {
  const group = useRef<THREE.Group>(null);
  const frontLeft = useRef<THREE.Mesh>(null);
  const frontRight = useRef<THREE.Mesh>(null);
  const backLeft = useRef<THREE.Mesh>(null);
  const backRight = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  const blackMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.7 }), []);
  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#222222", emissiveIntensity: 0.1 }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // --- Position Logic ---
    const distanceOffset = 10 + Math.sin(t * 0.3) * 3; 
    const targetZ = cameraZ - distanceOffset;
    const targetX = getMainPathX(targetZ, seed); 
    const targetY = getElevation(targetX, targetZ, seed);

    // Determine Look Target (Forward)
    const lookAheadZ = targetZ - 2.0; 
    const lookAheadX = getMainPathX(lookAheadZ, seed);
    const lookAheadY = getElevation(lookAheadX, lookAheadZ, seed);

    if (group.current) {
        // Smoothly move to position
        group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.1);
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.1);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY + 0.25, 0.2); 
        
        // Look at the future point
        group.current.lookAt(lookAheadX, lookAheadY + 0.25, lookAheadZ);
    }

    // --- Animation Logic ---
    const speed = 14; // Trot
    if (frontLeft.current) frontLeft.current.rotation.x = Math.sin(t * speed) * 0.5;
    if (frontRight.current) frontRight.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.5;
    if (backLeft.current) backLeft.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.5;
    if (backRight.current) backRight.current.rotation.x = Math.sin(t * speed) * 0.5;
    
    if (tail.current) tail.current.rotation.y = Math.sin(t * 20) * 0.8; // Wagging
    
    // Head looks slightly around
    if (head.current) {
        head.current.rotation.z = Math.sin(t * 1.5) * 0.05; 
        head.current.rotation.y = Math.sin(t * 0.5) * 0.1; 
    }
  });

  return (
    <group ref={group}>
        {/* Light under the dog for visibility, especially at night */}
        <pointLight position={[0, -0.1, 0]} distance={6} intensity={1.2} color="#ffffff" />

        {/* Body */}
        <mesh material={blackMaterial} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.4]} />
        </mesh>
        
        {/* Head Group - Head at +Z (Front of model relative to movement) */}
        <group ref={head} position={[0, 0.35, 0.2]}>
            {/* Head Main */}
            <mesh material={blackMaterial} castShadow>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
            </mesh>
            {/* Snout */}
            <mesh material={blackMaterial} position={[0, -0.04, 0.1]} castShadow>
                <boxGeometry args={[0.08, 0.06, 0.08]} />
            </mesh>
            {/* Small Ears */}
            <mesh material={blackMaterial} position={[-0.06, 0.11, 0]} rotation={[0, 0, 0.3]} castShadow>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
            </mesh>
            <mesh material={blackMaterial} position={[0.06, 0.11, 0]} rotation={[0, 0, -0.3]} castShadow>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
            </mesh>
            {/* Eyes */}
             <mesh material={eyeMaterial} position={[-0.05, 0.01, 0.091]}>
                <boxGeometry args={[0.03, 0.03, 0.01]} />
            </mesh>
             <mesh material={eyeMaterial} position={[0.05, 0.01, 0.091]}>
                <boxGeometry args={[0.03, 0.03, 0.01]} />
            </mesh>
        </group>

        {/* Legs */}
        <group position={[-0.07, 0.15, 0.15]}>
            <mesh ref={frontLeft} material={blackMaterial} position={[0, -0.12, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[0.07, 0.15, 0.15]}>
            <mesh ref={frontRight} material={blackMaterial} position={[0, -0.12, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[-0.07, 0.15, -0.15]}>
            <mesh ref={backLeft} material={blackMaterial} position={[0, -0.12, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[0.07, 0.15, -0.15]}>
            <mesh ref={backRight} material={blackMaterial} position={[0, -0.12, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>

        {/* Small Tail */}
        <group ref={tail} position={[0, 0.28, -0.2]}>
             <mesh material={blackMaterial} position={[0, 0.05, -0.02]} rotation={[-0.6, 0, 0]} castShadow>
                <boxGeometry args={[0.02, 0.12, 0.02]} />
            </mesh>
        </group>
    </group>
  )
}

const GroundChunk = memo(({ xOffset, zOffset, materials, seed }: { xOffset: number, zOffset: number, materials: any, seed: number }) => {
  
  const { woodInstances, leafInstances, flowerInstances, rockInstances, pathInstances, groundInstances } = useMemo(() => {
    const w = [];
    const l = [];
    const f = [];
    const r = [];
    const p = []; 
    const g = [];
    
    const STEP = 4; 
    
    for (let x = -CHUNK_SIZE / 2; x < CHUNK_SIZE / 2; x += STEP) { 
      for (let z = -CHUNK_SIZE / 2; z < CHUNK_SIZE / 2; z += STEP) {
        const globalX = x + xOffset;
        const globalZ = z + zOffset;
        
        const y = getElevation(globalX, globalZ, seed);
        
        g.push({
            pos: [x, y - 2, z], 
            scale: [STEP, 4, STEP], 
            rot: [0, 0, 0]
        });

        const pathX = getAnyPathX(globalZ, globalX, seed);
        const pathWidth = getPathWidth(globalZ, seed);
        const distToPath = Math.abs(globalX - pathX);
        const isPath = distToPath < pathWidth / 2;
        
        if (isPath) {
             if (Math.random() > 0.2) {
                 const pHeight = 0.05 + Math.random() * 0.1;
                 p.push({
                     // Lift path slightly more to prevent Z-fighting
                     pos: [x, y + pHeight/2 + 0.05, z], 
                     scale: [2.5, pHeight, 2.5],
                     rot: [0, Math.random() * 0.5, 0]
                 });
             }
        } else {
             const density = noise(globalX * 0.04, globalZ * 0.04);
             const groundNoise = noise(globalX * 0.1, globalZ * 0.1);

             if (groundNoise > 0.2 && Math.random() > 0.7) {
                 const gHeight = 0.1 + Math.random() * 0.2;
                 g.push({
                     pos: [x, y + gHeight/2 + 0.02, z], 
                     scale: [1.5, gHeight, 1.5], 
                     rot: [0, Math.random(), 0]
                 });
             }

             if (density > 0.1) {
                  const treeSeed = globalX * 761 + globalZ * 924;
                  const scale = 1.5 + randomDet(treeSeed) * 2.0;
                  
                  const structure = generateTreeStructure(x, y, z, scale, treeSeed);
                  w.push(...structure.woods);
                  l.push(...structure.leaves);
             } 
             else if (Math.random() > 0.8) {
                 if (Math.random() > 0.5) {
                     f.push([x, y, z]);
                 } else {
                     r.push([x, y, z]);
                 }
             }
        }
      }
    }
    return { woodInstances: w, leafInstances: l, flowerInstances: f, rockInstances: r, pathInstances: p, groundInstances: g };
  }, [xOffset, zOffset, seed]);

  return (
    <group position={[xOffset, 0, zOffset]}>
      
      <Instances range={groundInstances.length} material={materials.ground} geometry={boxGeometry} frustumCulled={false}>
         {groundInstances.map((t, i) => (
             <Instance key={i} position={t.pos as any} scale={t.scale as any} />
         ))}
      </Instances>

      <Instances range={pathInstances.length} material={materials.path} geometry={boxGeometry} frustumCulled={false}>
          {pathInstances.map((t, i) => (
               <Instance key={i} position={t.pos as any} scale={t.scale as any} rotation={t.rot as any} />
          ))}
      </Instances>

      <Instances range={woodInstances.length} material={materials.wood} geometry={boxGeometry} frustumCulled={false}>
         {woodInstances.map((t, i) => (
             <Instance key={i} position={t.pos as any} scale={t.scale as any} />
         ))}
      </Instances>

      <Instances range={leafInstances.length} material={materials.leaf} geometry={boxGeometry} frustumCulled={false}>
         {leafInstances.map((t, i) => (
             <Instance key={i} position={t.pos as any} scale={t.scale as any} rotation={t.rot as any} />
         ))}
      </Instances>

      <Instances range={flowerInstances.length} material={materials.flower} geometry={boxGeometry} frustumCulled={false}>
          {flowerInstances.map((pos, i) => (
               <Instance key={i} position={[pos[0], pos[1] + 0.2, pos[2]]} scale={[0.2, 0.2, 0.2]} />
          ))}
      </Instances>

      <Instances range={rockInstances.length} material={materials.rock} geometry={boxGeometry} frustumCulled={false}>
          {rockInstances.map((pos, i) => (
               <Instance key={i} position={[pos[0], pos[1] + 0.1, pos[2]]} scale={[0.4, 0.3, 0.4]} rotation={[0, Math.random(), 0]} />
          ))}
      </Instances>
    </group>
  );
});
GroundChunk.displayName = 'GroundChunk';

const CustomStars = ({ opacity }: { opacity: number }) => {
  const points = useRef<THREE.Points>(null);
  const starGeo = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for(let i=0; i<count; i++) {
      const r = 300 + Math.random() * 200; 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (points.current) {
      points.current.rotation.y += 0.0002;
      (points.current.material as THREE.PointsMaterial).opacity = opacity;
    }
  });
  return <points ref={points} geometry={starGeo}><pointsMaterial size={1.5} sizeAttenuation={false} color="white" transparent opacity={opacity} fog={false} /></points>;
};

const CelestialBody = ({ position, color, scale, intensity }: { position: [number, number, number], color: string, scale: number, intensity: number }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[scale, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight intensity={intensity} distance={200} color={color} />
    </group>
  );
};

const EnvironmentController = ({ materials, setSkyInfo }: { materials: any, setSkyInfo: any }) => {
  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000;
    
    const seasonProgress = (time % SEASON_DURATION) / SEASON_DURATION;
    const seasonIndex = Math.floor(time / SEASON_DURATION) % SEASONS.length;
    const nextIndex = (seasonIndex + 1) % SEASONS.length;
    
    const c1 = SEASON_COLORS[SEASONS[seasonIndex]];
    const c2 = SEASON_COLORS[SEASONS[nextIndex]];

    const dayProgress = (time % DAY_DURATION) / DAY_DURATION; 
    
    const NIGHT_COLOR = new THREE.Color("#010115"); 
    const DAWN_HORIZON = new THREE.Color("#ff8844"); 
    const DAWN_SKY = new THREE.Color("#603080"); 
    const DAY_COLOR = new THREE.Color("#4499ff"); 
    const DUSK_HORIZON = new THREE.Color("#ff5500"); 
    const DUSK_SKY = new THREE.Color("#201040"); 

    let currentSky = new THREE.Color();
    let sunInt = 0;
    let moonInt = 0;
    let starOp = 0;

    if (dayProgress < 0.10) {
        currentSky.copy(NIGHT_COLOR);
        starOp = 1.0;
        moonInt = 0.5;
    } else if (dayProgress < 0.20) {
        const t = (dayProgress - 0.10) / 0.10; 
        if (t < 0.5) {
            currentSky.lerpColors(NIGHT_COLOR, DAWN_SKY, t * 2);
            starOp = 1.0 - (t * 2);
            moonInt = 0.5 * (1 - t * 2);
        } else {
            currentSky.lerpColors(DAWN_HORIZON, DAY_COLOR, (t - 0.5) * 2);
            starOp = 0;
            sunInt = (t - 0.5) * 2;
        }
    } else if (dayProgress < 0.80) {
        currentSky.copy(DAY_COLOR);
        starOp = 0;
        sunInt = 1.0;
        const midday = (dayProgress - 0.2) / 0.6;
        const dayCurve = Math.sin(midday * Math.PI);
        currentSky.lerp(new THREE.Color("#77bbff"), dayCurve * 0.3); 
    } else if (dayProgress < 0.90) {
        const t = (dayProgress - 0.80) / 0.10;
        if (t < 0.5) {
            currentSky.lerpColors(DAY_COLOR, DUSK_HORIZON, t * 2);
            sunInt = 1.0 - (t * 2);
        } else {
            currentSky.lerpColors(DUSK_SKY, NIGHT_COLOR, (t - 0.5) * 2);
            starOp = (t - 0.5) * 2;
            moonInt = (t - 0.5) * 2 * 0.5;
        }
    } else {
        currentSky.copy(NIGHT_COLOR);
        starOp = 1.0;
        moonInt = 0.5;
    }

    let sunAngle = 0;
    if (dayProgress >= 0.15 && dayProgress <= 0.85) {
        const d = (dayProgress - 0.15) / 0.70; 
        sunAngle = d * Math.PI; 
    } else {
        let d = 0;
        if (dayProgress > 0.85) d = (dayProgress - 0.85) / 0.30;
        else d = (dayProgress + 0.15) / 0.30;
        sunAngle = Math.PI + (d * Math.PI);
    }

    const orbitR = 120;
    const finalAngle = sunAngle + Math.PI; 
    const sunX_Pos = Math.cos(finalAngle) * orbitR;
    const sunY_Pos = Math.sin(finalAngle) * orbitR;
    const sunZ = -60;
    const moonX = -sunX_Pos;
    const moonY = -sunY_Pos;
    const moonZ = -60;

    materials.ground.color.lerpColors(new THREE.Color(c1.ground), new THREE.Color(c2.ground), seasonProgress);
    materials.leaf.color.lerpColors(new THREE.Color(c1.tree), new THREE.Color(c2.tree), seasonProgress);
    materials.wood.color.lerpColors(new THREE.Color(c1.wood), new THREE.Color(c2.wood), seasonProgress);
    materials.flower.color.lerpColors(new THREE.Color(c1.flower), new THREE.Color(c2.flower), seasonProgress);
    materials.path.color.lerpColors(new THREE.Color(c1.path), new THREE.Color(c2.path), seasonProgress);

    setSkyInfo({ 
        sunPosition: [sunX_Pos, sunY_Pos, sunZ],
        moonPosition: [moonX, moonY, moonZ],
        skyColor: currentSky,
        starOpacity: starOp,
        sunIntensity: sunInt * 1.5,
        moonIntensity: moonInt,
    });
  });
  return null;
};

const Scene = () => {
  const [cameraZ, setCameraZ] = useState(0);
  const [seed] = useState(() => Math.random() * 10000);
  
  const [skyInfo, setSkyInfo] = useState({ 
      sunPosition: [0, -100, 0], 
      moonPosition: [0, 100, 0],
      skyColor: new THREE.Color("#020210"),
      starOpacity: 1,
      sunIntensity: 0,
      moonIntensity: 0.4
  });
  
  const cameraTargetX = useRef(0);
  const cameraTargetY = useRef(2);

  const materials = useMemo(() => ({
      ground: new THREE.MeshStandardMaterial({ color: "#5c8f42", roughness: 1, metalness: 0 }),
      leaf: new THREE.MeshStandardMaterial({ color: "#82b84c", roughness: 0.8, metalness: 0.1 }),
      wood: new THREE.MeshStandardMaterial({ color: "#8b5a2b", roughness: 1, metalness: 0 }),
      flower: new THREE.MeshStandardMaterial({ color: "#ff69b4", emissive: "#220000", emissiveIntensity: 0.2 }),
      rock: new THREE.MeshStandardMaterial({ color: "#555555" }),
      path: new THREE.MeshStandardMaterial({ color: "#8b7355", roughness: 1 }),
  }), []);

  useFrame((state, delta) => {
    const move = BASE_SPEED * delta;
    setCameraZ((prev) => prev - move);
    
    const currentZ = cameraZ;
    const bobX = Math.sin(state.clock.elapsedTime * 4) * 0.1;
    const bobY = Math.sin(state.clock.elapsedTime * 8) * 0.05;

    const pathX = getMainPathX(currentZ, seed); 
    const currentElevation = getElevation(cameraTargetX.current, currentZ, seed);
    
    cameraTargetX.current = THREE.MathUtils.lerp(cameraTargetX.current, pathX, delta * 2);
    cameraTargetY.current = THREE.MathUtils.lerp(cameraTargetY.current, currentElevation + 1.8, delta * 3);
    
    const lookAheadZ = currentZ - 15;
    const lookAheadX = getMainPathX(lookAheadZ, seed);
    const lookAheadY = getElevation(lookAheadX, lookAheadZ, seed) + 1.8;
    
    state.camera.position.set(cameraTargetX.current + bobX, cameraTargetY.current + bobY, currentZ + 2);
    state.camera.lookAt(lookAheadX, lookAheadY + bobY * 0.5, lookAheadZ);
  });
  
  const currentChunkZ = Math.floor(cameraZ / CHUNK_SIZE) * CHUNK_SIZE;
  const visibleChunks = useMemo(() => {
    const chunks = [];
    for (let z = -1; z < CHUNK_LENGTH; z++) {
        const zPos = currentChunkZ - (z * CHUNK_SIZE);
        const pathXAtChunk = getMainPathX(zPos, seed); 
        const centerChunkX = Math.floor(pathXAtChunk / CHUNK_SIZE) * CHUNK_SIZE;

        for (let x = -SIDE_CHUNKS; x <= SIDE_CHUNKS; x++) {
            const xPos = centerChunkX + (x * CHUNK_SIZE);
            chunks.push({ x: xPos, z: zPos, key: `${xPos}:${zPos}` });
        }
    }
    return chunks;
  }, [currentChunkZ, seed]);

  return (
    <>
      <color attach="background" args={[skyInfo.skyColor]} />
      <fog attach="fog" args={[skyInfo.skyColor, 15, (CHUNK_LENGTH - 1) * CHUNK_SIZE]} />
      
      <hemisphereLight 
        args={[
            skyInfo.skyColor, 
            new THREE.Color(skyInfo.starOpacity > 0.5 ? "#050510" : "#335533"), 
            skyInfo.starOpacity > 0.5 ? 0.2 : 0.5
        ]} 
      />

      <directionalLight 
          position={skyInfo.sunPosition as [number, number, number]} 
          intensity={skyInfo.sunIntensity} 
          castShadow 
          shadow-mapSize={[1024, 1024]} 
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          shadow-bias={-0.001}
          color="#fff5cc" 
      />

      <directionalLight 
          position={skyInfo.moonPosition as [number, number, number]} 
          intensity={skyInfo.moonIntensity} 
          castShadow={skyInfo.starOpacity > 0.5} 
          color="#aaccff" 
          shadow-bias={-0.001}
      />
      
      <CelestialBody position={skyInfo.sunPosition as [number, number, number]} color="#ffffaa" scale={8} intensity={1} />
      {skyInfo.starOpacity > 0.1 && (
          <CelestialBody position={skyInfo.moonPosition as [number, number, number]} color="#ddddff" scale={6} intensity={0.5} />
      )}
      
      <Cloud position={[0, 100, cameraZ - 50]} opacity={skyInfo.starOpacity > 0.5 ? 0.1 : 0.5} speed={0.05} width={150} depth={20} segments={30} color="white" />

      <CustomStars opacity={skyInfo.starOpacity} />

      <Dog cameraZ={cameraZ} seed={seed} />

      <EnvironmentController materials={materials} setSkyInfo={setSkyInfo} />

      {visibleChunks.map((chunk) => (
        <GroundChunk key={chunk.key} xOffset={chunk.x} zOffset={chunk.z} materials={materials} seed={seed} />
      ))}
    </>
  );
};

export default function GameScene() {
  return (
    <div className="w-full h-[80vh] rounded-lg overflow-hidden border-4 border-black comic-shadow relative bg-black">
      <Canvas shadows dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <Scene />
      </Canvas>
      
      <div className="absolute top-4 left-4 bg-black/50 p-4 rounded text-white backdrop-blur-sm pointer-events-none">
      </div>
    </div>
  );
}
