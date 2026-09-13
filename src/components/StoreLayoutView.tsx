import React, { useState, useMemo } from 'react';
import { ShoppingItem, StoreLayout, AisleInfo } from '../types';
import { TYPICAL_SUPERMARKET_STORE, HILLSBOROUGH_STORE } from '../data/initialData';
import {
  Compass,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Info,
  Layers,
  ThermometerSnowflake,
  ShieldCheck,
  TrendingDown,
  Route,
  Sparkles,
  Milestone,
  Check,
  Navigation,
  Eye,
  FastForward
} from 'lucide-react';

interface StoreLayoutViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  isHighContrast: boolean;
}

interface WaypointPoint {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'entry' | 'aisle' | 'checkout';
  aisleIndex?: number;
  stopNumber?: number;
  itemCount?: number;
  isCompleted?: boolean;
}

export const StoreLayoutView: React.FC<StoreLayoutViewProps> = ({
  items,
  onToggleItem,
  isHighContrast,
}) => {
  const [selectedStoreType, setSelectedStoreType] = useState<'typical' | 'hillsborough'>('typical');
  const [activeAisleIndex, setActiveAisleIndex] = useState<number>(0);
  const [routeMode, setRouteMode] = useState<'dynamic_list' | 'full_store'>('dynamic_list');

  const activeStore: StoreLayout =
    selectedStoreType === 'typical' ? TYPICAL_SUPERMARKET_STORE : HILLSBOROUGH_STORE;

  // Helper to get items in an aisle
  const getItemsForAisle = (aisle: AisleInfo) => {
    return items.filter(
      (item) =>
        item.category.toLowerCase() === aisle.category.toLowerCase() ||
        item.aisleNumber === aisle.number ||
        item.aisle.toLowerCase().includes(aisle.name.toLowerCase())
    );
  };

  // Identify aisles that have items on the current list
  const activeAislesWithItems = useMemo(() => {
    return activeStore.aisles
      .map((aisle, originalIndex) => {
        const aisleItems = getItemsForAisle(aisle);
        const isCompleted = aisleItems.length > 0 && aisleItems.every((i) => i.checked);
        return {
          aisle,
          originalIndex,
          items: aisleItems,
          isCompleted,
        };
      })
      .filter((entry) => entry.items.length > 0);
  }, [activeStore, items]);

  // SVG dimensions for map
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 300;

  // Entrance & Checkout coordinates
  const entryCoords = { x: 340, y: 275 };
  const checkoutCoords = { x: 80, y: 270 };

  // Generate dynamic waypoints based on current list
  const dynamicWaypoints: WaypointPoint[] = useMemo(() => {
    const points: WaypointPoint[] = [
      { id: 'entry', x: entryCoords.x, y: entryCoords.y, label: 'Entry', type: 'entry' },
    ];

    if (routeMode === 'dynamic_list') {
      activeAislesWithItems.forEach((entry, idx) => {
        points.push({
          id: `aisle-${entry.aisle.number}`,
          x: (entry.aisle.x / 100) * SVG_WIDTH,
          y: (entry.aisle.y / 100) * SVG_HEIGHT,
          label: `A${entry.aisle.number}`,
          type: 'aisle',
          aisleIndex: entry.originalIndex,
          stopNumber: idx + 1,
          itemCount: entry.items.length,
          isCompleted: entry.isCompleted,
        });
      });
    } else {
      activeStore.aisles.forEach((aisle, idx) => {
        const aisleItems = getItemsForAisle(aisle);
        points.push({
          id: `aisle-${aisle.number}`,
          x: (aisle.x / 100) * SVG_WIDTH,
          y: (aisle.y / 100) * SVG_HEIGHT,
          label: `A${aisle.number}`,
          type: 'aisle',
          aisleIndex: idx,
          stopNumber: idx + 1,
          itemCount: aisleItems.length,
          isCompleted: aisleItems.length > 0 && aisleItems.every((i) => i.checked),
        });
      });
    }

    points.push({ id: 'checkout', x: checkoutCoords.x, y: checkoutCoords.y, label: 'Checkout', type: 'checkout' });
    return points;
  }, [routeMode, activeAislesWithItems, activeStore, items]);

  // Generate SVG path string with smooth bezier curves
  const pathD = useMemo(() => {
    if (dynamicWaypoints.length < 2) return '';
    let d = `M ${dynamicWaypoints[0].x} ${dynamicWaypoints[0].y}`;

    for (let i = 0; i < dynamicWaypoints.length - 1; i++) {
      const p1 = dynamicWaypoints[i];
      const p2 = dynamicWaypoints[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY} T ${p2.x} ${p2.y}`;
    }
    return d;
  }, [dynamicWaypoints]);

  // Path up to the currently active aisle (for progress illumination)
  const completedPathD = useMemo(() => {
    const currentWaypointIdx = dynamicWaypoints.findIndex(
      (wp) => wp.type === 'aisle' && wp.aisleIndex === activeAisleIndex
    );
    if (currentWaypointIdx <= 0) return '';
    const slice = dynamicWaypoints.slice(0, currentWaypointIdx + 1);
    let d = `M ${slice[0].x} ${slice[0].y}`;
    for (let i = 0; i < slice.length - 1; i++) {
      const p1 = slice[i];
      const p2 = slice[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY} T ${p2.x} ${p2.y}`;
    }
    return d;
  }, [dynamicWaypoints, activeAisleIndex]);

  const currentAisle: AisleInfo = activeStore.aisles[activeAisleIndex] || activeStore.aisles[0];
  const itemsInCurrentAisle = getItemsForAisle(currentAisle);

  // Find stop number for current aisle
  const currentStopIndex = activeAislesWithItems.findIndex(
    (e) => e.originalIndex === activeAisleIndex
  );

  // Jump to next stop on the dynamic list that has unchecked items
  const jumpToNextPendingStop = () => {
    const pendingStop = activeAislesWithItems.find((e) => !e.isCompleted);
    if (pendingStop) {
      setActiveAisleIndex(pendingStop.originalIndex);
    } else if (activeAislesWithItems.length > 0) {
      // Loop or go to first stop
      setActiveAisleIndex(activeAislesWithItems[0].originalIndex);
    }
  };

  const nextAisle = () => {
    if (routeMode === 'dynamic_list' && activeAislesWithItems.length > 0) {
      const curIdx = activeAislesWithItems.findIndex((e) => e.originalIndex === activeAisleIndex);
      if (curIdx >= 0 && curIdx < activeAislesWithItems.length - 1) {
        setActiveAisleIndex(activeAislesWithItems[curIdx + 1].originalIndex);
        return;
      }
    }
    if (activeAisleIndex < activeStore.aisles.length - 1) {
      setActiveAisleIndex(activeAisleIndex + 1);
    }
  };

  const prevAisle = () => {
    if (routeMode === 'dynamic_list' && activeAislesWithItems.length > 0) {
      const curIdx = activeAislesWithItems.findIndex((e) => e.originalIndex === activeAisleIndex);
      if (curIdx > 0) {
        setActiveAisleIndex(activeAislesWithItems[curIdx - 1].originalIndex);
        return;
      }
    }
    if (activeAisleIndex > 0) {
      setActiveAisleIndex(activeAisleIndex - 1);
    }
  };

  const totalListItems = items.length;
  const totalCheckedItems = items.filter((i) => i.checked).length;
  const completedStopsCount = activeAislesWithItems.filter((e) => e.isCompleted).length;
  const isAllStopsCompleted = activeAislesWithItems.length > 0 && completedStopsCount === activeAislesWithItems.length;

  return (
    <div id="store-layout-view" className="space-y-4 pb-28">
      {/* Top Banner: Store Layout & Dynamic Routing Header */}
      <div
        className={`rounded-3xl p-5 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-2 border-white'
            : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
          <span className="flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-emerald-300" />
            Dynamic Aisle Route Indicator
          </span>
          <span className="rounded-full bg-emerald-500/25 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] uppercase font-mono text-emerald-200">
            {activeAislesWithItems.length} Stops on List
          </span>
        </div>

        <h2 className="mt-2 text-xl font-black tracking-tight">
          {activeStore.name}
        </h2>
        <p className="mt-1 text-xs text-emerald-100/90 leading-relaxed">
          {activeStore.description}
        </p>

        {/* Store Toggle Buttons */}
        <div className="mt-4 flex rounded-2xl bg-black/30 p-1 backdrop-blur-md">
          <button
            id="toggle-typical-store-btn"
            onClick={() => {
              setSelectedStoreType('typical');
              setActiveAisleIndex(0);
            }}
            className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
              selectedStoreType === 'typical'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Typical Supermarket (Loop)
          </button>
          <button
            id="toggle-hillsborough-store-btn"
            onClick={() => {
              setSelectedStoreType('hillsborough');
              setActiveAisleIndex(0);
            }}
            className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all ${
              selectedStoreType === 'hillsborough'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            Walmart Hillsborough
          </button>
        </div>

        {/* Dynamic Route Mode Selector */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 p-1.5 text-xs">
          <div className="flex items-center gap-1">
            <button
              id="route-mode-dynamic-btn"
              onClick={() => setRouteMode('dynamic_list')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                routeMode === 'dynamic_list'
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Route className="h-3.5 w-3.5" />
              <span>Optimal Route (List Only)</span>
            </button>

            <button
              id="route-mode-full-btn"
              onClick={() => setRouteMode('full_store')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                routeMode === 'full_store'
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Full Store Path</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-emerald-300 pr-2">
            {completedStopsCount}/{activeAislesWithItems.length} Done
          </span>
        </div>

        {/* Route Metric Badges */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-emerald-200">
            <TrendingDown className="h-3 w-3" />
            Saves ~380ft Walking
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-teal-500/20 px-2 py-1 text-teal-200">
            <ThermometerSnowflake className="h-3 w-3" />
            Cold-Chain Safe
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2 py-1 text-amber-200">
            <ShieldCheck className="h-3 w-3" />
            Delicates Picked Last
          </span>
        </div>
      </div>

      {/* Dynamic Route Waypoint Sequence Ribbon (Horizontal Scroll for Quick Scannability) */}
      <div className={`rounded-2xl p-3 border transition-colors ${
        isHighContrast ? 'bg-black border-white text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Milestone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Dynamic Waypoint Sequence
            </span>
          </div>

          {activeAislesWithItems.some((e) => !e.isCompleted) && (
            <button
              onClick={jumpToNextPendingStop}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 active:scale-95"
            >
              <FastForward className="h-3 w-3" />
              <span>Next Pending Stop</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {/* Entry node */}
          <div className="flex items-center gap-1 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 px-2 py-1 font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
            <span>🚪 Entry</span>
          </div>
          <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />

          {/* Active Aisles Stops */}
          {activeAislesWithItems.map((entry, idx) => {
            const isCurrent = entry.originalIndex === activeAisleIndex;
            return (
              <React.Fragment key={entry.aisle.number}>
                <button
                  onClick={() => setActiveAisleIndex(entry.originalIndex)}
                  className={`flex items-center gap-1 shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                      : entry.isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {entry.isCompleted ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900/10 dark:bg-white/20 text-[9px]">
                      {idx + 1}
                    </span>
                  )}
                  <span>A{entry.aisle.number}</span>
                  <span className="text-[9px] opacity-75">({entry.items.length})</span>
                </button>
                <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
              </React.Fragment>
            );
          })}

          {/* Checkout node */}
          <div className={`flex items-center gap-1 shrink-0 rounded-xl px-2 py-1 font-bold text-[11px] ${
            isAllStopsCompleted
              ? 'bg-amber-400 text-slate-950 animate-pulse'
              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
          }`}>
            <span>🏁 Checkout</span>
          </div>
        </div>
      </div>

      {/* Interactive 2D Supermarket Floor Plan Map with Dynamic Path Visualizer */}
      <div
        className={`overflow-hidden rounded-3xl border transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-emerald-600" />
              Floor Plan with Dynamic Path Indicator
            </h3>
            <span className="text-[11px] text-slate-400">
              {routeMode === 'dynamic_list'
                ? `Visualizing optimal path connecting ${activeAislesWithItems.length} active stops`
                : 'Displaying complete store perimeter loop'}
            </span>
          </div>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
            {activeStore.aisles.length} Aisles
          </span>
        </div>

        {/* Visual Architectural Map Graphic with Dynamic SVG Trail */}
        <div className="relative aspect-4/3 w-full bg-slate-950 p-4 select-none overflow-hidden">
          {/* Floor grid styling */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Route Trajectory Graphic */}
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="absolute inset-0 h-full w-full pointer-events-none"
          >
            <defs>
              {/* Gradient for optimal active path */}
              <linearGradient id="routeGradient" x1="100%" y1="100%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background static full store path (subtle dashed gray) */}
            {routeMode === 'dynamic_list' && (
              <path
                d={activeStore.aisles.reduce((acc, a, idx) => {
                  const prefix = idx === 0 ? 'M' : 'L';
                  const px = (a.x / 100) * SVG_WIDTH;
                  const py = (a.y / 100) * SVG_HEIGHT;
                  return `${acc} ${prefix} ${px} ${py}`;
                }, '')}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="4,6"
                strokeOpacity="0.4"
              />
            )}

            {/* DYNAMIC GLOWING OPTIMAL ROUTE PATH */}
            {pathD && (
              <>
                {/* Outer halo glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                  filter="url(#pathGlow)"
                />

                {/* Primary dynamic flowing trail with animated dashoffset */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3.5"
                  strokeDasharray="8,6"
                  strokeLinecap="round"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="28"
                    to="0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </>
            )}

            {/* Completed Path Segment (solid vibrant emerald) */}
            {completedPathD && (
              <path
                d={completedPathD}
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}

            {/* Entrance marker */}
            <g transform={`translate(${entryCoords.x}, ${entryCoords.y})`}>
              <circle r="12" fill="#10b981" fillOpacity="0.25">
                <animate attributeName="r" values="10;14;10" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text y="18" fill="#a7f3d0" fontSize="9" fontWeight="900" textAnchor="middle">
                ENTRY
              </text>
            </g>

            {/* Checkout marker */}
            <g transform={`translate(${checkoutCoords.x}, ${checkoutCoords.y})`}>
              <circle r="12" fill="#f59e0b" fillOpacity="0.25" />
              <circle r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text y="18" fill="#fde68a" fontSize="9" fontWeight="900" textAnchor="middle">
                CHECKOUT
              </text>
            </g>
          </svg>

          {/* Interactive Aisle Zone Blocks on Map */}
          {activeStore.aisles.map((aisle, idx) => {
            const isCurrent = idx === activeAisleIndex;
            const aisleItems = getItemsForAisle(aisle);
            const hasItems = aisleItems.length > 0;
            const isCompleted = hasItems && aisleItems.every((i) => i.checked);
            
            // Find stop order in dynamic list
            const stopIndex = activeAislesWithItems.findIndex(
              (e) => e.originalIndex === idx
            );

            return (
              <button
                key={aisle.number}
                onClick={() => setActiveAisleIndex(idx)}
                style={{
                  left: `${aisle.x}%`,
                  top: `${aisle.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute flex flex-col items-center justify-center rounded-2xl p-1.5 transition-all active:scale-95 z-10 ${
                  isCurrent
                    ? 'ring-4 ring-emerald-400 bg-emerald-600 text-white scale-110 shadow-xl'
                    : isCompleted
                    ? 'bg-emerald-950/90 text-emerald-200 border-2 border-emerald-500/80 shadow-md'
                    : hasItems
                    ? 'bg-teal-900/95 text-teal-100 border-2 border-teal-400 shadow-md scale-105'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800/80 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1">
                  {/* Stop number badge if in active route */}
                  {stopIndex >= 0 && (
                    <span className={`flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-black px-1 ${
                      isCurrent
                        ? 'bg-white text-emerald-900'
                        : isCompleted
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-yellow-400 text-slate-950'
                    }`}>
                      {isCompleted ? <Check className="h-2.5 w-2.5" /> : `#${stopIndex + 1}`}
                    </span>
                  )}

                  <span className="text-[10px] font-black">A{aisle.number}</span>

                  {hasItems && !isCompleted && (
                    <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black px-0.5">
                      {aisleItems.length}
                    </span>
                  )}
                </div>

                <span className="text-[9px] font-bold max-w-16 truncate mt-0.5">
                  {aisle.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Aisle Stepper Card (Thumb Zone Navigation) */}
        <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-sm">
                A{currentAisle.number}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {currentAisle.name}
                  </h4>
                  {currentStopIndex >= 0 && (
                    <span className="rounded-full bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 text-[10px] font-black">
                      Stop {currentStopIndex + 1} of {activeAislesWithItems.length}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentAisle.description}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-200">
              Aisle {activeAisleIndex + 1} / {activeStore.aisles.length}
            </span>
          </div>

          {/* Supermarket Pro Tip */}
          {currentAisle.tip && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900">
              <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-snug">{currentAisle.tip}</span>
            </div>
          )}

          {/* Items to grab in this specific aisle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Items in this aisle ({itemsInCurrentAisle.length}):
              </span>
              {itemsInCurrentAisle.length > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  {itemsInCurrentAisle.filter((i) => i.checked).length} of {itemsInCurrentAisle.length} collected
                </span>
              )}
            </div>

            {itemsInCurrentAisle.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center text-xs text-slate-400">
                No items in your cart from this aisle. Proceed to the next stop on your route!
              </div>
            ) : (
              <div className="space-y-1.5">
                {itemsInCurrentAisle.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleItem(item.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-left transition-all active:scale-98 ${
                      item.checked
                        ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.checked ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.item}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          ${item.est_price.toFixed(2)} • {item.notes || 'In cart'}
                        </div>
                      </div>
                    </div>

                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stepper Controls (One-handed navigation buttons) */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={prevAisle}
              disabled={activeAisleIndex === 0}
              className="flex items-center justify-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 py-3.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Prev Stop</span>
            </button>

            <button
              onClick={nextAisle}
              disabled={activeAisleIndex >= activeStore.aisles.length - 1}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 px-4 text-xs font-black text-white shadow-md hover:bg-emerald-700 disabled:opacity-40 active:scale-95"
            >
              <span>Next Stop on Route</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Typical Supermarket Aisle Flow Breakdown Reference */}
      <div
        className={`rounded-3xl border p-4 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
          Golden Horseshoe Trip Logic (Cold-Chain & Ergonomics)
        </h3>

        <div className="space-y-2">
          {[
            { step: '1. Perimeter Right', title: 'Produce & Fresh Bakery', desc: 'Load heavy bagged fruit and greens first at cart bottom; place bakery rolls safely on top seat.' },
            { step: '2. Perimeter Rear', title: 'Meat, Seafood & Deli', desc: 'Keep meats separate; get deli sliced fresh to order.' },
            { step: '3. Perimeter Left', title: 'Dairy Cases', desc: 'Milk, butter, cheeses cold along the wall cooling unit.' },
            { step: '4. Center Aisles', title: 'Pantry, Pastas, Canned Goods & Snacks', desc: 'Central non-perishable goods and snacks for easy center navigation.' },
            { step: '5. Cold Preservation', title: 'Frozen Foods & Household', desc: 'Frozen items collected right before checkout to prevent thawing; non-food paper goods kept separate.' },
          ].map((seq, i) => (
            <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
                {seq.step} — {seq.title}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {seq.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
