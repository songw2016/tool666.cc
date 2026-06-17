'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import YAML from 'yaml';

export function JsonYamlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input) { setOutput(''); return; }
    try {
      if (mode === 'json2yaml') {
        const parsed = JSON.parse(input);
        const yaml = YAML.stringify(parsed);
        setOutput(yaml.trim());
      } else {
        const parsed = YAML.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setOutput('❌ 转换失败');
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
        <button onClick={() => setMode('json2yaml')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'json2yaml' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>JSON → YAML</button>
        <button onClick={() => setMode('yaml2json')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'yaml2json' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>YAML → JSON</button>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'json2yaml' ? 'JSON' : 'YAML'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'json2yaml' ? '{\n  "key": "value"\n}' : 'key: value'} className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'json2yaml' ? 'YAML' : 'JSON'}</label>
          <textarea value={output} readOnly placeholder="结果..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}
