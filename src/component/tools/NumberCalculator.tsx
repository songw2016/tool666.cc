'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Calculator } from 'lucide-react';

export function NumberCalculator() {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [operation, setOperation] = useState<'add' | 'sub' | 'mul' | 'div' | 'mod' | 'pow'>('add');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const operations = [
    { key: 'add' as const, label: '+', name: '加法' },
    { key: 'sub' as const, label: '-', name: '减法' },
    { key: 'mul' as const, label: '×', name: '乘法' },
    { key: 'div' as const, label: '÷', name: '除法' },
    { key: 'mod' as const, label: '%', name: '取模' },
    { key: 'pow' as const, label: '^', name: '幂运算' },
  ];

  const handleCalculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    
    if (isNaN(a) || isNaN(b)) {
      setResult('请输入有效数字');
      return;
    }
    
    let res: number;
    switch (operation) {
      case 'add': res = a + b; break;
      case 'sub': res = a - b; break;
      case 'mul': res = a * b; break;
      case 'div': 
        if (b === 0) { setResult('除数不能为零'); return; }
        res = a / b; 
        break;
      case 'mod': 
        if (b === 0) { setResult('除数不能为零'); return; }
        res = a % b; 
        break;
      case 'pow': res = Math.pow(a, b); break;
      default: res = 0;
    }
    
    // 处理大数显示
    if (Math.abs(res) > 1e15) {
      setResult(res.toExponential(10));
    } else {
      // 去除多余的小数位
      const str = res.toString();
      if (str.includes('e')) {
        setResult(res.toFixed(10));
      } else {
        setResult(parseFloat(res.toFixed(10)).toString());
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputA('');
    setInputB('');
    setResult('');
  };

  return (
    <div className="space-y-6">
      {/* 运算选择 */}
      <div className="flex flex-wrap gap-2">
        {operations.map((op) => (
          <button
            key={op.key}
            onClick={() => setOperation(op.key)}
            className={`px-4 py-2 text-lg font-medium rounded-lg transition-colors ${
              operation === op.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={op.name}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* 输入区 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputA}
          onChange={(e) => setInputA(e.target.value)}
          placeholder="数字 A"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-2xl font-bold text-gray-400">
          {operations.find(o => o.key === operation)?.label}
        </span>
        <input
          type="text"
          value={inputB}
          onChange={(e) => setInputB(e.target.value)}
          placeholder="数字 B"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCalculate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          计算
        </button>
        <button
          onClick={handleReset}
          className="p-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* 结果 */}
      {result && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">计算结果</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div className="font-mono text-3xl text-gray-900 break-all">
            {result}
          </div>
        </div>
      )}

      {/* 进制转换参考 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">常用常数</h3>
          <div className="space-y-2 text-sm">
            {[
              ['π (圆周率)', Math.PI.toFixed(10)],
              ['e (自然常数)', Math.E.toFixed(10)],
              ['√2', Math.SQRT2.toFixed(10)],
              ['φ (黄金比例)', ((1 + Math.sqrt(5)) / 2).toFixed(10)]
            ].map(([name, value]) => (
              <div key={name} className="flex justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">{name}</span>
                <span className="font-mono text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">快速计算</h3>
          <div className="grid grid-cols-2 gap-2">
            {['2^10', '2^16', '2^20', '2^32'].map((expr) => (
              <button
                key={expr}
                onClick={() => {
                  const [base, exp] = expr.split('^').map(Number);
                  setInputA(base.toString());
                  setInputB(exp.toString());
                  setOperation('pow');
                }}
                className="p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {expr} = {Math.pow(Number(expr.split('^')[0]), Number(expr.split('^')[1])).toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}