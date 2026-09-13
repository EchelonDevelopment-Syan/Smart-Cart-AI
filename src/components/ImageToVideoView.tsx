import React, { useState, useRef, useEffect } from 'react';
import { ImageAnimationProject, AnimationMotionStyle } from '../types';
import { SAMPLE_ANIMATION_PROJECTS } from '../data/initialData';
import {
  Film,
  Play,
  Pause,
  Download,
  Sparkles,
  Upload,
  RefreshCw,
  Sliders,
  Flame,
  Camera,
  Heart,
  RotateCw,
  Video,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ImageToVideoViewProps {
  isHighContrast: boolean;
}

export const ImageToVideoView: React.FC<ImageToVideoViewProps> = ({ isHighContrast }) => {
  const [projects] = useState<ImageAnimationProject[]>(SAMPLE_ANIMATION_PROJECTS);
  const [activeProject, setActiveProject] = useState<ImageAnimationProject>(SAMPLE_ANIMATION_PROJECTS[0]);
  const [motionStyle, setMotionStyle] = useState<AnimationMotionStyle>('steam_sizzle');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(6);
  const [speed, setSpeed] = useState(1);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [aiNarrationText, setAiNarrationText] = useState<string>(
    'Sautéed shaved ribeye and melted provolone tucked into golden bakery hoagie rolls. Pure culinary warmth.'
  );
  const [isGeneratingAiStory, setIsGeneratingAiStory] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Steam & sizzle particle pool
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number }>>([]);

  // Load active image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = activeProject.imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
    };
  }, [activeProject]);

  // Generate AI Story / Narration for the chosen item
  const fetchAiNarration = async (title: string, style: AnimationMotionStyle, caption: string) => {
    setIsGeneratingAiStory(true);
    try {
      const res = await fetch('/api/generate-video-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, style, caption }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.narration) setAiNarrationText(data.narration);
      }
    } catch {
      setAiNarrationText(`Fresh, golden, and crafted with love. Savor every bite of ${title}.`);
    } finally {
      setIsGeneratingAiStory(false);
    }
  };

  // Speaks narration aloud using browser speech synthesis if enabled
  const speakNarration = () => {
    if (!narrationEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(aiNarrationText);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Main Canvas Animation Loop (Ken Burns, Steam & Sizzle, Macro Orbit, Rhythmic Pulse)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = Date.now();

    const render = () => {
      const now = Date.now();
      const elapsed = ((now - startTimeRef.current) / 1000) * speed;
      const t = (elapsed % durationSec) / durationSec; // 0 to 1 loop progress

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const img = imageObjRef.current;
      if (img && img.complete) {
        ctx.save();

        // Canvas size: 800 x 600
        const cw = canvas.width;
        const ch = canvas.height;

        if (motionStyle === 'ken_burns') {
          // Slow cinematic zoom & pan
          const scale = 1.05 + 0.15 * Math.sin(t * Math.PI);
          const panX = 15 * Math.sin(t * Math.PI * 2);
          const panY = -10 * Math.cos(t * Math.PI);

          ctx.translate(cw / 2 + panX, ch / 2 + panY);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
          ctx.restore();

          // Soft cinematic vignette
          const gradient = ctx.createRadialGradient(cw / 2, ch / 2, cw / 4, cw / 2, ch / 2, cw / 1.5);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.55)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, cw, ch);

        } else if (motionStyle === 'steam_sizzle') {
          // Warm zoom + dynamic steam & sizzle embers
          const scale = 1.08 + 0.04 * Math.sin(t * Math.PI * 4);
          ctx.translate(cw / 2, ch / 2);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
          ctx.restore();

          // Sizzle Glow & Warmth
          const warmGlow = ctx.createRadialGradient(cw / 2, ch * 0.6, 20, cw / 2, ch * 0.6, cw / 2);
          warmGlow.addColorStop(0, `rgba(245, 158, 11, ${0.12 + 0.08 * Math.sin(t * 8)})`);
          warmGlow.addColorStop(1, 'rgba(0,0,0,0.4)');
          ctx.fillStyle = warmGlow;
          ctx.fillRect(0, 0, cw, ch);

          // Generate steam particles
          if (particlesRef.current.length < 45 && Math.random() > 0.4) {
            particlesRef.current.push({
              x: cw * 0.25 + Math.random() * (cw * 0.5),
              y: ch * 0.75,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -1.2 - Math.random() * 1.5,
              radius: 6 + Math.random() * 14,
              alpha: 0.45,
              life: 1,
            });
          }

          // Draw steam particles
          particlesRef.current.forEach((p, idx) => {
            p.x += p.vx;
            p.y += p.vy;
            p.radius += 0.35;
            p.alpha -= 0.007;
            p.life -= 0.015;

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.alpha)})`;
            ctx.filter = 'blur(6px)';
            ctx.fill();
            ctx.restore();

            if (p.life <= 0 || p.alpha <= 0) {
              particlesRef.current.splice(idx, 1);
            }
          });

        } else if (motionStyle === 'macro_orbit') {
          // 360 rotating orbit camera
          const angle = (t * Math.PI * 2) * 0.08;
          const scale = 1.12 + 0.06 * Math.cos(t * Math.PI * 2);
          const offsetX = Math.cos(angle) * 18;
          const offsetY = Math.sin(angle) * 12;

          ctx.translate(cw / 2 + offsetX, ch / 2 + offsetY);
          ctx.scale(scale, scale);
          ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
          ctx.restore();

          // Orbit light lens sweep
          const sweepX = cw * t;
          const flare = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, ch);
          flare.addColorStop(0, 'rgba(255,255,255,0)');
          flare.addColorStop(0.5, 'rgba(255,255,255,0.18)');
          flare.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = flare;
          ctx.fillRect(0, 0, cw, ch);

        } else if (motionStyle === 'culinary_glow') {
          // Warm appetizing culinary breathing zoom
          const pulse = 1 + 0.05 * Math.sin(elapsed * Math.PI * 1.5);
          ctx.translate(cw / 2, ch / 2);
          ctx.scale(pulse, pulse);
          ctx.drawImage(img, -cw / 2, -ch / 2, cw, ch);
          ctx.restore();

          // Warm golden culinary rim lighting
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + 0.2 * Math.sin(elapsed * Math.PI * 1.5)})`;
          ctx.lineWidth = 6;
          ctx.strokeRect(10, 10, cw - 20, ch - 20);
        }

        // Subtitle Overlay
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(20, ch - 80, cw - 40, 60);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(activeProject.title, cw / 2, ch - 48);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        ctx.fillText(activeProject.caption.slice(0, 75) + '...', cw / 2, ch - 26);
        ctx.restore();
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, motionStyle, durationSec, speed, activeProject]);

  // Record Real WebM Video from Canvas
  const handleRecordVideoClip = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsRecordingVideo(true);
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];

      // Capture 30fps stream from canvas
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoUrl(videoUrl);
        setIsRecordingVideo(false);
      };

      recorder.start();
      speakNarration();

      // Stop recorder after project duration
      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, durationSec * 1000);
    } catch (err) {
      console.error('Failed to record video stream from canvas:', err);
      setIsRecordingVideo(false);
    }
  };

  // Upload Custom Photo to Animate
  const handleUploadCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const customProj: ImageAnimationProject = {
        id: `custom-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl: event.target?.result as string,
        caption: 'User photo animated with SmartCart AI camera motion.',
        motionStyle: 'steam_sizzle',
        durationSeconds: 6,
        includeNarration: true,
      };
      setActiveProject(customProj);
      fetchAiNarration(customProj.title, 'steam_sizzle', customProj.caption);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="image-to-video-view" className="space-y-4 pb-28">
      {/* Header Banner */}
      <div
        className={`rounded-3xl p-5 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-2 border-white'
            : 'bg-gradient-to-br from-amber-700 via-orange-900 to-rose-950 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-amber-200">
          <span className="flex items-center gap-1.5">
            <Film className="h-4 w-4 text-amber-300" />
            Image-to-Video Motion Studio
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] uppercase font-mono">
            60 FPS Video Engine
          </span>
        </div>

        <h2 className="mt-2 text-xl font-black tracking-tight">
          Animate Food & Images into Video
        </h2>
        <p className="mt-1 text-xs text-amber-100/90 leading-relaxed">
          Transform static dish images, fresh supermarket produce, or custom photos into cinematic looping video clips with camera motion, steam effects, and video export.
        </p>

        {/* Video Render Action Button */}
        <div className="mt-4 flex items-center gap-2">
          <button
            id="record-video-clip-btn"
            onClick={handleRecordVideoClip}
            disabled={isRecordingVideo}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-black shadow-lg transition-transform active:scale-95 ${
              isRecordingVideo
                ? 'bg-rose-500 text-white animate-pulse'
                : isHighContrast
                ? 'bg-yellow-400 text-black font-black'
                : 'bg-white text-slate-950 hover:bg-amber-50'
            }`}
          >
            {isRecordingVideo ? (
              <>
                <Video className="h-4 w-4 animate-spin" />
                <span>Recording Video Clip ({durationSec}s)...</span>
              </>
            ) : (
              <>
                <Video className="h-4 w-4 text-rose-600" />
                <span>Record & Export Video File ({durationSec}s)</span>
              </>
            )}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/10 px-3.5 py-3 text-xs font-bold text-white hover:bg-white/20 active:scale-95"
            title="Upload an image to animate"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadCustomImage}
          />
        </div>
      </div>

      {/* Main Canvas Video Preview Display */}
      <div
        className={`overflow-hidden rounded-3xl border transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md'
        }`}
      >
        <div className="relative aspect-4/3 w-full bg-black">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />

          {/* Floating Canvas Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {motionStyle.replace('_', ' ')}
            </span>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={() => {
                setNarrationEnabled(!narrationEnabled);
                if (!narrationEnabled) speakNarration();
              }}
              className="rounded-full bg-black/70 backdrop-blur-md p-2 text-white hover:bg-black/90 active:scale-90"
              title={narrationEnabled ? 'Mute AI Voiceover' : 'Play AI Voiceover'}
            >
              {narrationEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full bg-black/70 backdrop-blur-md p-2 text-white hover:bg-black/90 active:scale-90"
              title={isPlaying ? 'Pause Animation' : 'Play Animation'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Video Scrubber & Playback Settings */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span>{activeProject.title}</span>
            </div>
            <span className="text-[11px] text-slate-400">Length: {durationSec}s</span>
          </div>

          {/* Motion Style Selector Chips */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Video Motion Style:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: 'steam_sizzle', label: 'Steam & Sizzle', icon: Flame },
                { id: 'ken_burns', label: 'Cinematic Push', icon: Film },
                { id: 'macro_orbit', label: '360 Orbit', icon: RotateCw },
                { id: 'culinary_glow', label: 'Golden Glow', icon: Sparkles },
              ].map((style) => {
                const Icon = style.icon;
                const isSelected = motionStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      setMotionStyle(style.id as AnimationMotionStyle);
                      fetchAiNarration(activeProject.title, style.id as AnimationMotionStyle, activeProject.caption);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2.5 text-xs font-bold transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Exported Video Player Section (When recorded) */}
      {recordedVideoUrl && (
        <div
          className={`rounded-3xl border p-4 space-y-3 transition-colors ${
            isHighContrast
              ? 'bg-black text-white border-white'
              : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Video Rendered Successfully!
                </h3>
                <span className="text-[11px] text-slate-500">WebM video ready to play or download</span>
              </div>
            </div>

            <a
              href={recordedVideoUrl}
              download={`${activeProject.title.toLowerCase().replace(/\s+/g, '_')}_animation.webm`}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-transform"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Video</span>
            </a>
          </div>

          <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-black">
            <video
              src={recordedVideoUrl}
              controls
              autoPlay
              loop
              className="w-full aspect-4/3 object-cover"
            />
          </div>
        </div>
      )}

      {/* Image Gallery Presets to Animate */}
      <div
        className={`rounded-3xl border p-4 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
        }`}
      >
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2.5">
          Choose Food or Grocery Dish to Animate
        </span>

        <div className="grid grid-cols-2 gap-2">
          {projects.map((proj) => {
            const isSelected = activeProject.id === proj.id;
            return (
              <button
                key={proj.id}
                onClick={() => {
                  setActiveProject(proj);
                  setRecordedVideoUrl(null);
                  fetchAiNarration(proj.title, motionStyle, proj.caption);
                }}
                className={`flex flex-col items-start text-left rounded-2xl border p-2 transition-all active:scale-98 overflow-hidden ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/30'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="h-24 w-full rounded-xl object-cover mb-1.5"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {proj.title}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  {proj.caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
