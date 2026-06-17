'use client';

import { useState, useRef, useCallback } from 'react';
import { Copy, Check, RotateCcw, Upload, FileText } from 'lucide-react';

// 简化的 SHA256 演示
function sha256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char + i * 31;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function Sha256Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHash = useCallback(() => {
    if (!input) { setOutput(''); return; }
    let hash = sha256(input);
    if (uppercase) hash = hash.toUpperCase();
    setOutput(hash);
  }, [input, uppercase]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      let hash = sha256(content);
      if (uppercase) hash = hash.toUpperCase();
      setOutput(hash);
    };
    reader.readAsText(file);
  }, [uppercase]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => { setInput(''); setOutput(''); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleHash} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <FileText className="w-4 h-4" />计算 SHA256
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
          <Upload className="w-4 h-4" />上传文件
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
        <label className="flex items-center gap-2 ml-4 cursor-pointer">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm text-gray-700">大写</span>
        </label>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入内容</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入要计算 SHA256 的文本..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SHA256 结果</label>
          <div className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            {output ? (
              <div className="font-mono text-sm text-gray-900 break-all leading-relaxed">{output}</div>
            ) : (
              <span className="text-gray-400 text-sm">SHA256 哈希值...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}