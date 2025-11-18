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

// Marvel/Comic Book style colors - vibrant and saturated
const SEASON_COLORS = {
  spring: { ground: "#3d6020", tree: "#4a9e2e", wood: "#5c3a1a", flower: "#ff1744", path: "#8b6914", grass: "#3d7a1f", dirt: "#6b4e37" },
  summer: { ground: "#2d4a1f", tree: "#2d7a1e", wood: "#4a2a0f", flower: "#ff0000", path: "#6b5a14", grass: "#2d5a1e", dirt: "#5d4a35" },
  autumn: { ground: "#7b5a2e", tree: "#ff6b35", wood: "#4a2a1a", flower: "#ff4500", path: "#8b5a1e", grass: "#7b5a2e", dirt: "#7b5a3e" },
  winter: { ground: "#f0f0f0", tree: "#ffffff", wood: "#3a2a1a", flower: "#ff69b4", path: "#dcdcdc", grass: "#d8d8d8", dirt: "#c0c0c0" },
};

// Toon/Cel-shading shader for comic book style
const toonVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const toonFragmentShader = `
  uniform vec3 color;
  uniform float outlineWidth;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 light = normalize(vec3(1.0, 1.0, 1.0));
    float intensity = dot(vNormal, light);
    
    // Cel-shading: quantize lighting into bands
    float cel = floor(intensity * 3.0) / 3.0;
    cel = max(cel, 0.3); // Minimum brightness
    
    // Add outline effect
    float outline = 1.0;
    if (dot(vNormal, vec3(0.0, 0.0, 1.0)) < 0.3) {
      outline = 0.5; // Darker edges
    }
    
    gl_FragColor = vec4(color * cel * outline, 1.0);
  }
`;

// Helper function to create toon/comic book materials
function createToonMaterial(color: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      outlineWidth: { value: 0.02 }
    },
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    side: THREE.FrontSide
  });
}

// Helper function to create flat comic-style materials with outlines
function createComicMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    metalness: 0,
    flatShading: true, // Flat shading for comic book look
    emissive: new THREE.Color(color).multiplyScalar(0.1), // Slight glow
  });
}

// Special Marvel/comic book material for leaves - more vibrant and stylized
function createComicLeafMaterial(color: string): THREE.MeshStandardMaterial {
  const leafColor = new THREE.Color(color);
  // Boost saturation for more vibrant look
  leafColor.r = Math.min(1, leafColor.r * 1.2);
  leafColor.g = Math.min(1, leafColor.g * 1.2);
  leafColor.b = Math.min(1, leafColor.b * 1.2);
  
  return new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.95,
    metalness: 0,
    flatShading: true, // Strong flat shading for comic book
    emissive: leafColor.clone().multiplyScalar(0.15), // More glow for comic effect
  });
}

// --- Components ---
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// Geometry for flowers/mushrooms
const flowerGeometry = new THREE.OctahedronGeometry(0.15, 0); // Diamond-like flower
// Cartoon-style ground textures
const grassBladeGeometry = new THREE.BoxGeometry(0.15, 0.3, 0.05); // Tall thin grass blade
const grassPatchGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4); // Flat grass patch
const dirtPatchGeometry = new THREE.BoxGeometry(0.6, 0.03, 0.6); // Dirt patch

function generateTreeStructure(x: number, y: number, z: number, scale: number, seed: number) {
    const woods = [];
    const leaves = [];
    
    let r = randomDet(seed);
    const nextR = () => { r = randomDet(r * 1000); return r; };

    // Marvel/Comic Book style tree - more geometric and stylized
    const trunkHeight = 3.0 + nextR() * 3.0; 
    const trunkWidth = 0.35 + nextR() * 0.25;
    
    // Main trunk - thicker and more defined
    woods.push({
        pos: [x, y + (trunkHeight * scale * 0.5), z], 
        scale: [trunkWidth * scale, trunkHeight * scale, trunkWidth * scale],
        rot: [0, 0, 0]
    });

    // Optional branch trunks for more character
    if (nextR() > 0.4) {
        const branchAngle = nextR() * Math.PI * 2;
        const branchHeight = trunkHeight * 0.6;
        const branchLength = 0.8 * scale;
        woods.push({
            pos: [
                x + Math.cos(branchAngle) * branchLength * 0.5,
                y + branchHeight * scale * 0.5,
                z + Math.sin(branchAngle) * branchLength * 0.5
            ],
            scale: [trunkWidth * scale * 0.4, branchLength * 0.6, trunkWidth * scale * 0.4],
            rot: [0, branchAngle, Math.PI * 0.15]
        });
    }

    const canopyBaseY = y + (trunkHeight * scale) * 0.75; 
    const mainSize = Math.max(1.5, (1.8 + nextR() * 1.2) * scale); // Ensure minimum size
    
    // Main canopy - large and bold (always generated)
    leaves.push({
        pos: [x, canopyBaseY + (mainSize * 0.5), z],
        scale: [mainSize, mainSize * 0.9, mainSize],
        rot: [0, nextR() * Math.PI * 2, 0]
    });

    // Top accent - smaller sphere on top
    leaves.push({
        pos: [x, canopyBaseY + mainSize * 1.1, z],
        scale: [mainSize * 0.5, mainSize * 0.5, mainSize * 0.5],
        rot: [0, nextR() * Math.PI * 2, 0]
    });

    // Side clusters - more defined and geometric
    const numSideClusters = 4 + Math.floor(nextR() * 3);
    for(let i=0; i<numSideClusters; i++) {
        const angle = (i / numSideClusters) * Math.PI * 2 + (nextR() * 0.3);
        const offset = 0.7 * mainSize * 0.5;
        const sideSize = 0.65 * mainSize;
        const heightVariation = (nextR() - 0.5) * 0.4;

        // Main side cluster
        leaves.push({
            pos: [
                x + Math.cos(angle) * offset, 
                canopyBaseY + (mainSize * 0.4) + heightVariation, 
                z + Math.sin(angle) * offset
            ],
            scale: [sideSize, sideSize * 0.85, sideSize],
            rot: [0, angle + nextR() * 0.5, 0]
        });

        // Small accent on side clusters
        if (nextR() > 0.5) {
            leaves.push({
                pos: [
                    x + Math.cos(angle) * offset * 1.2, 
                    canopyBaseY + (mainSize * 0.6) + heightVariation, 
                    z + Math.sin(angle) * offset * 1.2
                ],
                scale: [sideSize * 0.5, sideSize * 0.5, sideSize * 0.5],
                rot: [0, angle + nextR() * Math.PI, 0]
            });
        }
    }

    // Bottom accent clusters for fuller look
    if (nextR() > 0.3) {
        const bottomAngle = nextR() * Math.PI * 2;
        const bottomOffset = 0.5 * mainSize * 0.5;
        leaves.push({
            pos: [
                x + Math.cos(bottomAngle) * bottomOffset,
                canopyBaseY - (mainSize * 0.2),
                z + Math.sin(bottomAngle) * bottomOffset
            ],
            scale: [mainSize * 0.4, mainSize * 0.4, mainSize * 0.4],
            rot: [0, bottomAngle, 0]
        });
    }

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

  // Comic book style materials for the dog - pure black with visibility from lights
  const blackMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#000000", // Pure black
    roughness: 0.9, 
    metalness: 0,
    flatShading: true // Comic book flat shading
  }), []);
  
  // Unlit black material for head to ensure it stays black
  const headBlackMaterial = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: "#000000" // Pure black, unlit
  }), []);
  const eyeMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: "#ffffff", 
    emissive: "#ffffff", 
    emissiveIntensity: 1.0, // Very bright eyes
    flatShading: true // Comic book flat shading
  }), []);

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
        // Smoothly move to position - pattes touch the ground
        // With scale 1.2, legs at y=0.12 in group, leg center at y=0 in leg group, so bottom at y=0.12-0.12=0.0
        // So group should be at targetY for legs to touch ground
        group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.1);
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.1);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY + 0.01, 0.2); // Slight offset to prevent sinking
        
        // Look at the future point
        group.current.lookAt(lookAheadX, lookAheadY + 0.01, lookAheadZ);
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
    <group ref={group} scale={1.2}>
        {/* Multiple lights for maximum visibility */}
        <pointLight position={[0, -0.1, 0]} distance={15} intensity={4.0} color="#ffffff" />
        <pointLight position={[0, 0.2, 0]} distance={12} intensity={3.0} color="#ffffff" />
        <pointLight position={[0, 0.1, 0.2]} distance={10} intensity={2.5} color="#ffffff" />
        
        {/* Glow halo around dog body (not head) for comic book style visibility */}
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Glow sphere around body, avoiding head area */}
        <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} side={THREE.BackSide} />
        </mesh>
        {/* Additional ring at body level */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.4, 0.05, 16, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Body */}
        <mesh material={blackMaterial} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.2, 0.2, 0.4]} />
        </mesh>
        
        {/* Head Group - Head at +Z (Front of model relative to movement) - rendered last to be on top */}
        <group ref={head} position={[0, 0.35, 0.2]}>
            {/* Head Main - pure black, unlit to stay black */}
            <mesh material={headBlackMaterial}>
                <boxGeometry args={[0.18, 0.18, 0.18]} />
            </mesh>
            {/* Snout - pure black, unlit */}
            <mesh material={headBlackMaterial} position={[0, -0.04, 0.1]}>
                <boxGeometry args={[0.08, 0.06, 0.08]} />
            </mesh>
            {/* Small Ears - pure black, unlit */}
            <mesh material={headBlackMaterial} position={[-0.06, 0.11, 0]} rotation={[0, 0, 0.3]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
            </mesh>
            <mesh material={headBlackMaterial} position={[0.06, 0.11, 0]} rotation={[0, 0, -0.3]}>
                <boxGeometry args={[0.04, 0.08, 0.02]} />
            </mesh>
            {/* Eyes - larger and brighter for visibility */}
             <mesh material={eyeMaterial} position={[-0.05, 0.01, 0.091]}>
                <boxGeometry args={[0.04, 0.04, 0.015]} />
            </mesh>
             <mesh material={eyeMaterial} position={[0.05, 0.01, 0.091]}>
                <boxGeometry args={[0.04, 0.04, 0.015]} />
            </mesh>
        </group>

        {/* Legs - properly aligned: bottom touches ground (y=0) */}
        <group position={[-0.07, 0.12, 0.15]}>
            <mesh ref={frontLeft} material={blackMaterial} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[0.07, 0.12, 0.15]}>
            <mesh ref={frontRight} material={blackMaterial} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[-0.07, 0.12, -0.15]}>
            <mesh ref={backLeft} material={blackMaterial} position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.05, 0.24, 0.05]} />
            </mesh>
        </group>
        <group position={[0.07, 0.12, -0.15]}>
            <mesh ref={backRight} material={blackMaterial} position={[0, 0, 0]} castShadow>
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
  
  // Generate smooth terrain mesh with color variation
  const terrainGeometry = useMemo(() => {
    const segments = 20; // Higher resolution for smoother terrain
    const geometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, segments, segments);
    const positions = geometry.attributes.position;
    const colors = [];
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i); // PlaneGeometry Y becomes -Z after rotation
      
      // After rotation -PI/2 around X: X stays X, Y becomes -Z, Z becomes Y
      const globalX = x + xOffset;
      const globalZ = -y + zOffset; // Invert Y to get correct Z
      const height = getElevation(globalX, globalZ, seed);
      
      positions.setZ(i, height); // Set height (becomes Y after rotation)
      
      // Color variation based on noise for natural patches
      const colorNoise = noise(globalX * 0.1, globalZ * 0.1);
      const pathX = getAnyPathX(globalZ, globalX, seed);
      const pathWidth = getPathWidth(globalZ, seed);
      const distToPath = Math.abs(globalX - pathX);
      const isPath = distToPath < pathWidth / 2;
      
      // Base color from season
      const baseColor = new THREE.Color(materials.ground.color);
      
      if (isPath) {
        // Slightly different color for path
        baseColor.lerp(new THREE.Color(materials.path.color), 0.3);
      } else {
        // Natural color variation
        const variation = (colorNoise - 0.5) * 0.15; // Subtle variation
        baseColor.r += variation;
        baseColor.g += variation * 0.5;
        baseColor.b += variation * 0.3;
      }
      
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, [xOffset, zOffset, seed, materials]);

  const { woodInstances, leafInstances, flowerInstances, grassBlades, grassPatches, dirtPatches } = useMemo(() => {
    const w = [];
    const l = [];
    const f = [];
    const gb = []; // Grass blades
    const gp = []; // Grass patches
    const dp = []; // Dirt patches
    
    const STEP = 2;
    
    for (let x = -CHUNK_SIZE / 2; x < CHUNK_SIZE / 2; x += STEP) { 
      for (let z = -CHUNK_SIZE / 2; z < CHUNK_SIZE / 2; z += STEP) {
        const globalX = x + xOffset;
        const globalZ = z + zOffset;
        
        const y = getElevation(globalX, globalZ, seed);

        const pathX = getAnyPathX(globalZ, globalX, seed);
        const pathWidth = getPathWidth(globalZ, seed);
        const distToPath = Math.abs(globalX - pathX);
        const isPath = distToPath < pathWidth / 2;
        
        if (!isPath) {
             const density = noise(globalX * 0.04, globalZ * 0.04);
             const textureSeed = globalX * 234 + globalZ * 567;
             const textureNoise = noise(globalX * 0.15, globalZ * 0.15);

             // Cartoon ground textures
             if (textureNoise > 0.3 && Math.random() > 0.7) {
                 // Grass patches
                 const patchSize = 0.3 + randomDet(textureSeed) * 0.3;
                 gp.push({
                     pos: [x, y + 0.025, z],
                     scale: [patchSize, 1, patchSize],
                     rot: [0, randomDet(textureSeed + 1) * Math.PI * 2, 0]
                 });
             } else if (textureNoise < -0.2 && Math.random() > 0.8) {
                 // Dirt patches
                 const dirtSize = 0.4 + randomDet(textureSeed + 10) * 0.4;
                 dp.push({
                     pos: [x, y + 0.015, z],
                     scale: [dirtSize, 1, dirtSize],
                     rot: [0, randomDet(textureSeed + 11) * Math.PI * 2, 0]
                 });
             }
             
             // Small grass blades scattered around
             if (Math.random() > 0.85 && textureNoise > -0.1) {
                 const bladeSeed = globalX * 111 + globalZ * 222;
                 const bladeCount = 2 + Math.floor(randomDet(bladeSeed) * 3); // 2-4 blades per spot
                 for (let i = 0; i < bladeCount; i++) {
                     const offsetX = (randomDet(bladeSeed + i) - 0.5) * 0.3;
                     const offsetZ = (randomDet(bladeSeed + i + 10) - 0.5) * 0.3;
                     const bladeHeight = 0.2 + randomDet(bladeSeed + i + 20) * 0.15;
                     const bladeRot = randomDet(bladeSeed + i + 30) * Math.PI * 2;
                     const bladeTilt = (randomDet(bladeSeed + i + 40) - 0.5) * 0.3;
                     gb.push({
                         pos: [x + offsetX, y + bladeHeight/2, z + offsetZ],
                         scale: [1, bladeHeight, 1],
                         rot: [bladeTilt, bladeRot, bladeTilt * 0.5]
                     });
                 }
             }

             if (density > 0.1) {
                  const treeSeed = globalX * 761 + globalZ * 924;
                  const scale = 1.5 + randomDet(treeSeed) * 2.0;
                  
                  const structure = generateTreeStructure(x, y, z, scale, treeSeed);
                  w.push(...structure.woods);
                  l.push(...structure.leaves);
             } 
             else if (Math.random() > 0.95) { // Much rarer flowers/mushrooms
                 const elementSeed = globalX * 789 + globalZ * 321;
                 // Light flowers or mushrooms
                 const flowerScale = 0.08 + randomDet(elementSeed) * 0.1; // Smaller
                 f.push({
                     pos: [x, y, z],
                     scale: flowerScale,
                     rot: [randomDet(elementSeed + 1) * Math.PI, randomDet(elementSeed + 2) * Math.PI * 2, randomDet(elementSeed + 3) * Math.PI]
                 });
             }
        }
      }
    }
    return { woodInstances: w, leafInstances: l, flowerInstances: f, grassBlades: gb, grassPatches: gp, dirtPatches: dp };
  }, [xOffset, zOffset, seed]);

  return (
    <group position={[xOffset, 0, zOffset]}>
      {/* Smooth continuous terrain mesh with color variation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={terrainGeometry} material={materials.ground} receiveShadow>
      </mesh>

      {/* Cartoon-style ground textures */}
      <Instances range={grassPatches.length} material={materials.grass} geometry={grassPatchGeometry} frustumCulled={false}>
          {grassPatches.map((patch, i) => (
              <Instance key={i} position={patch.pos as any} scale={patch.scale as any} rotation={patch.rot as any} />
          ))}
      </Instances>

      <Instances range={dirtPatches.length} material={materials.dirt} geometry={dirtPatchGeometry} frustumCulled={false}>
          {dirtPatches.map((patch, i) => (
              <Instance key={i} position={patch.pos as any} scale={patch.scale as any} rotation={patch.rot as any} />
          ))}
      </Instances>

      <Instances range={grassBlades.length} material={materials.grass} geometry={grassBladeGeometry} frustumCulled={false}>
          {grassBlades.map((blade, i) => (
              <Instance key={i} position={blade.pos as any} scale={blade.scale as any} rotation={blade.rot as any} />
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

      {/* Light flowers/mushrooms */}
      <Instances range={flowerInstances.length} material={materials.flower} geometry={flowerGeometry} frustumCulled={false}>
          {flowerInstances.map((flower, i) => {
              const y = getElevation(flower.pos[0] + xOffset, flower.pos[2] + zOffset, seed);
              return <Instance key={i} position={[flower.pos[0], y + 0.15, flower.pos[2]]} scale={[flower.scale, flower.scale, flower.scale]} rotation={flower.rot as any} />;
          })}
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
      {/* Comic book style celestial body with outline effect */}
      <mesh>
        <sphereGeometry args={[scale, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Outer glow ring for comic book effect */}
      <mesh>
        <ringGeometry args={[scale * 1.1, scale * 1.15, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
      <pointLight intensity={intensity} distance={200} color={color} />
    </group>
  );
};

const EnvironmentController = ({ materials, setSkyInfo }: { materials: any, setSkyInfo: any }) => {
  const lastUpdateRef = useRef({ time: -1, skyHash: "" });
  
  useFrame((state) => {
    const time = state.clock.elapsedTime * 1000;
    
    const seasonProgress = (time % SEASON_DURATION) / SEASON_DURATION;
    const seasonIndex = Math.floor(time / SEASON_DURATION) % SEASONS.length;
    const nextIndex = (seasonIndex + 1) % SEASONS.length;
    
    const c1 = SEASON_COLORS[SEASONS[seasonIndex]];
    const c2 = SEASON_COLORS[SEASONS[nextIndex]];

    const dayProgress = (time % DAY_DURATION) / DAY_DURATION; 
    
    // Marvel/Comic book style sky colors - vibrant and saturated
    const NIGHT_COLOR = new THREE.Color("#000033"); // Deep blue-black
    const DAWN_HORIZON = new THREE.Color("#ff6600"); // Bright orange
    const DAWN_SKY = new THREE.Color("#6633cc"); // Vibrant purple
    const DAY_COLOR = new THREE.Color("#0066ff"); // Bright comic blue
    const DUSK_HORIZON = new THREE.Color("#ff3300"); // Bright red-orange
    const DUSK_SKY = new THREE.Color("#330066"); // Deep purple 

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
    
    // Update leaf color and emissivity for Marvel/comic book style
    const leafColor1 = new THREE.Color(c1.tree);
    const leafColor2 = new THREE.Color(c2.tree);
    // Boost saturation
    leafColor1.r = Math.min(1, leafColor1.r * 1.2);
    leafColor1.g = Math.min(1, leafColor1.g * 1.2);
    leafColor1.b = Math.min(1, leafColor1.b * 1.2);
    leafColor2.r = Math.min(1, leafColor2.r * 1.2);
    leafColor2.g = Math.min(1, leafColor2.g * 1.2);
    leafColor2.b = Math.min(1, leafColor2.b * 1.2);
    materials.leaf.color.lerpColors(leafColor1, leafColor2, seasonProgress);
    materials.leaf.emissive.copy(materials.leaf.color).multiplyScalar(0.15);
    
    materials.wood.color.lerpColors(new THREE.Color(c1.wood), new THREE.Color(c2.wood), seasonProgress);
    materials.flower.color.lerpColors(new THREE.Color(c1.flower), new THREE.Color(c2.flower), seasonProgress);
    materials.path.color.lerpColors(new THREE.Color(c1.path), new THREE.Color(c2.path), seasonProgress);
    materials.grass.color.lerpColors(new THREE.Color(c1.grass), new THREE.Color(c2.grass), seasonProgress);
    materials.dirt.color.lerpColors(new THREE.Color(c1.dirt), new THREE.Color(c2.dirt), seasonProgress);

    // Update sky info more frequently for smooth transitions, but not every frame
    const skyHash = `${Math.floor(dayProgress * 1000)}_${Math.floor(sunInt * 100)}_${Math.floor(starOp * 100)}`;
    if (skyHash !== lastUpdateRef.current.skyHash || Math.abs(time - lastUpdateRef.current.time) > 50) {
      setSkyInfo({ 
          sunPosition: [sunX_Pos, sunY_Pos, sunZ],
          moonPosition: [moonX, moonY, moonZ],
          skyColor: currentSky.clone(), // Clone to avoid reference issues
          starOpacity: starOp,
          sunIntensity: sunInt * 1.5,
          moonIntensity: moonInt,
      });
      lastUpdateRef.current = { time, skyHash };
    }
  });
  return null;
};

const Scene = () => {
  const cameraZRef = useRef(0);
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
  const currentChunkZRef = useRef(0);
  const lastCameraZUpdate = useRef(0);

  const materials = useMemo(() => ({
      ground: new THREE.MeshStandardMaterial({ 
        color: "#3d6020", // Lighter ground color
        roughness: 1, 
        metalness: 0, 
        vertexColors: true,
        flatShading: true // Comic book flat shading
      }),
      leaf: createComicLeafMaterial("#4a9e2e"),
      wood: createComicMaterial("#5c3a1a"),
      flower: createComicMaterial("#ff1744"),
      path: createComicMaterial("#8b6914"),
      grass: createComicMaterial("#3d7a1f"),
      dirt: createComicMaterial("#6b4e37"),
  }), []);

  useFrame((state, delta) => {
    const move = BASE_SPEED * delta;
    cameraZRef.current -= move;
    
    const currentZ = cameraZRef.current;
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
    
    // Update chunk only when crossing chunk boundary
    const newChunkZ = Math.floor(currentZ / CHUNK_SIZE) * CHUNK_SIZE;
    if (newChunkZ !== currentChunkZRef.current) {
      currentChunkZRef.current = newChunkZ;
      setCurrentChunkZ(newChunkZ);
    }
    
    // Update cameraZ state only every 0.5 units to reduce re-renders and prevent freezes
    if (Math.abs(currentZ - lastCameraZUpdate.current) > 0.5) {
      setCameraZ(currentZ);
      lastCameraZUpdate.current = currentZ;
    }
  });
  
  const [currentChunkZ, setCurrentChunkZ] = useState(0);
  
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
        skyColor={skyInfo.skyColor}
        groundColor={skyInfo.starOpacity > 0.5 ? "#050510" : "#335533"}
        intensity={skyInfo.starOpacity > 0.5 ? 0.2 : 0.5}
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
      
      <CelestialBody position={skyInfo.sunPosition as [number, number, number]} color="#ffcc00" scale={8} intensity={1.2} />
      {skyInfo.starOpacity > 0.1 && (
          <CelestialBody position={skyInfo.moonPosition as [number, number, number]} color="#ffffff" scale={6} intensity={0.6} />
      )}
      
      <Cloud position={[0, 100, cameraZ - 50]} opacity={skyInfo.starOpacity > 0.5 ? 0.1 : 0.5} speed={0.05} segments={30} />

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
