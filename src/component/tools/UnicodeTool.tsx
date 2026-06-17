'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

export function UnicodeTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'toUnicode' | 'fromUnicode'>('toUnicode');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input) { setOutput(''); return; }
    if (mode === 'toUnicode') {
      setOutput(Array.from(input).map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''));
    } else {
      try {
        setOutput(input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))));
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
        <button onClick={() => setMode('toUnicode')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'toUnicode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>中文 → Unicode</button>
        <button onClick={() => setMode('fromUnicode')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'fromUnicode' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>Unicode → 中文</button>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'toUnicode' ? '中文' : 'Unicode'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'toUnicode' ? '输入中文...' : '\\u4e2d\\u6587...'} className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'toUnicode' ? 'Unicode' : '中文'}</label>
          <textarea value={output} readOnly placeholder="结果..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}