'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export function JsonDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  const formatOrRawLines = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2).split('\n');
    } catch (e) {
      return text.split('\n');
    }
  };

  const computeDiff = () => {
    if (!text1 && !text2) return [];

    const lines1 = formatOrRawLines(text1);
    const lines2 = formatOrRawLines(text2);
    const result: { type: 'same' | 'removed' | 'added' | 'invalid'; content: string }[] = [];

    const maxLen = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i] || '';
      const l2 = lines2[i] || '';

      if (l1 === l2) {
        result.push({ type: 'same', content: l1 });
      } else {
        if (l1) result.push({ type: 'removed', content: `- ${l1}` });
        if (l2) result.push({ type: 'added', content: `+ ${l2}` });
      }
    }

    return result;
  };

  const diff = computeDiff();

  const handleReset = () => {
    setText1('');
    setText2('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">JSON A</label>
          <textarea value={text1} onChange={(e) => setText1(e.target.value)} placeholder="输入 JSON 或文本..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">JSON B</label>
          <textarea value={text2} onChange={(e) => setText2(e.target.value)} placeholder="输入 JSON 或文本..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-sm font-medium text-gray-700">对比结果 (JSON 智能格式化后按行比较)</div>
        <div className="p-4 bg-white max-h-96 overflow-auto">
          {diff.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">输入两段 JSON 或文本开始对比</p>
          ) : (
            <div className="space-y-0.5 font-mono text-sm">
              {diff.map((item, i) => (
                <div key={i} className={`px-2 py-1 rounded ${item.type === 'removed' ? 'bg-red-50 text-red-700' : item.type === 'added' ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}>
                  {item.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
