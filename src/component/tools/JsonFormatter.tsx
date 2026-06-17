'use client';

import { useState } from 'react';
import { Copy, Check, Play, RotateCcw, Minimize2, Expand } from 'lucide-react';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const handleFormat = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError('❌ JSON 格式错误: ' + (e as Error).message);
      setOutput('');
    }
  };

  const handleCompress = () => {
    setError('');
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError('❌ JSON 格式错误');
    }
  };

  const handleEscape = () => {
    setError('');
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(JSON.stringify(parsed)));
    } catch (e) {
      setError('❌ JSON 格式错误');
    }
  };

  const handleUnescape = () => {
    setError('');
    if (!input.trim()) return;
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === 'string') {
        setOutput(JSON.stringify(JSON.parse(unescaped), null, indent));
      }
    } catch (e) {
      setError('❌ 无法解析');
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
    setError('');
  };

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleFormat} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Expand className="w-4 h-4" />格式化
        </button>
        <button onClick={handleCompress} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
          <Minimize2 className="w-4 h-4" />压缩
        </button>
        <button onClick={handleEscape} className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
          转义
        </button>
        <button onClick={handleUnescape} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
          反转义
        </button>
        <select 
          value={indent} 
          onChange={(e) => setIndent(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={2}>2 空格缩进</option>
          <option value={4}>4 空格缩进</option>
          <option value={'\t'}>Tab 缩进</option>
        </select>
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

      {/* 输入输出区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入 JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"name": "example", "value": 123}'
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
          <textarea
            value={output}
            readOnly
            placeholder="格式化结果..."
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}