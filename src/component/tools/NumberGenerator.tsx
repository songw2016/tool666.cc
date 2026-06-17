'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Shuffle } from 'lucide-react';

export function NumberGenerator() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [unique, setUnique] = useState(false);
  const [sortResult, setSortResult] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    if (min > max) {
      setResults([]);
      return;
    }
    
    const range = max - min + 1;
    
    if (unique && count > range) {
      setResults([]);
      return;
    }
    
    const nums: number[] = [];
    const used = new Set<number>();
    
    while (nums.length < count) {
      const num = Math.floor(Math.random() * range) + min;
      if (unique) {
        if (!used.has(num)) {
          used.add(num);
          nums.push(num);
        }
      } else {
        nums.push(num);
      }
    }
    
    if (sortResult) {
      nums.sort((a, b) => a - b);
    }
    
    setResults(nums);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateLottery = (type: 'ssq' | 'dlt') => {
    if (type === 'ssq') {
      // 双色球：6红(1-33) + 1蓝(1-16)
      const reds: number[] = [];
      const used = new Set<number>();
      while (reds.length < 6) {
        const num = Math.floor(Math.random() * 33) + 1;
        if (!used.has(num)) {
          used.add(num);
          reds.push(num);
        }
      }
      reds.sort((a, b) => a - b);
      const blue = Math.floor(Math.random() * 16) + 1;
      setResults([...reds, blue]);
    } else {
      // 大乐透：5前(1-35) + 2后(1-12)
      const fronts: number[] = [];
      const used = new Set<number>();
      while (fronts.length < 5) {
        const num = Math.floor(Math.random() * 35) + 1;
        if (!used.has(num)) {
          used.add(num);
          fronts.push(num);
        }
      }
      fronts.sort((a, b) => a - b);
      const backs: number[] = [];
      const usedBacks = new Set<number>();
      while (backs.length < 2) {
        const num = Math.floor(Math.random() * 12) + 1;
        if (!usedBacks.has(num)) {
          usedBacks.add(num);
          backs.push(num);
        }
      }
      backs.sort((a, b) => a - b);
      setResults([...fronts, ...backs]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 参数设置 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最小值</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">最大值</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min={1}
            max={1000}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={generate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      {/* 选项 */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">不重复</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sortResult}
            onChange={(e) => setSortResult(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm text-gray-700">自动排序</span>
        </label>
      </div>

      {/* 彩票快捷生成 */}
      <div className="flex gap-3">
        <button
          onClick={() => generateLottery('ssq')}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
        >
          🎱 双色球
        </button>
        <button
          onClick={() => generateLottery('dlt')}
          className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
        >
          🎯 大乐透
        </button>
      </div>

      {/* 结果 */}
      {results.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              生成结果 ({results.length} 个)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {results.map((num, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-700 font-mono font-bold text-lg rounded-lg"
              >
                {num}
              </span>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-600">
            {results.join(', ')}
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-900">
              {Math.min(...results)}
            </div>
            <div className="text-xs text-gray-500">最小值</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...results)}
            </div>
            <div className="text-xs text-gray-500">最大值</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="text-lg font-bold text-gray-900">
              {(results.reduce((a, b) => a + b, 0) / results.length).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">平均值</div>
          </div>
        </div>
      )}
    </div>
  );
}