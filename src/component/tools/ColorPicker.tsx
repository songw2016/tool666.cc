'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

function normalizeHex(input: string) {
  let hex = input.trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPicker() {
  const [hexInput, setHexInput] = useState('#3490dc');
  const [copied, setCopied] = useState<'hex' | 'rgb' | 'hsl' | null>(null);

  const normalized = normalizeHex(hexInput) || '#000000';
  const rgb = hexToRgb(normalized);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`;

  const handleCopy = async (text: string, kind: 'hex' | 'rgb' | 'hsl') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const handleReset = () => {
    setHexInput('#3490dc');
    setCopied(null);
  };

  const palette = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#F59E0B', '#10B981', '#6366F1'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <input type="color" value={normalized} onChange={(e) => setHexInput(e.target.value)} className="w-12 h-12 p-0 border-none bg-transparent" />
          <input value={hexInput} onChange={(e) => setHexInput(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm w-40" />
        </div>

        <div className="flex-1" />

        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">预览</div>
          <div className="w-full h-36 rounded-lg border border-gray-200 overflow-hidden">
            <div style={{ background: normalized, height: '100%' }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">值</label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div>
                <div className="text-xs text-gray-500">HEX</div>
                <div className="font-mono text-sm">{normalized}</div>
              </div>
              <button onClick={() => handleCopy(normalized, 'hex')} className="text-xs text-blue-600 hover:text-blue-700">{copied === 'hex' ? '已复制' : '复制'}</button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div>
                <div className="text-xs text-gray-500">RGB</div>
                <div className="font-mono text-sm">{rgbStr}</div>
              </div>
              <button onClick={() => handleCopy(rgbStr, 'rgb')} className="text-xs text-blue-600 hover:text-blue-700">{copied === 'rgb' ? '已复制' : '复制'}</button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div>
                <div className="text-xs text-gray-500">HSL</div>
                <div className="font-mono text-sm">{hslStr}</div>
              </div>
              <button onClick={() => handleCopy(hslStr, 'hsl')} className="text-xs text-blue-600 hover:text-blue-700">{copied === 'hsl' ? '已复制' : '复制'}</button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">调色板</div>
          <div className="grid grid-cols-4 gap-2">
            {palette.map((c) => (
              <button key={c} onClick={() => setHexInput(c)} className="h-12 w-full rounded-lg border border-gray-200 flex items-center justify-center" style={{ background: c }} title={c}>
                <span className="sr-only">{c}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">点击色块以设置颜色，或输入 HEX/用拾色器选择。</div>
        </div>
      </div>
    </div>
  );
}
