'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Upload, Download, RotateCcw, Image as ImageIcon } from 'lucide-react';

export function ImageWatermark() {
  const [original, setOriginal] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image');

  const [watermarkText, setWatermarkText] = useState<string>('示例水印');
  const [fontSize, setFontSize] = useState<number>(36);
  const [color, setColor] = useState<string>('rgba(255,255,255,0.6)');
  const [position, setPosition] = useState<'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center'>('bottom-right');
  const [padding, setPadding] = useState<number>(16);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = () => {
      setOriginal(reader.result as string);
      setOutput(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const applyWatermark = useCallback(async () => {
    if (!original) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = original;
    await new Promise((res, rej) => {
      img.onload = () => res(true);
      img.onerror = rej;
    });

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // watermark style
    const scale = Math.max(1, img.width / 800);
    const fs = Math.max(12, Math.round(fontSize * (1 / scale)) * Math.round(scale));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'bottom';

    const text = watermarkText;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize; // approximate

    let x = padding;
    let y = canvas.height - padding;

    if (position === 'top-left') { x = padding; y = padding + textHeight; }
    if (position === 'top-right') { x = canvas.width - padding - textWidth; y = padding + textHeight; }
    if (position === 'bottom-left') { x = padding; y = canvas.height - padding; }
    if (position === 'bottom-right') { x = canvas.width - padding - textWidth; y = canvas.height - padding; }
    if (position === 'center') { x = (canvas.width - textWidth) / 2; y = (canvas.height + textHeight) / 2; }

    // draw shadow for visibility
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText(text, x + 1, y + 1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    setOutput(dataUrl);
    // keep canvas ref
    canvasRef.current = canvas;
  }, [original, watermarkText, fontSize, color, position, padding]);

  const download = () => {
    const url = output || original;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-watermarked.png`;
    a.click();
  };

  const reset = () => {
    setOriginal(null);
    setOutput(null);
    setFileName('image');
    setWatermarkText('示例水印');
    setFontSize(36);
    setColor('rgba(255,255,255,0.6)');
    setPosition('bottom-right');
    setPadding(16);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="w-4 h-4" /> 选择图片
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        <button onClick={applyWatermark} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">应用水印</button>

        <div className="flex-1" />

        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"><RotateCcw className="w-4 h-4" />重置</button>
        {(output || original) && (
          <button onClick={download} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Download className="w-4 h-4" />下载</button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
          <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[240px] flex items-center justify-center p-4">
            {output ? (
              <img src={output} alt="watermarked" className="max-w-full max-h-[640px] object-contain" />
            ) : original ? (
              <img src={original} alt="original" className="max-w-full max-h-[640px] object-contain" />
            ) : (
              <div className="text-gray-400 text-sm flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2" />
                选择图片后可在此预览并添加文字水印
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-lg">
          <div className="text-sm font-medium mb-3">水印设置</div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600">水印文字</label>
              <input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-600">字体大小</label>
                <input type="number" min={8} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 12)} className="w-full p-2 border rounded-md text-sm" />
              </div>
              <div className="w-32">
                <label className="block text-xs text-gray-600">颜色/透明度</label>
                <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600">位置</label>
              <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="w-full p-2 border rounded-md text-sm">
                <option value="top-left">左上</option>
                <option value="top-right">右上</option>
                <option value="bottom-left">左下</option>
                <option value="bottom-right">右下</option>
                <option value="center">居中</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600">边距 (px)</label>
              <input type="number" min={0} max={200} value={padding} onChange={(e) => setPadding(Number(e.target.value) || 0)} className="w-full p-2 border rounded-md text-sm" />
            </div>
          </div>
        </div>
      </div>

      <canvas className="hidden" ref={canvasRef} />
    </div>
  );
}

export default ImageWatermark;
