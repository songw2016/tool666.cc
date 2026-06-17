'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const unescapeMap: Record<string, string> = {};
Object.entries(escapeMap).forEach(([key, value]) => {
  unescapeMap[value] = key;
});

export function HtmlEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape');
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    if (!input) {
      setOutput('');
      return;
    }
    if (mode === 'escape') {
      setOutput(input.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char));
    } else {
      setOutput(input.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, (entity) => unescapeMap[entity] || entity));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setMode('escape')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'escape' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>HTML 转义</button>
        <button onClick={() => setMode('unescape')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'unescape' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>HTML 反转义</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleProcess} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          {mode === 'escape' ? '转义' : '反转义'}
        </button>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">输入</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入 HTML 内容..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出</label>
          <textarea value={output} readOnly placeholder="结果..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}