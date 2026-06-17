'use client';

import React, { useRef, useState } from 'react';
import { Upload, Download, RotateCcw } from 'lucide-react';

export function IDPhotoTool() {
  const [src, setSrc] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [fileName, setFileName] = useState('id-photo');

  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [widthPx, setWidthPx] = useState<number>(413); // pixels
  const [heightPx, setHeightPx] = useState<number>(531); // pixels
  const [dpi, setDpi] = useState<number>(300);
  const [preset, setPreset] = useState<string>('custom');

  const PRESETS: Record<string, { label: string; wmm: number; hmm: number }> = {
    '1inch': { label: '1 寸', wmm: 25.4, hmm: 35.6 },
    '2inch': { label: '2 寸', wmm: 35, hmm: 49 },
    'idcard': { label: '身份证', wmm: 26, hmm: 32 },
    'passport': { label: '护照', wmm: 35, hmm: 45 },
  };

  function mmToPx(mm: number, dpiVal: number) {
    return Math.round((mm / 25.4) * dpiVal);
  }

  function applyPreset(p: string) {
    if (p === 'custom') return;
    const meta = PRESETS[p];
    if (!meta) return;
    const w = mmToPx(meta.wmm, dpi);
    const h = mmToPx(meta.hmm, dpi);
    setWidthPx(w);
    setHeightPx(h);
    setPreset(p);
  }

  const fileRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name.replace(/\.[^/.]+$/, ''));
    const r = new FileReader();
    r.onload = () => setSrc(r.result as string);
    r.readAsDataURL(f);
  }

  async function renderOutput() {
    if (!src) return;
    setIsRendering(true);
    setStatusMsg('正在生成证件照...');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      await new Promise((res, rej) => { img.onload = () => res(true); img.onerror = rej; });

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // fill background
      ctx.fillStyle = bgColor || '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // compute draw size based on zoom
      const drawW = img.width * zoom;
      const drawH = img.height * zoom;

      // center point adjusted by offsets
      const dx = (canvas.width - drawW) / 2 + offsetX;
      const dy = (canvas.height - drawH) / 2 + offsetY;

      ctx.drawImage(img, dx, dy, drawW, drawH);

      const dataUrl = canvas.toDataURL('image/png');
      setOutput(dataUrl);
      canvasRef.current = canvas;
      setStatusMsg('生成完成，可下载或继续调整。');
      setTimeout(() => setStatusMsg(''), 3500);
    } catch (e) {
      setStatusMsg('生成失败，请重试。');
      console.error(e);
      setTimeout(() => setStatusMsg(''), 5000);
    } finally {
      setIsRendering(false);
    }
  }

  

  function download() {
    const url = output || canvasRef.current?.toDataURL();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-id.png`;
    a.click();
  }

  function reset() {
    setSrc(null);
    setOutput(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBgColor('#ffffff');
    setWidthPx(413);
    setHeightPx(531);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="w-4 h-4" /> 选择照片
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        <button onClick={renderOutput} disabled={isRendering} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          {isRendering ? '生成中...' : '生成证件照'}
        </button>

        <div className="flex-1" />

        <button onClick={reset} disabled={isRendering} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"><RotateCcw className="w-4 h-4" />重置</button>
        {(output || src) && (
          <button onClick={download} disabled={isRendering} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Download className="w-4 h-4" />下载</button>
        )}
      </div>

      {statusMsg && <div className="p-2 text-sm text-gray-700">{statusMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">预览 (可缩放/平移)</label>
          <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[240px] flex items-center justify-center p-4 overflow-hidden">
            <div style={{ width: `${widthPx}px`, height: `${heightPx}px`, background: bgColor }} className="relative overflow-hidden">
              {src ? (
                <img src={src} alt="source" style={{ transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`, transformOrigin: 'center center' }} className="max-w-none" />
              ) : (
                <div className="text-gray-400 text-sm p-8">选择图片后在此预览并调整位置与缩放</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm font-medium mb-3">设置</div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">预设尺寸</label>
              <div className="flex gap-2 mt-1 items-center">
                <select value={preset} onChange={(e) => applyPreset(e.target.value)} className="p-2 border rounded-md text-sm">
                  <option value="custom">自定义</option>
                  {Object.keys(PRESETS).map((k) => (
                    <option key={k} value={k}>{PRESETS[k].label}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500">DPI</div>
                <input type="number" value={dpi} onChange={(e) => setDpi(Number(e.target.value) || 300)} className="w-20 p-2 border rounded-md text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600">输出尺寸 (像素)</label>
              <div className="flex gap-2 mt-1 items-center">
                <input type="number" value={widthPx} onChange={(e) => { setWidthPx(Number(e.target.value) || 1); setPreset('custom'); }} className="w-24 p-2 border rounded-md text-sm" />
                <input type="number" value={heightPx} onChange={(e) => { setHeightPx(Number(e.target.value) || 1); setPreset('custom'); }} className="w-24 p-2 border rounded-md text-sm" />
                <div className="text-xs text-gray-500">（{Math.round((widthPx/ dpi)*25.4)}mm × {Math.round((heightPx/ dpi)*25.4)}mm）</div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600">背景颜色</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-1" />
            </div>

            <div>
              <label className="block text-xs text-gray-600">缩放</label>
              <input type="range" min={0.2} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-xs text-gray-600">水平偏移</label>
              <input type="range" min={-500} max={500} step={1} value={offsetX} onChange={(e) => setOffsetX(Number(e.target.value))} className="w-full" />
            </div>

            <div>
              <label className="block text-xs text-gray-600">垂直偏移</label>
              <input type="range" min={-500} max={500} step={1} value={offsetY} onChange={(e) => setOffsetY(Number(e.target.value))} className="w-full" />
            </div>

            <div className="text-xs text-gray-500">调整后点击“生成证件照”生成并下载。</div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default IDPhotoTool;
