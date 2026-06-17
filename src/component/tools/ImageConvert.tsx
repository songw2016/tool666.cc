'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, RotateCcw } from 'lucide-react';

type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export function ImageConvert() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/png');
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setConvertedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleConvert = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const converted = canvas.toDataURL(targetFormat);
      setConvertedImage(converted);
    };
    img.src = originalImage;
  }, [originalImage, targetFormat]);

  const handleDownload = () => {
    if (!convertedImage) return;
    const ext = targetFormat.split('/')[1];
    const link = document.createElement('a');
    link.download = `${fileName}-converted.${ext}`;
    link.href = convertedImage;
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setConvertedImage(null);
    setFileName('');
  };

  const formatLabels: Record<string, string> = {
    'image/png': 'PNG',
    'image/jpeg': 'JPEG',
    'image/webp': 'WebP',
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
              <span className="text-sm text-gray-600">目标格式:</span>
              {(['image/png', 'image/jpeg', 'image/webp'] as ImageFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${targetFormat === fmt ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {formatLabels[fmt]}
                </button>
              ))}
            </div>
            <button onClick={handleConvert} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
              转换
            </button>
            {convertedImage && (
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
            <span className="text-sm font-medium text-gray-700">原图</span>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <img src={originalImage} alt="Original" className="max-w-full max-h-96 object-contain mx-auto" />
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">转换后 ({formatLabels[targetFormat]})</span>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 min-h-[200px] flex items-center justify-center">
              {convertedImage ? (
                <img src={convertedImage} alt="Converted" className="max-w-full max-h-96 object-contain" />
              ) : (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />转换后的图片将显示在这里
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">选择图片进行格式转换</p>
          <p className="text-gray-400 text-xs mt-1">支持转换为 PNG、JPEG、WebP</p>
        </div>
      )}
    </div>
  );
}