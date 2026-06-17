'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Copy, Check, RotateCcw, Image as ImageIcon } from 'lucide-react';

export function ImageBase64() {
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState('');
  const [mode, setMode] = useState<'toBase64' | 'toImage'>('toBase64');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImage(result);
      setBase64(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleBase64ToImage = useCallback(() => {
    if (!base64.trim()) return;
    setImage(base64);
  }, [base64]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setImage(null);
    setBase64('');
    setFileName('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => { setMode('toBase64'); setImage(null); setBase64(''); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'toBase64' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>图片 → Base64</button>
        <button onClick={() => { setMode('toImage'); setImage(null); setBase64(''); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'toImage' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>Base64 → 图片</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {mode === 'toBase64' ? (
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4" />选择图片
          </button>
        ) : (
          <button onClick={handleBase64ToImage} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">转换</button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <div className="flex-1"></div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mode === 'toBase64' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">图片预览</label>
              <div className="w-full h-80 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    选择图片
                  </div>
                )}
              </div>
              {fileName && <p className="text-xs text-gray-500 mt-1">{fileName}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Base64 结果</label>
                {base64 && (
                  <button onClick={handleCopy} className="text-xs text-blue-600 hover:text-blue-700">
                    {copied ? '已复制' : '复制'}
                  </button>
                )}
              </div>
              <textarea
                value={base64}
                readOnly
                placeholder="Base64 编码..."
                className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs resize-none focus:outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">输入 Base64</label>
              <textarea
                value={base64}
                onChange={(e) => setBase64(e.target.value)}
                placeholder="data:image/png;base64,iVBORw0KGgo..."
                className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">图片预览</label>
              <div className="w-full h-80 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} alt="Converted" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 text-sm text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    转换结果
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}