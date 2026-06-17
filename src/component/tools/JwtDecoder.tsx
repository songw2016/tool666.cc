'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

export function JwtDecoder() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState('');
  const [payload, setPayload] = useState('');
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDecode = () => {
    setError('');
    if (!input.trim()) {
      setHeader(''); setPayload(''); setSignature('');
      return;
    }
    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('JWT 格式不正确，需要 3 部分');
      
      setHeader(JSON.stringify(JSON.parse(atob(parts[0])), null, 2));
      setPayload(JSON.stringify(JSON.parse(atob(parts[1])), null, 2));
      setSignature(parts[2]);
    } catch (e) {
      setError('❌ 解码失败: ' + (e as Error).message);
      setHeader(''); setPayload(''); setSignature('');
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput(''); setHeader(''); setPayload(''); setSignature(''); setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleDecode} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">解码 JWT</button>
        <div className="flex-1"></div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Header</label>
            {header && <button onClick={() => handleCopy(header)} className="text-xs text-blue-600 hover:text-blue-700">{copied ? '已复制' : '复制'}</button>}
          </div>
          <textarea value={header} readOnly placeholder="Header..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Payload</label>
            {payload && <button onClick={() => handleCopy(payload)} className="text-xs text-blue-600 hover:text-blue-700">{copied ? '已复制' : '复制'}</button>}
          </div>
          <textarea value={payload} readOnly placeholder="Payload..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Signature</label>
          </div>
          <textarea value={signature} readOnly placeholder="Signature..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}