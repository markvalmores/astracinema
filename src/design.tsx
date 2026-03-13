import React, { useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useVideoTexture, Html, RoundedBox } from '@react-three/drei';

// Luxury Cinema Seat Design - Polished Blue & Rounded
export const CinemaSeat = ({ 
  position, 
  onClick,
  isSelected = false
}: { 
  position: [number, number, number], 
  onClick?: () => void,
  isSelected?: boolean
}) => {
  const [hovered, setHovered] = React.useState(false);

  // Colors - Deluxe Midnight Blue & Gold
  const baseColor = "#050505";
  const seatColor = isSelected ? "#00ffff" : (hovered ? "#0044cc" : "#001a4d");
  const backColor = isSelected ? "#00cccc" : (hovered ? "#0033aa" : "#001133");
  const goldAccent = "#d4af37";

  return (
    <group 
      position={position} 
      rotation={[0, 0, 0]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base Structure - Polished Black */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.48, 0.52, 0.2, 32]} />
        <meshStandardMaterial color={baseColor} roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Main Seat Cushion - Deep Plush Rounded */}
      <group position={[0, 0.45, 0]}>
        <RoundedBox 
          args={[0.95, 0.45, 0.85]} 
          radius={0.18} 
          smoothness={4} 
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial color={seatColor} roughness={0.3} metalness={0.1} />
        </RoundedBox>
        {/* Gold Piping Detail */}
        <mesh position={[0, 0.23, 0]}>
          <boxGeometry args={[0.96, 0.02, 0.86]} />
          <meshStandardMaterial color={goldAccent} metalness={1} roughness={0.2} />
        </mesh>
      </group>

      {/* Contoured Backrest */}
      <group position={[0, 1.15, 0.35]} rotation={[0.08, 0, 0]}>
        <RoundedBox 
          args={[0.9, 1.3, 0.3]} 
          radius={0.15} 
          smoothness={4} 
          castShadow 
          receiveShadow
        >
          <meshStandardMaterial color={backColor} roughness={0.4} />
        </RoundedBox>
        
        {/* Headrest - Square Shaped as requested */}
        <group position={[0, 0.75, 0.05]}>
          <RoundedBox 
            args={[0.65, 0.45, 0.25]} 
            radius={0.05} 
            smoothness={2} 
            castShadow
          >
            <meshStandardMaterial color={isSelected ? "#00ffff" : "#0044bb"} roughness={0.2} />
          </RoundedBox>
          {/* Deluxe Gold Inlay on Headrest */}
          <mesh position={[0, 0, 0.13]}>
            <planeGeometry args={[0.4, 0.2]} />
            <meshStandardMaterial color={goldAccent} metalness={1} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* Luxury Armrests - Sleek Rounded */}
      <group position={[0.52, 0.75, 0]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.12, 0.75, 4, 12]} />
          <meshStandardMaterial color="#111" roughness={0.05} metalness={0.9} />
        </mesh>
        {/* Gold Trim on Armrest */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.02, 32]} />
          <meshStandardMaterial color={goldAccent} metalness={1} />
        </mesh>
      </group>
      
      <group position={[-0.52, 0.75, 0]}>
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.12, 0.75, 4, 12]} />
          <meshStandardMaterial color="#111" roughness={0.05} metalness={0.9} />
        </mesh>
        {/* Gold Trim on Armrest */}
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.125, 0.125, 0.02, 32]} />
          <meshStandardMaterial color={goldAccent} metalness={1} />
        </mesh>
      </group>

      {/* Footrest - Rounded */}
      <group position={[0, 0.25, -0.45]}>
        <RoundedBox 
          args={[0.8, 0.12, 0.45]} 
          radius={0.06} 
          smoothness={4} 
          castShadow
        >
          <meshStandardMaterial color={seatColor} roughness={0.5} />
        </RoundedBox>
      </group>

      {/* Under-Seat Neon Glow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
      </mesh>
      <pointLight position={[0, 0.1, 0]} intensity={0.5} distance={2} color="#00ffff" />
    </group>
  );
};

// Sub-component to handle video texture hook correctly
const VideoMaterial = ({ 
  url, 
  volume = 1, 
  isPlaying = true, 
  isLooping = true,
  seekTrigger = 0,
  seekAmount = 0
}: { 
  url: string, 
  volume?: number, 
  isPlaying?: boolean, 
  isLooping?: boolean,
  seekTrigger?: number,
  seekAmount?: number
}) => {
  const texture = useVideoTexture(url, {
    muted: false,
    loop: isLooping,
    start: isPlaying,
  });

  // Handle Volume
  React.useEffect(() => {
    if (texture.image instanceof HTMLVideoElement) {
      texture.image.volume = volume;
      texture.image.muted = volume === 0;
    }
  }, [texture, volume]);

  // Handle Play/Pause and Cleanup
  React.useEffect(() => {
    const video = texture.image;
    if (video instanceof HTMLVideoElement) {
      if (isPlaying) {
        video.play().catch(e => console.log("Play blocked:", e));
      } else {
        video.pause();
      }
    }
    
    return () => {
      if (video instanceof HTMLVideoElement) {
        video.pause();
        video.src = "";
        video.load();
        video.remove();
      }
    };
  }, [texture, isPlaying]);

  // Handle Looping
  React.useEffect(() => {
    if (texture.image instanceof HTMLVideoElement) {
      texture.image.loop = isLooping;
    }
  }, [texture, isLooping]);

  // Handle Seeking (Rewind/Forward/Replay)
  React.useEffect(() => {
    if (texture.image instanceof HTMLVideoElement && seekTrigger > 0) {
      if (seekAmount === 0) {
        // Replay
        texture.image.currentTime = 0;
      } else {
        // Relative Seek
        texture.image.currentTime = Math.max(0, Math.min(texture.image.duration, texture.image.currentTime + seekAmount));
      }
    }
  }, [texture, seekTrigger, seekAmount]);

  return <meshBasicMaterial map={texture} />;
};

// 8K Ultra-Wide Cinema Screen
export const CinemaScreen = ({ 
  videoUrl, 
  volume = 1,
  isPlaying = true,
  isLooping = true,
  seekTrigger = 0,
  seekAmount = 0
}: { 
  videoUrl: string | null, 
  volume?: number,
  isPlaying?: boolean,
  isLooping?: boolean,
  seekTrigger?: number,
  seekAmount?: number
}) => {
  return (
    <group position={[0, 6, -15]}>
      {/* Screen Frame */}
      <mesh position={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[24.2, 10.2, 0.2]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* The Screen Surface */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[24, 10]} />
        {videoUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#000" />}>
            <VideoMaterial 
              url={videoUrl} 
              volume={volume} 
              isPlaying={isPlaying}
              isLooping={isLooping}
              seekTrigger={seekTrigger}
              seekAmount={seekAmount}
            />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#000" emissive="#111" emissiveIntensity={0.5} />
        )}
      </mesh>

      {/* Screen Glow (Ambient light from screen) */}
      {videoUrl && (
        <rectAreaLight
          width={24}
          height={10}
          intensity={5}
          color="#ffffff"
          position={[0, 0, 1]}
          rotation={[Math.PI, 0, 0]}
        />
      )}
    </group>
  );
};

// Dolby Atmos Speaker with RGB
export const Speaker = ({ position, rotation = [0, 0, 0], rgbColor = "#00ffcc" }: { position: [number, number, number], rotation?: [number, number, number], rgbColor?: string }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Speaker Body */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 1.2, 0.4]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* RGB Ring */}
      <mesh position={[0, 0, 0.21]}>
        <ringGeometry args={[0.15, 0.18, 32]} />
        <meshBasicMaterial color={rgbColor} />
      </mesh>
      <pointLight position={[0, 0, 0.3]} intensity={0.5} color={rgbColor} distance={2} />
    </group>
  );
};

// Air Conditioner
export const AirConditioner = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[3, 0.8, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Vents */}
      <mesh position={[0, -0.3, 0.2]}>
        <boxGeometry args={[2.6, 0.1, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Logo/Brand */}
      <mesh position={[-1, 0.1, 0.31]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshBasicMaterial color="#0088ff" />
      </mesh>
    </group>
  );
};

// Detailed Cinema Door - Based on Editorial Classic Design (Reference Image)
export const CinemaDoor = ({ position, color, label }: { position: [number, number, number], color: string, label: string }) => {
  return (
    <group position={position}>
      {/* Outer Door Frame - White/Cream like the image */}
      <mesh castShadow>
        <boxGeometry args={[4.6, 8.6, 0.5]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.3} />
      </mesh>
      
      {/* Double Doors Container */}
      <group position={[0, 0, 0.3]}>
        {/* Left Door */}
        <group position={[-1.02, 0, 0]}>
          {/* Red Padded Surface */}
          <mesh castShadow>
            <boxGeometry args={[2, 8, 0.2]} />
            <meshStandardMaterial color="#8b0000" roughness={0.6} />
          </mesh>
          {/* Neon Edge Light (Inner) */}
          <mesh position={[0.98, 0, 0.11]}>
            <boxGeometry args={[0.04, 8, 0.02]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {/* Tufted Buttons */}
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh key={i} position={[(i % 3) * 0.6 - 0.6, Math.floor(i / 3) * 1.5 - 3.5, 0.11]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#440000" />
            </mesh>
          ))}
          {/* Circular Window */}
          <group position={[0, 2, 0.11]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.5, 32]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.4, 32]} />
              <meshStandardMaterial color="#111" transparent opacity={0.8} metalness={0.9} />
            </mesh>
          </group>
          {/* Gold Handle Plate & Knob */}
          <group position={[0.9, 0, 0.11]}>
            <mesh>
              <circleGeometry args={[0.5, 32]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            {/* Physical Door Knob */}
            <mesh position={[-0.1, 0, 0.1]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
            </mesh>
          </group>
          {/* Gold Kick Plate */}
          <mesh position={[0, -3.5, 0.11]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Door */}
        <group position={[1.02, 0, 0]}>
          {/* Red Padded Surface */}
          <mesh castShadow>
            <boxGeometry args={[2, 8, 0.2]} />
            <meshStandardMaterial color="#8b0000" roughness={0.6} />
          </mesh>
          {/* Neon Edge Light (Inner) */}
          <mesh position={[-0.98, 0, 0.11]}>
            <boxGeometry args={[0.04, 8, 0.02]} />
            <meshBasicMaterial color={color} />
          </mesh>
          {/* Tufted Buttons */}
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh key={i} position={[(i % 3) * 0.6 - 0.6, Math.floor(i / 3) * 1.5 - 3.5, 0.11]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial color="#440000" />
            </mesh>
          ))}
          {/* Circular Window */}
          <group position={[0, 2, 0.11]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, 0.5, 32]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.4, 32]} />
              <meshStandardMaterial color="#111" transparent opacity={0.8} metalness={0.9} />
            </mesh>
          </group>
          {/* Gold Handle Plate & Knob */}
          <group position={[-0.9, 0, 0.11]}>
            <mesh>
              <circleGeometry args={[0.5, 32]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
            </mesh>
            {/* Physical Door Knob */}
            <mesh position={[0.1, 0, 0.1]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} />
            </mesh>
          </group>
          {/* Gold Kick Plate */}
          <mesh position={[0, -3.5, 0.11]}>
            <planeGeometry args={[2, 1]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Light-up Sign Above */}
      <group position={[0, 5, 0.5]}>
        <mesh>
          <boxGeometry args={[3.5, 1, 0.2]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <planeGeometry args={[3.2, 0.8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Html position={[0, 0, 0.12]} center transform distanceFactor={5}>
          <div className="font-black text-black text-[40px] tracking-tighter select-none">
            {label}
          </div>
        </Html>
        <pointLight intensity={2} distance={4} color={color} />
      </group>
    </group>
  );
};
