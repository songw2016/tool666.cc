'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileText, Copy } from 'lucide-react';

export function QrReader() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); 

  const handleFile = useCallback((file: File | null) => {
    setError('');
    setResult('');
    setCopySuccess(false);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      // decode after load
      setTimeout(() => decodeFromUrl(reader.result as string), 50);
    };
    reader.onerror = () => setError('读取文件失败');
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    handleFile(f);
  };

  const decodeFromUrl = async (url: string) => {
    setProcessing(true);
    setError('');
    setResult('');
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      await new Promise((res, rej) => { img.onload = () => res(true); img.onerror = rej; });

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法获取 Canvas 上下文');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const jsQR = (await import('jsqr')).default;
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        setResult(code.data);
      } else {
        setError('未识别到二维码，请换一张图片或放大二维码区域');
      }
    } catch (e) {
      setError('识别失败: ' + (e as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    handleFile(f);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.indexOf('image') !== -1) {
        const file = it.getAsFile();
        handleFile(file);
        break;
      }
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      setError('复制失败: ' + (e as Error).message);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setResult('');
    setError('');
    setCopySuccess(false);
  };
 

  return (
    <div className="space-y-4" onPaste={handlePaste} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="flex items-center gap-3">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="w-4 h-4" /> 上传图片
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        <button onClick={() => { if (imageSrc) decodeFromUrl(imageSrc); }} disabled={!imageSrc || processing} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          {processing ? '识别中...' : '识别二维码'}
        </button>
        <div className="flex-1" />
        <button onClick={reset} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-350">重置</button>
      </div>

      <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">图片预览（可粘贴或拖放图片）</div>
            <div className="h-64 flex items-center justify-center bg-white border rounded">
              {imageSrc ? <img src={imageSrc} alt="source" className="max-h-64 object-contain" /> : <div className="text-sm text-gray-400">将图片拖到此处或粘贴/上传图片</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">识别结果</div>
            <div className="min-h-[160px] p-3 bg-white border rounded">
              {result ? (
                <div className="space-y-3">
                  <div className="text-sm font-mono break-words">{result}</div>
                  <div className="flex gap-2">
                    <button onClick={copyResult} className="px-3 py-2 bg-gray-100 rounded">{copySuccess ? '已复制' : '复制'}</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">暂无识别结果</div>
              )}
              {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default QrReader;
