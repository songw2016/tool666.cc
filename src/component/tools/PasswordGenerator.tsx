'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, Shield } from 'lucide-react';

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeUppercase) chars += uppercase;
    if (includeLowercase) chars += lowercase;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) return;

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
    setHistory((prev) => [result, ...prev].slice(0, 10));
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrength = () => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (includeUppercase) score++;
    if (includeLowercase) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;
    return Math.min(score, 5);
  };

  const strengthLabels = ['极弱', '弱', '一般', '强', '很强', '极强'];
  const strengthColors = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-green-400', 'bg-green-500', 'bg-green-600'];

  return (
    <div className="space-y-6">
      {/* 密码显示 */}
      <div className="p-6 bg-gray-900 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-2xl text-white tracking-wider">{password || '点击生成密码'}</div>
          <button onClick={handleCopy} disabled={!password} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${strengthColors[getStrength()]} transition-all`} style={{ width: `${(getStrength() / 5) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400">{strengthLabels[getStrength()]}</span>
        </div>
      </div>

      {/* 设置 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>密码长度</span>
              <span>{length}</span>
            </label>
            <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center justify-center">
            <button onClick={generate} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-5 h-5" />生成密码
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { label: '大写字母 (A-Z)', checked: includeUppercase, onChange: setIncludeUppercase },
            { label: '小写字母 (a-z)', checked: includeLowercase, onChange: setIncludeLowercase },
            { label: '数字 (0-9)', checked: includeNumbers, onChange: setIncludeNumbers },
            { label: '特殊符号 (!@#$...)', checked: includeSymbols, onChange: setIncludeSymbols },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 历史记录 */}
      {history.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">历史记录</h3>
          <div className="space-y-1">
            {history.map((pwd, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <code className="flex-1 font-mono text-sm text-gray-600">{pwd}</code>
                <button onClick={() => { navigator.clipboard.writeText(pwd); }} className="p-1 text-gray-400 hover:text-gray-600">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}