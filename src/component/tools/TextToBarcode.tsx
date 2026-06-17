'use client';

import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Copy } from 'lucide-react';

export function TextToBarcode() {
  const [text, setText] = useState('');
  const [format, setFormat] = useState<string>('CODE128');
  const [width, setWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(100);
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  async function generate() {
    setError('');
    if (!text.trim()) {
      setError('请输入文本以生成条形码');
      return;
    }
    setLoading(true);
    try {
      const JsBarcode = (await import('jsbarcode')).default;
      const canvas = canvasRef.current || document.createElement('canvas');
      // clear previous
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) { ctx.clearRect(0, 0, canvas.width, canvas.height); }

      JsBarcode(canvas, text, {
        format: format,
        width: Math.max(1, Number(width)),
        height: Math.max(10, Number(height)),
        displayValue: displayValue,
        margin: 10,
      });

      // convert to blob URL for preview/download/copy
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const obj = URL.createObjectURL(blob);
      blobUrlRef.current = obj;
      // set image src by creating object URL
      if (canvasRef.current == null) canvasRef.current = canvas;
    } catch (e) {
      setError('生成失败: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'barcode.png';
    a.click();
  }

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (typeof (window as any).ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        const item = new (window as any).ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback: copy data URL text
        try {
          await navigator.clipboard.writeText(dataUrl);
        } catch (err) {
          setError('复制图片失败: 浏览器不支持直接复制图片，请下载。');
        }
      } else {
        setError('复制图片失败: 当前浏览器不支持复制图片，请下载。');
      }
    } catch (e) {
      setError('复制图片失败: ' + (e as Error).message);
    }
  }

  function reset() {
    setText('');
    setError('');
    setLoading(false);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">生成条形码</button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">类型</span>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="p-2 border rounded-md text-sm">
            <option value="CODE128">CODE128</option>
            <option value="EAN13">EAN13</option>
            <option value="UPC">UPC</option>
            <option value="CODE39">CODE39</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">宽度</span>
          <input type="number" min={1} max={10} value={width} onChange={(e) => setWidth(Number(e.target.value) || 2)} className="w-20 p-2 border rounded-md text-sm" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">高度</span>
          <input type="number" min={10} max={400} value={height} onChange={(e) => setHeight(Number(e.target.value) || 100)} className="w-24 p-2 border rounded-md text-sm" />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={displayValue} onChange={(e) => setDisplayValue(e.target.checked)} />
          <span className="text-sm text-gray-600">显示文本</span>
        </label>

        <div className="flex-1" />

        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"><RotateCcw className="w-4 h-4" />重置</button>

        <button onClick={download} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Download className="w-4 h-4" />下载</button>
        <button onClick={copyImage} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"><Copy className="w-4 h-4" />复制图片</button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="输入要生成条形码的文本（注意格式要求）..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
          <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] flex items-center justify-center p-4">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextToBarcode;
