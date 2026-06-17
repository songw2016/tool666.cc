'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';

const loremWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

const chineseWords = [
  '春天', '夏天', '秋天', '冬天', '花开', '花落', '日出', '日落', '山川', '河流',
  '大海', '蓝天', '白云', '清风', '明月', '星辰', '梦想', '希望', '未来', '远方',
  '人生', '岁月', '时光', '记忆', '故事', '旅程', '风景', '画卷', '诗篇', '乐章'
];

export function LoremIpsum() {
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(5);
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [lang, setLang] = useState<'latin' | 'chinese'>('latin');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    let result = '';
    const words = lang === 'latin' ? loremWords : chineseWords;
    
    if (unit === 'words') {
      result = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(lang === 'latin' ? ' ' : '');
    } else if (unit === 'sentences') {
      result = Array.from({ length: count }, () => {
        const len = 8 + Math.floor(Math.random() * 8);
        return Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]).join(lang === 'latin' ? ' ' : '') + (lang === 'latin' ? '.' : '。');
      }).join('\n');
    } else {
      result = Array.from({ length: count }, () => {
        const sentences = 3 + Math.floor(Math.random() * 4);
        return Array.from({ length: sentences }, () => {
          const len = 8 + Math.floor(Math.random() * 8);
          return Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]).join(lang === 'latin' ? ' ' : '') + (lang === 'latin' ? '.' : '。');
        }).join(' ');
      }).join('\n\n');
    }
    
    setOutput(result);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            max={100}
            className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as typeof unit)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="paragraphs">段落</option>
            <option value="sentences">句子</option>
            <option value="words">单词</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setLang('latin')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${lang === 'latin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>Lorem</button>
          <button onClick={() => setLang('chinese')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${lang === 'chinese' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>中文</button>
        </div>

        <div className="flex-1"></div>
        
        <button onClick={generate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" />生成
        </button>
        {output && (
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>

      <textarea
        value={output}
        readOnly
        placeholder="点击生成按钮生成假文..."
        className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none"
      />
    </div>
  );
}