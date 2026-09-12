import React from 'react';
import { Volume2, VolumeX, Heart, Square } from 'lucide-react';
import { soundEngine } from '../services/soundService';

interface AudioBarProps {
  isPlaying: boolean;
  onStop: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export const AudioBar: React.FC<AudioBarProps> = ({
  isPlaying,
  onStop,
  volume,
  onVolumeChange,
}) => {
  if (!isPlaying) return null;

  return (
    <div
      id="persistent-audio-bar"
      className="fixed bottom-[74px] left-0 right-0 z-30 mx-auto max-w-md px-3 py-1"
    >
      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/95 px-3 py-2 text-white shadow-xl backdrop-blur-md border border-slate-700/60">
        {/* Animated pulse icon */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <Heart className="h-4 w-4 animate-pulse fill-rose-500 text-rose-500" />
            <span className="absolute -inset-0.5 rounded-full border border-rose-500/40 animate-ping opacity-75" />
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-100 flex items-center gap-1.5">
              <span>60 BPM Soothe Rhythm</span>
              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300 font-mono">
                Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Maternal pulse masking store noise</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-volume-btn"
            onClick={() => {
              const newVol = volume > 0 ? 0 : 0.3;
              onVolumeChange(newVol);
              soundEngine.setVolume(newVol);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Mute / Unmute"
          >
            {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          <button
            id="stop-audio-btn"
            onClick={onStop}
            className="flex h-8 items-center gap-1 rounded-lg bg-slate-800 px-2 text-xs font-medium text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 transition-colors"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
