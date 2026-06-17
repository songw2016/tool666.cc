'use client';

import { useState, useMemo } from 'react';
import { Type, RotateCcw } from 'lucide-react';

export function WordCount() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const trimmed = text.trim();
    return {
      chars: text.length,
      charsNoSpace: text.replace(/\s/g, '').length,
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      lines: text ? text.split('\n').length : 0,
      paragraphs: trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0,
      bytes: new Blob([text]).size,
      chinese: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
    };
  }, [text]);

  const handleReset = () => setText('');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />清空
        </button>
      </div>

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此输入或粘贴文本..."
          className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 统计面板 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '总字符数', value: stats.chars, color: 'blue' },
          { label: '去除空格', value: stats.charsNoSpace, color: 'indigo' },
          { label: '单词数', value: stats.words, color: 'green' },
          { label: '中文字符', value: stats.chinese, color: 'red' },
          { label: '行数', value: stats.lines, color: 'purple' },
          { label: '段落数', value: stats.paragraphs, color: 'amber' },
          { label: '字节数', value: stats.bytes, color: 'cyan' },
          { label: '空格数', value: stats.chars - stats.charsNoSpace, color: 'gray' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 bg-${stat.color}-50 rounded-xl border border-${stat.color}-100`}>
            <div className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</div>
            <div className={`text-sm text-${stat.color}-600`}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}