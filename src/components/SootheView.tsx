import React, { useState } from 'react';
import { Play, Square, Volume2, Sparkles, Moon, Eye, BookOpen } from 'lucide-react';
import { soundEngine } from '../services/soundService';

interface SootheViewProps {
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
}

const SOOTHE_STORY_CHIPS = [
  {
    title: 'The Sleepy Banana',
    prompt: 'Tell a soothing 30-second rhyming lullaby about a sweet yellow banana going to sleep on a soft bakery cloud.',
  },
  {
    title: 'Whispering Supermarket',
    prompt: 'Tell a gentle rhythmic whisper-story about the quiet grocery aisles at closing time when the lights go dim.',
  },
  {
    title: 'Moonlit Cart Ride',
    prompt: 'Tell a calming 4-verse rhyme about riding softly in the front of the cart with mama and papa.',
  },
];

export const SootheView: React.FC<SootheViewProps> = ({
  isAudioPlaying,
  onToggleAudio,
  volume,
  onVolumeChange,
  isHighContrast,
  onToggleHighContrast,
}) => {
  const [activeStory, setActiveStory] = useState<string | null>(
    'Hush little baby, hear the soft wheel roll,\nPast golden loaves and the bakery bowl.\nWarm yellow bananas resting in their tree,\nDreaming gentle dreams of you and me.\n\nSoft lights dimming as the carts glide slow,\nSafe in the aisles where the night breezes blow.'
  );
  const [generatingStory, setGeneratingStory] = useState(false);
  const [activeGazePattern, setActiveGazePattern] = useState<'spiral' | 'checker' | 'rings'>('spiral');

  const generateGeminiLullaby = async (prompt: string) => {
    setGeneratingStory(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${prompt} Keep it under 6 lines, rhythmic, gentle, and calming.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setActiveStory(data.reply);
        }
      }
    } catch {
      setActiveStory(
        'The moon shines down on the market floor,\nQuiet aisles and an open door.\nRest your sleepy head so dear,\nSafe and sound, mama is here.'
      );
    } finally {
      setGeneratingStory(false);
    }
  };

  return (
    <div
      id="soothe-view"
      className="space-y-5 pb-28 text-slate-200 transition-colors"
    >
      {/* Dynamic Night/Ultra-Dark Header (zero blue-light circadian protection) */}
      <div className="rounded-3xl border border-indigo-950/80 bg-[#070714] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400">
              <Moon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Soothe & Calming Suite</h2>
              <p className="text-[11px] text-indigo-300/70">Circadian-safe ultra dark environment</p>
            </div>
          </div>

          {/* High-Contrast Acuity Toggle */}
          <button
            id="toggle-acuity-mode-btn"
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                : 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300 hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isHighContrast ? 'Acuity ON' : 'High Contrast'}</span>
          </button>
        </div>

        {/* 60 BPM Maternal Heartbeat Audio Engine */}
        <div className="mt-5 rounded-2xl bg-[#0d0d24] border border-indigo-900/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Continuous 60 BPM Synthesizer
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Generative Web Audio maternal pulse to calm infant heart rate
              </p>
            </div>

            <button
              id="soothe-audio-toggle-btn"
              onClick={onToggleAudio}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform active:scale-90 ${
                isAudioPlaying
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
              aria-label={isAudioPlaying ? 'Stop 60 BPM Pulse' : 'Play 60 BPM Pulse'}
            >
              {isAudioPlaying ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </button>
          </div>

          {/* Breathing Visual Rhythm Ring */}
          <div className="mt-4 flex flex-col items-center justify-center py-2">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                  isAudioPlaying
                    ? 'border-rose-500/40 scale-125 animate-ping opacity-60'
                    : 'border-indigo-900 scale-100 opacity-20'
                }`}
              />
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all duration-700 ${
                  isAudioPlaying
                    ? 'bg-rose-500/20 text-rose-400 shadow-rose-500/20 shadow-xl scale-110'
                    : 'bg-indigo-950 text-indigo-400'
                }`}
              >
                <span className="text-sm font-black font-mono">60 BPM</span>
              </div>
            </div>
            <span className="mt-2 text-[11px] text-slate-500">
              {isAudioPlaying
                ? 'Pulsing rhythm active (persists across tabs)'
                : 'Tap play to begin audio soothing'}
            </span>
          </div>

          {/* Volume Slider */}
          <div className="mt-3 flex items-center gap-3 border-t border-indigo-950 pt-3">
            <Volume2 className="h-4 w-4 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onVolumeChange(val);
                soundEngine.setVolume(val);
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <span className="w-9 text-right font-mono text-xs text-slate-400">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Infant Visual Acuity Module (Gaze Engagement) */}
      <div className="rounded-3xl border border-indigo-950/80 bg-[#070714] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Infant Gaze Focus Target</span>
              <span className="rounded bg-yellow-400/20 text-yellow-300 text-[10px] font-black px-1.5 py-0.5">
                Macro Geometry
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              High-contrast optical stimulation for newborn & infant visual tracking
            </p>
          </div>

          <div className="flex gap-1">
            {(['spiral', 'checker', 'rings'] as const).map((pat) => (
              <button
                key={pat}
                onClick={() => setActiveGazePattern(pat)}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${
                  activeGazePattern === pat
                    ? 'bg-yellow-400 text-black'
                    : 'bg-indigo-950 text-indigo-300'
                }`}
              >
                {pat}
              </button>
            ))}
          </div>
        </div>

        {/* High-Contrast Interactive Target */}
        <div className="flex items-center justify-center rounded-2xl bg-black p-6 border-2 border-white">
          {activeGazePattern === 'spiral' && (
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-white animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-3 rounded-full border-8 border-white animate-[spin_8s_linear_infinite_reverse]" />
              <div className="absolute inset-7 rounded-full border-8 border-white animate-[spin_5s_linear_infinite]" />
              <div className="h-6 w-6 rounded-full bg-white animate-pulse" />
            </div>
          )}

          {activeGazePattern === 'checker' && (
            <div className="grid grid-cols-4 grid-rows-4 h-32 w-32 border-4 border-white">
              {[...Array(16)].map((_, i) => {
                const isBlack = (Math.floor(i / 4) + (i % 4)) % 2 === 0;
                return (
                  <div
                    key={i}
                    className={isBlack ? 'bg-black' : 'bg-white'}
                  />
                );
              })}
            </div>
          )}

          {activeGazePattern === 'rings' && (
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="absolute h-32 w-32 rounded-full border-12 border-white" />
              <div className="absolute h-20 w-20 rounded-full border-8 border-white" />
              <div className="h-8 w-8 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>

      {/* AI Supermarket Rhymes & Lullabies */}
      <div className="rounded-3xl border border-indigo-950/80 bg-[#070714] p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">AI Supermarket Rhymes</h3>
          </div>
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        </div>

        {/* Prompt chips for cognitive offloading */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SOOTHE_STORY_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => generateGeminiLullaby(chip.prompt)}
              disabled={generatingStory}
              className="shrink-0 rounded-full border border-indigo-900 bg-indigo-950/60 px-3 py-1 text-xs font-semibold text-indigo-200 hover:bg-indigo-900 hover:text-white transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {chip.title}
            </button>
          ))}
        </div>

        {/* Story display */}
        <div className="mt-3 rounded-2xl bg-[#0c0c20] border border-indigo-900/40 p-4">
          {generatingStory ? (
            <div className="py-6 text-center text-xs text-indigo-400 animate-pulse">
              Composing a soothing grocery lullaby with Gemini...
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed text-indigo-100/90 font-serif italic">
              {activeStory}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
