'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, RotateCcw } from 'lucide-react';

export function ImageCompress() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setCompressedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCompress = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    
    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const compressed = canvas.toDataURL('image/jpeg', quality / 100);
      setCompressedImage(compressed);
      
      // 计算压缩后大小
      const base64Length = compressed.split(',')[1].length;
      const sizeInBytes = (base64Length * 3) / 4;
      setCompressedSize(Math.round(sizeInBytes));
      setIsProcessing(false);
    };
    img.src = originalImage;
  }, [originalImage, quality]);

  const handleDownload = () => {
    if (!compressedImage) return;
    const link = document.createElement('a');
    link.download = 'compressed-image.jpg';
    link.href = compressedImage;
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Upload className="w-4 h-4" />选择图片
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        
        {originalImage && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">质量:</span>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-medium text-gray-900">{quality}%</span>
            </div>
            <button onClick={handleCompress} disabled={isProcessing} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              {isProcessing ? '压缩中...' : '压缩'}
            </button>
            {compressedImage && (
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                <Download className="w-4 h-4" />下载
              </button>
            )}
            <div className="flex-1"></div>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
              <RotateCcw className="w-4 h-4" />重置
            </button>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {originalImage ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">原图</span>
              <span className="text-xs text-gray-500">{formatSize(originalSize)}</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <img src={originalImage} alt="Original" className="max-w-full max-h-96 object-contain mx-auto" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">压缩后</span>
              {compressedSize > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatSize(compressedSize)}</span>
                  <span className="text-xs text-green-600 font-medium">
                    -{Math.round((1 - compressedSize / originalSize) * 100)}%
                  </span>
                </div>
              )}
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 min-h-[200px] flex items-center justify-center">
              {compressedImage ? (
                <img src={compressedImage} alt="Compressed" className="max-w-full max-h-96 object-contain" />
              ) : (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />压缩后的图片将显示在这里
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">选择或拖拽图片到此处</p>
          <p className="text-gray-400 text-xs mt-1">支持 JPG、PNG、WebP 格式</p>
        </div>
      )}
    </div>
  );
}