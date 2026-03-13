import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';
import * as THREE from 'three';
import { CinemaSeat, CinemaScreen, Speaker, CinemaDoor, AirConditioner } from './design';
import { CinemaPostProcessing } from './pass';

// Camera Manager for smooth transitions and looking around
const CameraManager = ({ target, controlsRef }: { target: [number, number, number] | null, controlsRef: React.RefObject<any> }) => {
  const vec = new THREE.Vector3();
  const targetVec = new THREE.Vector3();
  const screenCenter = new THREE.Vector3(0, 6, -15);

  useFrame((state) => {
    if (target) {
      // 1. Move camera to seat position + eye level offset
      const eyePos = vec.set(target[0], target[1] + 1.2, target[2] + 0.1);
      state.camera.position.lerp(eyePos, 0.1);

      // 2. If we have controls, move the orbit target to be in front of the seat
      // This allows "looking around" from the seat
      if (controlsRef.current) {
        // The target should be slightly in front of the eye position towards the screen
        // We lerp the target for a smooth transition
        targetVec.set(target[0], target[1] + 1.2, target[2] - 1); 
        controlsRef.current.target.lerp(targetVec, 0.1);
        controlsRef.current.update();
      }
    } else {
      // Reset camera to default view if no target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 2, 0), 0.05);
        controlsRef.current.update();
      }
    }
  });

  return null;
};

interface Cinema3DProps {
  videoUrl: string | null;
  volume?: number;
  isPlaying?: boolean;
  isLooping?: boolean;
  seekTrigger?: number;
  seekAmount?: number;
  performanceMode?: 'auto' | 'high' | 'low';
  cameraTarget?: [number, number, number] | null;
  onSeatClick?: (pos: [number, number, number]) => void;
  onVideoEnded?: () => void;
}

const TheaterRoom = ({ 
  videoUrl, 
  volume = 1, 
  isPlaying = true, 
  isLooping = true, 
  seekTrigger = 0, 
  seekAmount = 0,
  quality = 'high',
  cameraTarget = null,
  onSeatClick,
  onVideoEnded
}: Cinema3DProps & { quality?: 'low' | 'medium' | 'high' }) => {
  // Generate Seats in 3 rows (Left, Middle, Right)
  const rows = quality === 'low' ? 3 : 5;
  const seatsPerRow = quality === 'low' ? 3 : 4;
  
  const renderSeats = (xOffset: number) => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < seatsPerRow; s++) {
        const pos: [number, number, number] = [xOffset + s * 1.5, r * 0.6, r * 3.5];
        const isSelected = cameraTarget && cameraTarget[0] === pos[0] && cameraTarget[1] === pos[1] && cameraTarget[2] === pos[2];
        seats.push(
          <CinemaSeat 
            key={`${xOffset}-${r}-${s}`} 
            position={pos} 
            onClick={() => onSeatClick?.(pos)}
            isSelected={!!isSelected}
          />
        );
      }
    }
    return seats;
  };

  // Tiered Platforms (Risers)
  const renderRisers = () => {
    const risers = [];
    for (let r = 0; r < rows; r++) {
      risers.push(
        <mesh key={r} position={[0, r * 0.3, r * 3.5]} receiveShadow={quality !== 'low'}>
          <boxGeometry args={[40, (r + 1) * 0.6, 3.5]} />
          <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.8} />
        </mesh>
      );
    }
    return risers;
  };

  // Aisle Stairs
  const renderStairs = (x: number) => {
    const stairs = [];
    const stairCount = quality === 'low' ? rows : rows * 2;
    for (let r = 0; r < stairCount; r++) {
      stairs.push(
        <mesh key={r} position={[x, r * 0.15, r * 1.75 - 1.75]} receiveShadow={quality === 'high'}>
          <boxGeometry args={[2, 0.3, 1.75]} />
          <meshStandardMaterial color="#080808" roughness={0.2} metalness={0.5} />
          {/* Step Lighting - Only on high quality */}
          {quality === 'high' && (
            <mesh position={[0, 0.16, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.8, 0.05]} />
              <meshBasicMaterial color="#00ffff" />
            </mesh>
          )}
        </mesh>
      );
    }
    return stairs;
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 15, 0]} intensity={0.3} color="#4444ff" />
      
      {/* Floor Neon Blue Lights - Optimized count */}
      <group position={[0, 0.02, 0]}>
        {Array.from({ length: quality === 'low' ? 3 : 6 }).map((_, i) => (
          <mesh key={i} position={[0, 0, i * 6 - 15]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 3.5]} />
            <meshBasicMaterial color="#00ffff" />
            {quality !== 'low' && <pointLight intensity={0.5} distance={3} color="#00ffff" />}
          </mesh>
        ))}
      </group>

      {/* Room Architecture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={quality !== 'low'}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050505" roughness={0.05} metalness={0.8} />
      </mesh>

      <group position={[0, 0, 0]}>
        {renderRisers()}
      </group>

      <group position={[0, 0, 0]}>
        {renderStairs(-4.5)}
        {renderStairs(4.5)}
      </group>

      {/* Walls */}
      <mesh position={[0, 10, -20]} receiveShadow={quality === 'high'}>
        <boxGeometry args={[40, 20, 1]} />
        <meshStandardMaterial color="#0a0000" roughness={0.1} metalness={0.9} />
      </mesh>

      {[-20, 20].map((x, i) => (
        <group key={i} position={[x, 10, 0]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
          <mesh receiveShadow={quality === 'high'}>
            <boxGeometry args={[40, 20, 0.5]} />
            <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.3]}>
            <planeGeometry args={[38, 18]} />
            <meshStandardMaterial color="#440000" roughness={0.05} metalness={0.8} />
          </mesh>
          {/* Blue Neon Accents - Optimized */}
          {quality !== 'low' && Array.from({ length: 3 }).map((_, j) => (
            <mesh key={j} position={[j * 12 - 12, 0, 0.35]}>
              <boxGeometry args={[0.1, 16, 0.1]} />
              <meshBasicMaterial color="#0088ff" />
              {quality === 'high' && <pointLight intensity={0.8} distance={5} color="#0088ff" />}
            </mesh>
          ))}
        </group>
      ))}

      <group position={[0, 10, 20]}>
        <mesh receiveShadow={quality === 'high'}>
          <boxGeometry args={[40, 20, 1]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
        <CinemaDoor position={[-12, -5.5, -0.6]} color="#00ff00" label="ENTRANCE" />
        <CinemaDoor position={[12, -5.5, -0.6]} color="#ff0000" label="EXIT" />
        <AirConditioner position={[-12, 1.5, -0.6]} />
        <AirConditioner position={[12, 1.5, -0.6]} />
      </group>

      <mesh position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow={quality === 'high'}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      <CinemaScreen 
        videoUrl={videoUrl} 
        volume={volume} 
        isPlaying={isPlaying}
        isLooping={isLooping}
        seekTrigger={seekTrigger}
        seekAmount={seekAmount}
        onEnded={onVideoEnded}
      />
      
      <Speaker position={[-13, 6, -14.5]} rgbColor="#00ffcc" />
      <Speaker position={[13, 6, -14.5]} rgbColor="#00ffcc" />
      <Speaker position={[-13, 11, -14.5]} rgbColor="#0088ff" />
      <Speaker position={[13, 11, -14.5]} rgbColor="#0088ff" />

      <group position={[0, 0, 0]}>
        {renderSeats(-11)}
        {renderSeats(-2.25)}
        {renderSeats(6.5)}
      </group>

      {quality !== 'low' && (
        <ContactShadows 
          opacity={0.4} 
          scale={40} 
          blur={0.2} 
          far={10} 
          resolution={quality === 'high' ? 512 : 256} 
          color="#000000" 
        />
      )}
      <Environment preset="night" />
    </>
  );
};

export const Cinema3D = ({ 
  videoUrl, 
  volume = 1,
  isPlaying = true,
  isLooping = true,
  seekTrigger = 0,
  seekAmount = 0,
  performanceMode = 'auto',
  cameraTarget = null,
  onSeatClick,
  onVideoEnded
}: Cinema3DProps) => {
  const [dpr, setDpr] = useState(1);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const controlsRef = useRef<any>(null);

  // Manual overrides
  React.useEffect(() => {
    if (performanceMode === 'high') {
      setQuality('high');
      setDpr(window.devicePixelRatio);
    } else if (performanceMode === 'low') {
      setQuality('low');
      setDpr(1);
    }
  }, [performanceMode]);

  return (
    <div className="w-full h-full bg-black">
      <Canvas 
        shadows={quality === 'high'} 
        dpr={dpr}
        gl={{ 
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        {performanceMode === 'auto' && (
          <PerformanceMonitor 
            onIncline={() => { setQuality('high'); setDpr(window.devicePixelRatio); }} 
            onDecline={() => { setQuality('low'); setDpr(1); }} 
          />
        )}
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        
        <PerspectiveCamera makeDefault position={[0, 5, 15]} fov={50} />
        <CameraManager target={cameraTarget} controlsRef={controlsRef} />
        
        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          maxPolarAngle={Math.PI / 1.5} 
          minPolarAngle={Math.PI / 4}
          minDistance={cameraTarget ? 0.1 : 5} 
          maxDistance={cameraTarget ? 0.5 : 25}
          rotateSpeed={cameraTarget ? 0.4 : 1}
        />
        
        <Suspense fallback={null}>
          <TheaterRoom 
            videoUrl={videoUrl} 
            volume={volume} 
            isPlaying={isPlaying}
            isLooping={isLooping}
            seekTrigger={seekTrigger}
            seekAmount={seekAmount}
            quality={quality}
            cameraTarget={cameraTarget}
            onSeatClick={onSeatClick}
            onVideoEnded={onVideoEnded}
          />
        </Suspense>
        <CinemaPostProcessing quality={quality} />
      </Canvas>
    </div>
  );
};
