'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, RotateCcw, Clock } from 'lucide-react';

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTimestampToDate = () => {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return;
    const date = new Date(ts.toString().length === 10 ? ts * 1000 : ts);
    setDateStr(date.toLocaleString('zh-CN'));
  };

  const handleDateToTimestamp = () => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    setTimestamp(Math.floor(date.getTime() / 1000).toString());
  };

  const handleNow = () => {
    const ts = Math.floor(Date.now() / 1000);
    setTimestamp(ts.toString());
    setDateStr(new Date().toLocaleString('zh-CN'));
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 当前时间显示 */}
      <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-blue-700">当前时间戳:</span>
          <span className="font-mono text-lg font-bold text-blue-900">
            {Math.floor(now / 1000)}
          </span>
        </div>
        <span className="text-sm text-blue-600">{new Date(now).toLocaleString('zh-CN')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 时间戳转日期 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">时间戳 → 日期</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="输入 Unix 时间戳..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleTimestampToDate} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              转换
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={dateStr}
              readOnly
              placeholder="转换结果..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
            {dateStr && (
              <button onClick={() => handleCopy(dateStr)} className="p-2 text-gray-500 hover:text-gray-700">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* 日期转时间戳 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">日期 → 时间戳</h3>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={dateStr ? new Date(new Date(dateStr).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
              onChange={(e) => setDateStr(new Date(e.target.value).toLocaleString('zh-CN'))}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleDateToTimestamp} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              转换
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={timestamp}
              readOnly
              placeholder="转换结果..."
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
            />
            {timestamp && (
              <button onClick={() => handleCopy(timestamp)} className="p-2 text-gray-500 hover:text-gray-700">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleNow} className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
          获取当前时间
        </button>
      </div>
    </div>
  );
}