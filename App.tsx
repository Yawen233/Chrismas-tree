import React, { useState } from 'react';
import Experience from './components/Experience';
import { CalibrationSettings } from './types';

// Icons
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const App: React.FC = () => {
  // 0 = Scattered, 4 = Fully Formed
  const [step, setStep] = useState<number>(0);
  const maxSteps = 4;
  
  // Projection Calibration State
  const [calibration, setCalibration] = useState<CalibrationSettings>({
    scale: 1.0,
    x: 0,
    y: 0
  });
  const [showControls, setShowControls] = useState(true);
  const [showCalibrationPanel, setShowCalibrationPanel] = useState(false);

  const handleInteraction = () => {
    setStep(prev => {
      if (prev >= maxSteps) return 0; // Reset to scatter
      return prev + 1; // Increment step
    });
  };

  const progress = step / maxSteps; // 0.0 to 1.0

  const getButtonText = () => {
    if (step === 0) return 'Begin Assembly';
    if (step === maxSteps) return 'Deconstruct';
    return `Gather (${step}/${maxSteps})`;
  };

  const updateCalibration = (key: keyof CalibrationSettings, value: number) => {
    setCalibration(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-arix-gold selection:bg-arix-emerald selection:text-white bg-black">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Experience progress={progress} calibration={calibration} />
      </div>

      {/* Control Toggle (Always visible mostly, opacity low) */}
      <div className={`absolute top-4 right-4 z-50 flex gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
        <button 
          onClick={() => setShowCalibrationPanel(!showCalibrationPanel)}
          className="p-2 bg-arix-dark/50 border border-arix-gold/30 rounded hover:bg-arix-gold/20 text-arix-gold transition-colors"
          title="Projection Settings"
        >
          <SettingsIcon />
        </button>
        <button 
          onClick={() => setShowControls(!showControls)}
          className="p-2 bg-arix-dark/50 border border-arix-gold/30 rounded hover:bg-arix-gold/20 text-arix-gold transition-colors"
          title={showControls ? "Hide UI for Projection" : "Show UI"}
        >
          <EyeOffIcon />
        </button>
      </div>

      {/* Calibration Panel */}
      {showCalibrationPanel && (
        <div className="absolute top-16 right-4 z-50 w-64 bg-arix-dark/90 border border-arix-gold p-4 rounded shadow-2xl backdrop-blur-md">
          <h3 className="font-serif text-lg mb-4 text-arix-goldLight">Projection Setup</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Scale (Size)</label>
              <input 
                type="range" min="0.1" max="3.0" step="0.05" 
                value={calibration.scale}
                onChange={(e) => updateCalibration('scale', parseFloat(e.target.value))}
                className="w-full accent-arix-gold"
              />
              <div className="text-right text-xs mt-1">{calibration.scale.toFixed(2)}x</div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Horizontal (X)</label>
              <input 
                type="range" min="-10" max="10" step="0.1" 
                value={calibration.x}
                onChange={(e) => updateCalibration('x', parseFloat(e.target.value))}
                className="w-full accent-arix-gold"
              />
              <div className="text-right text-xs mt-1">{calibration.x.toFixed(1)}</div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Vertical (Y)</label>
              <input 
                type="range" min="-10" max="10" step="0.1" 
                value={calibration.y}
                onChange={(e) => updateCalibration('y', parseFloat(e.target.value))}
                className="w-full accent-arix-gold"
              />
              <div className="text-right text-xs mt-1">{calibration.y.toFixed(1)}</div>
            </div>
            
            <button 
              onClick={() => setCalibration({ scale: 1, x: 0, y: 0 })}
              className="w-full py-2 mt-2 text-xs border border-red-900/50 text-red-300 hover:bg-red-900/20"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Main Foreground UI Layer (Hideable) */}
      <div className={`absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        <header className="flex flex-col items-start space-y-2 pointer-events-auto animate-fade-in-down">
          <h1 className="font-serif text-4xl md:text-6xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-arix-gold via-arix-goldLight to-arix-gold font-bold drop-shadow-lg">
            ARIX
          </h1>
          <h2 className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase opacity-80 border-b border-arix-gold pb-1">
            Signature Collection
          </h2>
        </header>

        {/* Center / Interaction Area (Right aligned on desktop) */}
        <div className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 flex flex-col items-end pointer-events-auto">
             <div className="flex flex-col items-end space-y-6">
                <div className="text-right max-w-xs md:max-w-sm">
                    <p className="font-serif italic text-lg md:text-2xl text-arix-goldLight opacity-90 mb-2">
                       "Unwrap the Magic."
                    </p>
                    <p className="font-sans text-xs text-gray-400 leading-relaxed hidden md:block">
                        Experience the deconstruction of luxury. A procedural masterpiece of emerald and gold, converging into the festive spirit.
                    </p>
                </div>
                
                <button 
                    onClick={handleInteraction}
                    className="group relative px-8 py-4 bg-transparent border border-arix-gold/30 hover:border-arix-gold transition-all duration-500 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-arix-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                    <span className="relative z-10 font-sans uppercase tracking-widest text-xs font-bold flex items-center text-arix-gold group-hover:text-white transition-colors duration-300">
                        <StarIcon />
                        {getButtonText()}
                    </span>
                </button>
             </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-end pointer-events-auto opacity-60">
           <div className="text-[10px] font-sans tracking-widest">
               EST. 2024
           </div>
           <div className="text-[10px] font-sans tracking-widest flex items-center gap-4">
               <span>SOUND OFF</span>
               <div className="w-12 h-[1px] bg-arix-gold" />
               <span>SCROLL</span>
           </div>
        </footer>
      </div>
      
      {/* Grain Overlay for film texture */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay bg-repeat" style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')` }}></div>
    </div>
  );
};

export default App;