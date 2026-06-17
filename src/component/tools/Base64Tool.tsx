'use client';

import { useState, useRef } from 'react';
import { Copy, Check, RotateCcw, Upload, FileText } from 'lucide-react';

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch (e) {
      setError('❌ 处理失败: ' + (e as Error).message);
      setOutput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setInput(base64);
      setMode('decode');
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* 模式切换 */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'encode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          编码
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'decode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          解码
        </button>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleProcess} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <FileText className="w-4 h-4" />{mode === 'encode' ? 'Base64 编码' : 'Base64 解码'}
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
          <Upload className="w-4 h-4" />上传文件
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
        <div className="flex-1"></div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
        {output && (
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'encode' ? '输入文本' : '输入 Base64'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'encode' ? 'Base64 结果' : '解码结果'}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="结果..."
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}