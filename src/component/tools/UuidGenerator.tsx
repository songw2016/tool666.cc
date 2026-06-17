'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Settings } from 'lucide-react';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [withBraces, setWithBraces] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => {
      let uuid = generateUUID();
      if (uppercase) uuid = uuid.toUpperCase();
      if (withBraces) uuid = `{${uuid}}`;
      return uuid;
    });
    setUuids(newUuids);
  };

  const handleCopy = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">数量:</span>
          <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} min={1} max={100} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm text-gray-700">大写</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={withBraces} onChange={(e) => setWithBraces(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
          <span className="text-sm text-gray-700">包含花括号</span>
        </label>
        <div className="flex-1"></div>
        <button onClick={handleGenerate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4" />生成
        </button>
        {uuids.length > 0 && (
          <button onClick={handleCopyAll} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            <Copy className="w-4 h-4" />复制全部
          </button>
        )}
      </div>

      <div className="space-y-2">
        {uuids.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">点击生成按钮创建 UUID</div>
        ) : (
          uuids.map((uuid, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <span className="text-xs text-gray-400 w-8">{index + 1}</span>
              <code className="flex-1 font-mono text-sm text-gray-900">{uuid}</code>
              <button onClick={() => handleCopy(uuid, index)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}