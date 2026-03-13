import React from 'react';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

export const CinemaPostProcessing = ({ quality = 'high' }: { quality?: 'low' | 'medium' | 'high' }) => {
  if (quality === 'low') {
    return (
      <EffectComposer enableNormalPass={false}>
        <Vignette eskil={false} offset={0.3} darkness={1.0} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        intensity={quality === 'high' ? 0.4 : 0.2} 
        luminanceThreshold={0.9} 
        luminanceSmoothing={0.1} 
        mipmapBlur={false} 
      />
      <Vignette eskil={false} offset={0.2} darkness={1.2} />
    </EffectComposer>
  );
};
