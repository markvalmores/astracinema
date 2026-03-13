import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause,
  Upload, 
  RotateCcw, 
  Settings, 
  Volume2, 
  Maximize2, 
  Film,
  Monitor,
  Speaker as SpeakerIcon,
  ChevronRight,
  Rewind,
  FastForward,
  Repeat
} from 'lucide-react';
import { Cinema3D } from './3d';

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [volume, setVolume] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [seekTrigger, setSeekTrigger] = useState(0);
  const [seekAmount, setSeekAmount] = useState(0);
  const [performanceMode, setPerformanceMode] = useState<'auto' | 'high' | 'low'>('auto');
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  const [activeMode, setActiveMode] = useState<'custom' | 'trailers' | 'now-playing' | 'calibration'>('custom');
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      setVideoUrl(null); // Stop previous video
      
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      
      setTimeout(() => {
        setVideoUrl(url);
        setIsMenuOpen(false);
        setShowTitle(false);
        setIsPlaying(true);
        setActiveMode('custom');
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleQuickAction = (mode: 'trailers' | 'now-playing' | 'calibration' | 'custom') => {
    if (activeMode === mode && videoUrl) return;
    
    setIsLoading(true);
    setVideoUrl(null); // Completely stop previous video
    
    setTimeout(() => {
      setActiveMode(mode);
      setIsPlaying(true);
      setShowTitle(false);
      setIsMenuOpen(false);
      
      switch(mode) {
        case 'trailers':
          setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
          break;
        case 'now-playing':
          setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
          break;
        case 'calibration':
          setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
          break;
        case 'custom':
          if (customVideoUrl) setVideoUrl(customVideoUrl);
          break;
      }
      setIsLoading(false);
    }, 1200);
  };

  const handleReplay = () => {
    setSeekAmount(0);
    setSeekTrigger(prev => prev + 1);
    setIsPlaying(true);
  };

  const handleSeek = (amount: number) => {
    setSeekAmount(amount);
    setSeekTrigger(prev => prev + 1);
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Cinema3D 
          videoUrl={videoUrl} 
          volume={volume} 
          isPlaying={isPlaying}
          isLooping={isLooping}
          seekTrigger={seekTrigger}
          seekAmount={seekAmount}
          performanceMode={performanceMode}
          cameraTarget={cameraTarget}
          onSeatClick={(pos) => setCameraTarget(pos)}
        />
      </div>

      {/* Overlay UI Layer */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black"
          >
            <div className="relative w-24 h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-red-600 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-b-2 border-white/20 rounded-full"
              />
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-zinc-500"
            >
              Initializing Stream
            </motion.p>
          </motion.div>
        )}

        {showTitle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-7xl font-black tracking-tighter mb-2 italic">
                ASTRA <span className="text-red-600">CINEMA</span>
              </h1>
              <p className="text-zinc-400 tracking-[0.3em] uppercase text-sm mb-12">
                8K IMAX Experience • Dolby Atmos
              </p>
              
              <button 
                onClick={() => setShowTitle(false)}
                className="group relative px-12 py-4 bg-white text-black font-bold uppercase tracking-widest overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Enter Theater <ChevronRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-red-600 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation / Menu */}
      <div className="absolute top-8 left-8 z-40 flex items-center gap-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all"
        >
          <Settings className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Cinema Status</span>
          <span className="text-sm font-medium flex items-center gap-2">
            {videoUrl ? (
              <><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Projecting 8K Stream</>
            ) : (
              <><div className="w-2 h-2 bg-red-500 rounded-full" /> Standby Mode</>
            )}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-zinc-200 transition-colors mr-2"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/mp4,video/webm,video/avi" 
              onChange={handleFileImport}
            />
            
            <div className="h-6 w-px bg-white/10 mx-1" />

            <button 
              onClick={() => handleSeek(-10)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Rewind 10s"
            >
              <Rewind className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 bg-white text-black rounded-full hover:scale-105 transition-transform"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            <button 
              onClick={() => handleSeek(10)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Forward 10s"
            >
              <FastForward className="w-5 h-5" />
            </button>

            <button 
              onClick={handleReplay}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
              title="Replay"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-lg transition-colors ${isLooping ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:bg-white/10'}`}
              title="Toggle Loop"
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-zinc-400 group/vol">
              <button onClick={() => setVolume(volume === 0 ? 0.75 : 0)}>
                <Volume2 className={`w-5 h-5 transition-colors ${volume > 0 ? 'text-white' : 'text-zinc-600'}`} />
              </button>
              <div className="relative w-24 h-6 flex items-center group">
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-75" 
                    style={{ width: `${volume * 100}%` }} 
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Info Panels */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="absolute left-8 top-32 z-40 w-64 space-y-4"
          >
            <div className="bg-black/60 border border-white/5 p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 flex items-center gap-2">
                  <Monitor className="w-3 h-3" /> Visual Engine
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Resolution</span>
                    <span className="text-white font-mono">{performanceMode === 'low' ? '1080p' : '7680 × 4320'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">RTX / FSR</span>
                    <span className={performanceMode === 'low' ? 'text-zinc-500' : 'text-emerald-400 font-bold'}>
                      {performanceMode === 'low' ? 'Disabled' : 'Active (Super Res)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center pt-2">
                    <span className="text-zinc-400">Mode</span>
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                      {(['low', 'auto', 'high'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setPerformanceMode(m)}
                          className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${performanceMode === m ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-4 flex items-center gap-2">
                  <SpeakerIcon className="w-3 h-3" /> Audio Engine
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">System</span>
                    <span className="text-white">Dolby Atmos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Channels</span>
                    <span className="text-white">64.4.12</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-xl">
              <p className="text-[10px] text-red-400 uppercase font-black tracking-tighter">Warning</p>
              <p className="text-xs text-zinc-300">High-performance post-processing active. Ensure GPU acceleration is enabled.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Side Quick Actions */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
        <button 
          onClick={() => setCameraTarget(null)}
          className={`group relative w-12 h-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all ${!cameraTarget ? 'ring-2 ring-red-600' : ''}`}
          title="Reset Camera"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="absolute right-full mr-4 px-2 py-1 bg-white text-black text-[10px] font-bold uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Reset View
          </span>
        </button>
        {customVideoUrl && (
          <button 
            onClick={() => handleQuickAction('custom')}
            className={`group relative w-12 h-12 border rounded-xl flex items-center justify-center transition-all ${
              activeMode === 'custom' 
                ? 'bg-white text-black border-white ring-2 ring-white/20' 
                : 'bg-black/40 border-white/10 text-white hover:bg-white hover:text-black'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="absolute right-full mr-4 px-2 py-1 bg-white text-black text-[10px] font-bold uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Your Video
            </span>
          </button>
        )}
        {[
          { icon: <Film />, label: "Trailers", id: 'trailers' as const },
          { icon: <Play />, label: "Now Playing", id: 'now-playing' as const },
          { icon: <Settings />, label: "Calibration", id: 'calibration' as const }
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => handleQuickAction(item.id)}
            className={`group relative w-12 h-12 border rounded-xl flex items-center justify-center transition-all ${
              activeMode === item.id 
                ? 'bg-white text-black border-white ring-2 ring-white/20' 
                : 'bg-black/40 border-white/10 text-white hover:bg-white hover:text-black'
            }`}
          >
            {item.icon}
            <span className="absolute right-full mr-4 px-2 py-1 bg-white text-black text-[10px] font-bold uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Ambient Floor Glow */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />
    </div>
  );
}
