'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, List } from 'lucide-react';

export function CrontabGenerator() {
  const [mode, setMode] = useState<'unix' | 'quartz'>('unix');
  const [second, setSecond] = useState('0');
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dom, setDom] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [includeYear, setIncludeYear] = useState(false);
  const [year, setYear] = useState('*');
  const [copied, setCopied] = useState(false);

  const expr =
    mode === 'unix'
      ? `${minute} ${hour} ${dom} ${month} ${dow}`
      : includeYear
      ? `${second} ${minute} ${hour} ${dom} ${month} ${dow} ${year}`
      : `${second} ${minute} ${hour} ${dom} ${month} ${dow}`;

  const presets: any[] = [
    { label: '每分钟', unix: ['*', '*', '*', '*', '*'], quartz: ['0', '*', '*', '*', '*', '*'] },
    { label: '每小时（0分）', unix: ['0', '*', '*', '*', '*'], quartz: ['0', '0', '*', '*', '*', '*'] },
    { label: '每天（00:00）', unix: ['0', '0', '*', '*', '*'], quartz: ['0', '0', '0', '*', '*', '*'] },
    { label: '工作日 09:00', unix: ['0', '9', '*', '*', '1-5'], quartz: ['0', '0', '9', '*', '*', '1-5'] },
    { label: '每月1号 00:00', unix: ['0', '0', '1', '*', '*'], quartz: ['0', '0', '0', '1', '*', '*'] },
  ];

  const applyPreset = (p: any) => {
    if (mode === 'unix') {
      const v = p.unix;
      setMinute(v[0]);
      setHour(v[1]);
      setDom(v[2]);
      setMonth(v[3]);
      setDow(v[4]);
    } else {
      const v = p.quartz;
      setSecond(v[0]);
      setMinute(v[1]);
      setHour(v[2]);
      setDom(v[3]);
      setMonth(v[4]);
      setDow(v[5]);
    }
  };

  const reset = () => {
    setSecond('0');
    setMinute('*');
    setHour('*');
    setDom('*');
    setMonth('*');
    setDow('*');
    setYear('*');
    setIncludeYear(false);
  };

  const copyExpr = async () => {
    try {
      await navigator.clipboard.writeText(expr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const humanize = () => {
    if (mode === 'unix') {
      if (expr === '* * * * *') return '每分钟';
      const parts: string[] = [];
      if (minute !== '*') parts.push(`分: ${minute}`);
      if (hour !== '*') parts.push(`时: ${hour}`);
      if (dom !== '*') parts.push(`日: ${dom}`);
      if (month !== '*') parts.push(`月: ${month}`);
      if (dow !== '*') parts.push(`周: ${dow}`);
      return parts.length ? parts.join('，') : '任意时间';
    }

    if (!includeYear && expr === '0 * * * * *') return '每分钟（含秒字段）';
    const parts: string[] = [];
    if (second !== '*' && second !== '0') parts.push(`秒: ${second}`);
    if (minute !== '*') parts.push(`分: ${minute}`);
    if (hour !== '*') parts.push(`时: ${hour}`);
    if (dom !== '*') parts.push(`日: ${dom}`);
    if (month !== '*') parts.push(`月: ${month}`);
    if (dow !== '*') parts.push(`周: ${dow}`);
    if (includeYear && year !== '*') parts.push(`年: ${year}`);
    return parts.length ? parts.join('，') : '任意时间';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-full">
        <div className="flex-1 text-sm text-gray-700">Crontab / Quartz 表达式生成器</div>
        <div className="flex items-center gap-2">
          <label className="text-xs mr-2">模式</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'unix' | 'quartz')}
            className="p-1 rounded border text-sm"
          >
            <option value="unix">Unix (5 字段)</option>
            <option value="quartz">Quartz (秒 + 其它)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyExpr()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            复制表达式
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2 bg-white text-sm rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> 重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {mode === 'quartz' && (
          <label className="flex flex-col text-xs">
            <span className="text-gray-600 mb-1">秒</span>
            <input value={second} onChange={(e) => setSecond(e.target.value)} className="p-2 rounded border text-sm" />
          </label>
        )}

        <label className="flex flex-col text-xs">
          <span className="text-gray-600 mb-1">分</span>
          <input value={minute} onChange={(e) => setMinute(e.target.value)} className="p-2 rounded border text-sm" />
        </label>
        <label className="flex flex-col text-xs">
          <span className="text-gray-600 mb-1">时</span>
          <input value={hour} onChange={(e) => setHour(e.target.value)} className="p-2 rounded border text-sm" />
        </label>
        <label className="flex flex-col text-xs">
          <span className="text-gray-600 mb-1">日（月内）</span>
          <input value={dom} onChange={(e) => setDom(e.target.value)} className="p-2 rounded border text-sm" />
        </label>
        <label className="flex flex-col text-xs">
          <span className="text-gray-600 mb-1">月</span>
          <input value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 rounded border text-sm" />
        </label>
        <label className="flex flex-col text-xs">
          <span className="text-gray-600 mb-1">周（0-7）</span>
          <input value={dow} onChange={(e) => setDow(e.target.value)} className="p-2 rounded border text-sm" />
        </label>
      </div>

      {mode === 'quartz' && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={includeYear} onChange={(e) => setIncludeYear(e.target.checked)} />
            包含年份
          </label>
          {includeYear && (
            <label className="flex flex-col text-xs">
              <span className="text-gray-600 mb-1">年</span>
              <input value={year} onChange={(e) => setYear(e.target.value)} className="p-2 rounded border text-sm" />
            </label>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            <List className="w-4 h-4 inline-block mr-1" /> {p.label}
          </button>
        ))}
      </div>

      <div>
        <div className="text-xs text-gray-600">生成的表达式：</div>
        <pre className="mt-2 p-3 bg-white border rounded text-xs font-mono">{expr}</pre>
        <div className="text-sm text-gray-700 mt-2">说明：{humanize()}</div>
      </div>

      <div className="text-xs text-gray-500">示例：Unix: "0 0 * * *"，Quartz: "0 0 0 * * ?"（注意 Quartz 周与日的特殊用法）</div>
    </div>
  );
}
