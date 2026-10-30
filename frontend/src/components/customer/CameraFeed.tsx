'use client';
import React, { useState } from 'react';

export default function CameraFeed() {
  const [zoomLevel, setZoomLevel] = useState('1x');

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h3 className="font-bold text-lg text-slate-100">🔴 Camera Live Stream (Góc Cận)</h3>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
          Khay #TR-08 | 1080p 60fps
        </span>
      </div>

      {/* Khung Giả Lập Video Live Stream */}
      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
        <div className="text-center space-y-2">
          <span className="text-5xl">🍄</span>
          <p className="text-sm text-slate-400 font-medium">Đang phát trực tiếp từ Buồng Nấm Cleanroom #01...</p>
        </div>

        {/* HUD Overlay trên Video */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-md text-xs font-mono text-emerald-400 border border-slate-700">
          Zoom: {zoomLevel} | Sensor Sync: OK
        </div>

        {/* Các nút điều khiển giả lập góc quay */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          {['1x', '2x', '4x'].map((zoom) => (
            <button
              key={zoom}
              onClick={() => setZoomLevel(zoom)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                zoomLevel === zoom
                  ? 'bg-[#D4AF37] text-slate-950'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {zoom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}