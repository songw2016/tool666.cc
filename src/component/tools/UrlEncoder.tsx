'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Link } from 'lucide-react';

export function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode' | 'parse'>('encode');
  const [copied, setCopied] = useState(false);
  const [parsedUrl, setParsedUrl] = useState<Record<string, string> | null>(null);

  const handleProcess = () => {
    if (!input.trim()) {
      setOutput('');
      setParsedUrl(null);
      return;
    }
    try {
      if (mode === 'encode') {
        setOutput(encodeURIComponent(input));
        setParsedUrl(null);
      } else if (mode === 'decode') {
        setOutput(decodeURIComponent(input));
        setParsedUrl(null);
      } else if (mode === 'parse') {
        const url = new URL(input);
        setOutput(JSON.stringify({
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
        }, null, 2));
        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => { params[key] = value; });
        setParsedUrl(params);
      }
    } catch (e) {
      setOutput('❌ 处理失败: ' + (e as Error).message);
      setParsedUrl(null);
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
    setParsedUrl(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        {(['encode', 'decode', 'parse'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {m === 'encode' ? 'URL 编码' : m === 'decode' ? 'URL 解码' : 'URL 解析'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleProcess} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Link className="w-4 h-4" />处理
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {mode === 'parse' ? '输入完整 URL' : '输入内容'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'parse' ? 'https://example.com?key=value' : '输入内容...'}
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
          <textarea
            value={output}
            readOnly
            placeholder="结果..."
            className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none"
          />
        </div>
      </div>

      {parsedUrl && Object.keys(parsedUrl).length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">查询参数</h3>
          <div className="space-y-1">
            {Object.entries(parsedUrl).map(([key, value]) => (
              <div key={key} className="flex text-sm">
                <span className="font-mono text-blue-700 min-w-[120px]">{key}:</span>
                <span className="text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}