'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Expand, Minimize2 } from 'lucide-react';

function formatXml(xml: string, indent: string) {
  // 简单的 XML 格式化器：在标签之间换行并根据层级缩进
  const reg = /(>)(<)(\/?)/g;
  let formatted = xml.replace(/\r\n|\r/g, '\n').replace(reg, '$1\n$2$3');
  const lines = formatted.split('\n').filter(Boolean);
  let pad = 0;
  return lines
    .map((line) => {
      let indentBefore = '';
      if (/^<\//.test(line)) {
        pad = Math.max(pad - 1, 0);
      }
      indentBefore = indent.repeat(pad);
      if (/^<[^!?][^/]*[^/]?>.*$/.test(line) && !/^<.*\/\s*>$/.test(line) && !/^<\?/.test(line)) {
        // 开始标签且非自闭合
        if (!/<>/.test(line)) pad += 1;
      }
      return indentBefore + line.trim();
    })
    .join('\n');
}

function compressXml(xml: string) {
  return xml.replace(/>\s+</g, '><').trim();
}

export function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const getIndent = () => (indentSize === -1 ? '\t' : ' '.repeat(indentSize));

  const handleFormat = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const ind = getIndent();
      const res = formatXml(input, ind);
      setOutput(res);
    } catch (e) {
      setError('❌ XML 格式化失败');
      setOutput('');
    }
  };

  const handleCompress = () => {
    setError('');
    if (!input.trim()) return;
    try {
      setOutput(compressXml(input));
    } catch (e) {
      setError('❌ 压缩失败');
    }
  };

  const handleEscape = () => {
    setError('');
    if (!input.trim()) return;
    try {
      setOutput(JSON.stringify(input));
    } catch (e) {
      setError('❌ 转义失败');
    }
  };

  const handleUnescape = () => {
    setError('');
    if (!input.trim()) return;
    try {
      const un = JSON.parse(input);
      if (typeof un === 'string') {
        setOutput(un);
      } else {
        setError('❌ 输入不是已转义的字符串');
      }
    } catch (e) {
      setError('❌ 无法反转义');
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
          value={indentSize}
          onChange={(e) => setIndentSize(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value={2}>2 空格缩进</option>
          <option value={4}>4 空格缩进</option>
          <option value={-1}>Tab 缩进</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入 XML</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'<root>\n  <child>value</child>\n</root>'}
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
