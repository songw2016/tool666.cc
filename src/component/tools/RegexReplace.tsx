'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Check, RotateCcw, Search, List, RefreshCw } from 'lucide-react';

export function RegexReplace() {
  const [text, setText] = useState('');
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [replacement, setReplacement] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const presets = [
    { label: '邮箱', pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", flags: 'g' },
    { label: 'URL', pattern: "https?:\\/\\/[\\w\\-./?%&=#:~+]++", flags: 'g' },
    { label: '手机号(大陆)', pattern: "\\b1[3-9]\\d{9}\\b", flags: 'g' },
    { label: '提取数字', pattern: "\\d+", flags: 'g' },
    { label: '去除多余空格', pattern: "\\s+", flags: 'g' },
  ];

  const makeRegex = (withGlobal = true) => {
    try {
      const f = withGlobal && !flags.includes('g') ? flags + 'g' : flags;
      return new RegExp(pattern, f);
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  };

  const doHighlight = () => {
    setError('');
    const re = makeRegex(true);
    if (!re) return;
    const found: string[] = [];
    const textVal = text || '';
    let m: RegExpExecArray | null;
    // iterate
    while ((m = re.exec(textVal)) !== null) {
      found.push(m[0]);
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    setMatches(found);
  };

  const doReplace = () => {
    setError('');
    const re = makeRegex(true);
    if (!re) return;
    try {
      const out = (text || '').replace(re, replacement);
      setText(out);
      setMatches([]);
    } catch (e) {
      setError('替换失败: ' + (e as Error).message);
    }
  };

  const doExtract = () => {
    setError('');
    const re = makeRegex(true);
    if (!re) return;
    const found: string[] = [];
    const textVal = text || '';
    let m: RegExpExecArray | null;
    while ((m = re.exec(textVal)) !== null) {
      if (m.length > 1) {
        // if capture groups exist, push joined groups
        found.push(m.slice(1).join(' | '));
      } else {
        found.push(m[0]);
      }
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    setMatches(found);
  };

  const clearAll = () => {
    setText('');
    setPattern('');
    setFlags('g');
    setReplacement('');
    setMatches([]);
    setError('');
    setCopied(false);
  };

  const highlightedHtml = useMemo(() => {
    if (!pattern) return escapeHtml(text);
    const re = makeRegex(true);
    if (!re) return escapeHtml(text);
    const parts: string[] = [];
    let lastIndex = 0;
    const t = text || '';
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      parts.push(escapeHtml(t.slice(lastIndex, start)));
      parts.push(`<span class="bg-yellow-200 text-black px-0.5">${escapeHtml(m[0])}</span>`);
      lastIndex = end;
      if (re.lastIndex === m.index) re.lastIndex++;
    }
    parts.push(escapeHtml(t.slice(lastIndex)));
    return parts.join('');
  }, [text, pattern, flags]);

  function escapeHtml(s: string) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const applyPreset = (p: { label: string; pattern: string; flags?: string }) => {
    setPattern(p.pattern);
    setFlags(p.flags || 'g');
  };

  const copyMatches = async () => {
    if (!matches.length) return;
    try {
      await navigator.clipboard.writeText(matches.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError('复制失败: ' + (e as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setText('')} className="flex items-center gap-2 px-3 py-2 text-gray-600 rounded hover:bg-gray-100">
            <RotateCcw className="w-4 h-4" /> 清空
          </button>
          <button onClick={clearAll} className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            <RefreshCw className="w-4 h-4" /> 全部重置
          </button>
        </div>
        <div className="text-sm text-gray-500">内置常用正则：
          {presets.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="ml-2 px-2 py-1 bg-white border rounded text-xs">{p.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">文本</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-56 p-3 bg-gray-50 border rounded text-sm font-mono" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">高亮预览</label>
          <div className="w-full h-56 p-3 bg-white border rounded text-sm overflow-auto" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">正则模式</label>
          <input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="例如：\\d+ 或 (https?:\\/\\/[^\s]+)" className="w-full p-2 bg-white border rounded text-sm" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Flags</label>
          <input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-full p-2 bg-white border rounded text-sm" />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">替换内容（支持 $1 $2）</label>
          <input value={replacement} onChange={(e) => setReplacement(e.target.value)} className="w-full p-2 bg-white border rounded text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={doHighlight} className="px-4 py-2 bg-yellow-400 text-black rounded">仅高亮匹配</button>
        <button onClick={doReplace} className="px-4 py-2 bg-green-600 text-white rounded">执行替换</button>
        <button onClick={doExtract} className="px-4 py-2 bg-blue-600 text-white rounded">提取匹配项</button>
        <div className="flex-1" />
        <button onClick={copyMatches} className="px-3 py-2 bg-gray-100 rounded">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button>
      </div>

      <div className="mt-2">
        <div className="text-sm text-gray-600 mb-1">匹配结果 ({matches.length})</div>
        <div className="p-3 bg-white border rounded min-h-[80px] max-h-48 overflow-auto font-mono text-sm">
          {matches.length ? (
            matches.map((m, i) => <div key={i} className="py-1 border-b last:border-b-0">{m}</div>)
          ) : (
            <div className="text-gray-400">暂无匹配结果</div>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-600 mt-2">错误：{error}</div>}
    </div>
  );
}

export default RegexReplace;
