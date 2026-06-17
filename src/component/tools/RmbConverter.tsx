'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Banknote } from 'lucide-react';

const rmbUnits = ['元', '角', '分'];
const rmbBigNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
const rmbBigUnits = ['', '拾', '佰', '仟'];
const rmbSections = ['', '万', '亿', '万亿'];

function rmbToNumber(rmbStr: string): number | null {
  // 移除"人民币"、"RMB"、"￥"等前缀
  let str = rmbStr.replace(/[人民币RMB￥\s]/g, '');
  
  // 如果末尾有"整"，移除
  str = str.replace(/整$/, '');
  
  // 如果没有"元"，尝试直接解析数字
  if (!str.includes('元') && !str.includes('圆')) {
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }
  
  // 解析中文大写金额
  let result = 0;
  let section = 0;
  let sectionValue = 0;
  let lastNum = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const numIndex = rmbBigNums.indexOf(char);
    
    if (numIndex >= 0) {
      lastNum = numIndex;
    } else if (char === '拾') {
      sectionValue += (lastNum || 1) * 10;
      lastNum = 0;
    } else if (char === '佰') {
      sectionValue += lastNum * 100;
      lastNum = 0;
    } else if (char === '仟') {
      sectionValue += lastNum * 1000;
      lastNum = 0;
    } else if (char === '万') {
      sectionValue += lastNum;
      result += sectionValue * 10000;
      sectionValue = 0;
      lastNum = 0;
    } else if (char === '亿') {
      sectionValue += lastNum;
      result += sectionValue * 100000000;
      sectionValue = 0;
      lastNum = 0;
    } else if (char === '元' || char === '圆') {
      sectionValue += lastNum;
      result += sectionValue;
      sectionValue = 0;
      lastNum = 0;
    } else if (char === '角') {
      result += lastNum * 0.1;
      lastNum = 0;
    } else if (char === '分') {
      result += lastNum * 0.01;
      lastNum = 0;
    }
  }
  
  return result;
}

function numberToRmb(num: number): string {
  if (num === 0) return '零元整';
  if (num < 0) return '负' + numberToRmb(-num);
  
  const [integer, decimal] = num.toFixed(2).split('.');
  let result = '';
  
  // 处理整数部分
  const intStr = parseInt(integer).toString();
  let zeroFlag = false;
  
  for (let i = 0; i < intStr.length; i++) {
    const digit = parseInt(intStr[i]);
    const pos = intStr.length - 1 - i;
    const unitIndex = pos % 4;
    const sectionIndex = Math.floor(pos / 4);
    
    if (digit === 0) {
      if (!zeroFlag && result.length > 0) {
        zeroFlag = true;
      }
    } else {
      if (zeroFlag) {
        result += '零';
        zeroFlag = false;
      }
      result += rmbBigNums[digit] + rmbBigUnits[unitIndex];
    }
    
    if (unitIndex === 0 && sectionIndex > 0) {
      if (result.endsWith('零')) result = result.slice(0, -1);
      result += rmbSections[sectionIndex];
      zeroFlag = false;
    }
  }
  
  result += '元';
  
  // 处理小数部分
  const jiao = parseInt(decimal[0]);
  const fen = parseInt(decimal[1]);
  
  if (jiao === 0 && fen === 0) {
    result += '整';
  } else {
    if (jiao > 0) result += rmbBigNums[jiao] + '角';
    if (fen > 0) result += rmbBigNums[fen] + '分';
  }
  
  return result;
}

export function RmbConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'rmb2num' | 'num2rmb'>('num2rmb');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setResult('');
      return;
    }
    
    if (mode === 'num2rmb') {
      const num = parseFloat(input);
      if (isNaN(num)) {
        setResult('请输入有效数字');
        return;
      }
      setResult(numberToRmb(num));
    } else {
      const num = rmbToNumber(input);
      if (num === null) {
        setResult('无法解析，请输入正确的人民币格式');
        return;
      }
      setResult(num.toFixed(2));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInput('');
    setResult('');
  };

  return (
    <div className="space-y-6">
      {/* 模式切换 */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setMode('num2rmb'); setResult(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'num2rmb' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
        >
          数字 → 人民币
        </button>
        <button
          onClick={() => { setMode('rmb2num'); setResult(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'rmb2num' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
        >
          人民币 → 数字
        </button>
      </div>

      {/* 输入区 */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'num2rmb' ? '输入金额，如：123456.78' : '输入人民币大写，如：壹拾贰万叁仟肆佰伍拾陆元柒角捌分'}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleConvert}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Banknote className="w-4 h-4" />
            转换
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {mode === 'rmb2num' && (
          <p className="text-xs text-gray-500">
            支持格式：壹拾贰万叁仟肆佰伍拾陆元柒角捌分 / 人民币123456.78元
          </p>
        )}
      </div>

      {/* 结果区 */}
      {result && (
        <div className="p-6 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {mode === 'num2rmb' ? '人民币大写' : '数字金额'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <div className="font-mono text-2xl text-gray-900">
            {result}
          </div>
        </div>
      )}

      {/* 快速输入 */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">快速输入</h3>
        <div className="flex flex-wrap gap-2">
          {['100', '1000', '10000', '1688', '5201314', '99999.99'].map((num) => (
            <button
              key={num}
              onClick={() => { setInput(num); }}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}