'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Type } from 'lucide-react';

export function TextCase() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const conversions = [
    { label: '大写', fn: (s: string) => s.toUpperCase() },
    { label: '小写', fn: (s: string) => s.toLowerCase() },
    { label: '首字母大写', fn: (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: '驼峰命名', fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
    { label: '下划线命名', fn: (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase()).replace(/^_/, '').replace(/[^a-z0-9]+/g, '_') },
    { label: '短横线命名', fn: (s: string) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()).replace(/^-/, '').replace(/[^a-z0-9]+/g, '-') },
    { label: '反转', fn: (s: string) => s.split('').reverse().join('') },
    { label: '去除空格空行', fn: (s: string) => s.replace(/\s+/g, '') },
  ];

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setText('')} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />清空
        </button>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本..."
          className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {conversions.map((conv) => (
          <div key={conv.label} className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{conv.label}</span>
              <button onClick={() => handleCopy(conv.fn(text))} className="text-gray-400 hover:text-gray-600">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg font-mono text-xs text-gray-600 truncate" title={conv.fn(text)}>
              {conv.fn(text) || '...'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}