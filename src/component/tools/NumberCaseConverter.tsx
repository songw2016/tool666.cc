'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';

const chineseLower = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
const chineseUpper = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const chineseUnits = ['', '十', '百', '千'];
const chineseBigUnits = ['', '万', '亿', '万亿'];
const financeUnits = ['', '拾', '佰', '仟'];

function numberToChineseLower(num: number): string {
  if (num === 0) return '零';
  if (num < 0) return '负' + numberToChineseLower(-num);
  
  const str = num.toString();
  let result = '';
  let zeroFlag = false;
  
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i]);
    const pos = str.length - 1 - i;
    const unitIndex = pos % 4;
    const bigUnitIndex = Math.floor(pos / 4);
    
    if (digit === 0) {
      if (!zeroFlag && result.length > 0) {
        zeroFlag = true;
      }
    } else {
      if (zeroFlag) {
        result += '零';
        zeroFlag = false;
      }
      result += chineseLower[digit] + chineseUnits[unitIndex];
    }
    
    if (unitIndex === 0 && bigUnitIndex > 0) {
      if (result.endsWith('零')) {
        result = result.slice(0, -1);
      }
      result += chineseBigUnits[bigUnitIndex];
      zeroFlag = false;
    }
  }
  
  // 处理 "一十" 简化为 "十"
  if (result.startsWith('一十') && result.length === 2) {
    result = result.slice(1);
  }
  
  return result;
}

function numberToChineseUpper(num: number): string {
  if (num === 0) return '零';
  if (num < 0) return '负' + numberToChineseUpper(-num);
  
  const str = num.toString();
  let result = '';
  let zeroFlag = false;
  
  for (let i = 0; i < str.length; i++) {
    const digit = parseInt(str[i]);
    const pos = str.length - 1 - i;
    const unitIndex = pos % 4;
    const bigUnitIndex = Math.floor(pos / 4);
    
    if (digit === 0) {
      if (!zeroFlag && result.length > 0) {
        zeroFlag = true;
      }
    } else {
      if (zeroFlag) {
        result += '零';
        zeroFlag = false;
      }
      result += chineseUpper[digit] + financeUnits[unitIndex];
    }
    
    if (unitIndex === 0 && bigUnitIndex > 0) {
      if (result.endsWith('零')) {
        result = result.slice(0, -1);
      }
      result += chineseBigUnits[bigUnitIndex].replace('万', '萬').replace('亿', '億');
      zeroFlag = false;
    }
  }
  
  if (result.startsWith('壹拾') && result.length === 2) {
    result = result.slice(1);
  }
  
  return result;
}

function numberToFinance(num: number): string {
  const upper = numberToChineseUpper(num);
  if (num === 0) return '零元整';
  
  // 处理小数
  const [integer, decimal] = num.toString().split('.');
  let result = numberToChineseUpper(parseInt(integer)) + '元';
  
  if (!decimal) {
    result += '整';
  } else {
    const decimalDigits = decimal.padEnd(2, '0').slice(0, 2);
    const jiao = parseInt(decimalDigits[0]);
    const fen = parseInt(decimalDigits[1]);
    
    if (jiao === 0 && fen === 0) {
      result += '整';
    } else {
      if (jiao > 0) result += chineseUpper[jiao] + '角';
      if (fen > 0) result += chineseUpper[fen] + '分';
    }
  }
  
  return result;
}

export function NumberCaseConverter() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState({
    lower: '',
    upper: '',
    finance: ''
  });
  const [copied, setCopied] = useState<string | null>(null);

  const handleConvert = () => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      setResults({ lower: '请输入有效数字', upper: '', finance: '' });
      return;
    }
    
    setResults({
      lower: numberToChineseLower(Math.floor(num)),
      upper: numberToChineseUpper(Math.floor(num)),
      finance: numberToFinance(num)
    });
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleReset = () => {
    setInput('');
    setResults({ lower: '', upper: '', finance: '' });
  };

  return (
    <div className="space-y-6">
      {/* 输入区 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入阿拉伯数字，如：123456789.50"
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleConvert}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          转换
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 结果区 */}
      <div className="space-y-4">
        {[
          { key: 'lower', label: '中文小写', value: results.lower, example: '一亿二千三百四十五万六千七百八十九' },
          { key: 'upper', label: '中文大写', value: results.upper, example: '壹億贰仟叁佰肆拾伍万陆仟柒佰捌拾玖' },
          { key: 'finance', label: '财务大写', value: results.finance, example: '壹億贰仟叁佰肆拾伍万陆仟柒佰捌拾玖元伍角整' }
        ].map((item) => (
          <div key={item.key} className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              {item.value && (
                <button
                  onClick={() => handleCopy(item.value, item.key)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {copied === item.key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === item.key ? '已复制' : '复制'}
                </button>
              )}
            </div>
            <div className="font-mono text-lg text-gray-900 min-h-[2rem]">
              {item.value || <span className="text-gray-400 text-sm">{item.example}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 常用数字参考 */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">常用数字对照</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            ['0', '零', '零'],
            ['10', '十', '拾'],
            ['100', '一百', '壹佰'],
            ['1000', '一千', '壹仟'],
            ['10000', '一万', '壹萬'],
            ['100000000', '一亿', '壹億']
          ].map(([num, lower, upper]) => (
            <div key={num} className="flex items-center gap-2 p-2 bg-white rounded-lg">
              <span className="font-mono text-blue-600 w-24">{num}</span>
              <span className="text-gray-600">{lower}</span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{upper}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}