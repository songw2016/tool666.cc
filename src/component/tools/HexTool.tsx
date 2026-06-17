'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

export function HexTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'toHex' | 'fromHex'>('toHex');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input) { setOutput(''); return; }
    if (mode === 'toHex') {
      setOutput(Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
    } else {
      try {
        setOutput(input.replace(/\s/g, '').match(/.{2}/g)?.map(byte => String.fromCharCode(parseInt(byte, 16))).join('') || '');
      } catch (e) {
        setOutput('❌ 转换失败');
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => { setInput(''); setOutput(''); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setMode('toHex')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'toHex' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>文本 → 十六进制</button>
        <button onClick={() => setMode('fromHex')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'fromHex' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>十六进制 → 文本</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleConvert} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">转换</button>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'toHex' ? '文本' : '十六进制'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'toHex' ? '输入文本...' : '68 65 78...'} className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'toHex' ? '十六进制' : '文本'}</label>
          <textarea value={output} readOnly placeholder="结果..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}