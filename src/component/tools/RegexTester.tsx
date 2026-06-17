'use client';

import React, { useState, useEffect } from 'react';

// 大白话翻译字典
const REGEX_DICTIONARY = [
  { pattern: /\\d/, explanation: '【\\d】找一个数字（0-9）' },
  { pattern: /\\D/, explanation: '【\\D】找一个“非数字”的字符' },
  { pattern: /\\w/, explanation: '【\\w】找一个字母、数字或下划线' },
  { pattern: /\\W/, explanation: '【\\W】找一个“非字母/数字/下划线”的字符' },
  { pattern: /\\s/, explanation: '【\\s】找一个空格、制表符或换行符' },
  { pattern: /\\S/, explanation: '【\\S】找一个“非空白”的字符' },
  { pattern: /\./, explanation: '【 . 】（未转义的点）任意单个字符（除了换行符）' },
  { pattern: /\\\./, explanation: '【\\.】纯粹的句号“.”' },
  { pattern: /\^/, explanation: '【 ^ 】文本必须从这里开始（开头限定）' },
  { pattern: /\$/, explanation: '【 $ 】文本必须在这里结束（结尾限定）' },
  { pattern: /\*/, explanation: '【 * 】前面的东西可以有 0 个或多个（有没有都行）' },
  { pattern: /\+/, explanation: '【 + 】前面的东西至少要有 1 个（多多益善）' },
  { pattern: /\?/, explanation: '【 ? 】前面的东西可有可无（0个或1个）' },
  { pattern: /\{\d+\}/, explanation: '【{n}】前面的东西必须刚好重复 n 次' },
  { pattern: /\{\d+,\d+\}/, explanation: '【{n,m}】前面的东西重复次数在 n 到 m 之间' },
  { pattern: /\[(.*?)\]/, explanation: '【[...]】字符集，括号里的字符任意选一个中就成' },
];

// 常用预设案例
const PRESETS = [
  {
    name: '📱 手机号校验',
    regex: '1[3-9]\\d{9}',
    text: '我的电话是13812345678，他的电话是12345678901。',
  },
  {
    name: '📧 电子邮箱',
    regex: '\\w+@\\w+\\.\\w+',
    text: '欢迎发送邮件至 hello_world@example.com 或者 test@qq.com。',
  },
  {
    name: '📅 4位年份',
    regex: '\\d{4}',
    text: '今天是2026年5月30日。',
  }
];

export  function RegexTester() {
  const [regexStr, setRegexStr] = useState('1[3-9]\\d{9}');
  const [text, setText] = useState('我的电话是13812345678，不信你打打看。');
  const [matchCount, setMatchCount] = useState(0);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [error, setError] = useState('');

  // 核心逻辑：执行正则匹配与大白话拆解
  useEffect(() => {
    if (!regexStr) {
      setMatchCount(0);
      setExplanations([]);
      setError('');
      return;
    }

    try {
      // 验证正则表达式是否合法
      const regex = new RegExp(regexStr, 'g');
      setError('');

      // 1. 计算大白话解释
      const foundExplanations = [];
      REGEX_DICTIONARY.forEach(item => {
        if (item.pattern.test(regexStr)) {
          foundExplanations.push(item.explanation);
        }
      });
      if (foundExplanations.length === 0) {
        foundExplanations.push('主要是普通文本字符，直接精确匹配它们。');
      }
      setExplanations(foundExplanations);

      // 2. 计算匹配到的数量
      const matches = text.match(regex);
      setMatchCount(matches ? matches.length : 0);

    } catch (err) {
      setError('正则表达式语法好像有点小问题，检查下符号对不对？');
      setMatchCount(0);
      setExplanations([]);
    }
  }, [regexStr, text]);

  // 🔥 修复后的核心高亮渲染函数：采用可靠的 Split + Map 方案
  const renderHighlightedText = () => {
    if (!regexStr || error) return <span>{text}</span>;

    try {
      const regex = new RegExp(`(${regexStr})`, 'g'); // 用括号包裹捕获组，保留分隔符
      const parts = text.split(regex);
      
      // 重新用原始未加括号的正则来验证某一段文本是否是匹配项
      const verifyRegex = new RegExp(`^${regexStr}$`);

      return parts.map((part, index) => {
        if (verifyRegex.test(part)) {
          return (
            <mark 
              key={index} 
              className="bg-yellow-300 text-black px-1 rounded font-medium border border-yellow-400 mx-0.5 animate-pulse"
            >
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      });
    } catch (e) {
      return <span>{text}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 头部标题 */}
        {/* <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            🧙‍♂️ RegEx 大白话测试助手
          </h1>
          <p className="text-slate-500">别怕火星文，把正则表达式拆开揉碎讲给你听</p>
        </header> */}

        {/* 快捷预设 */}
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <span className="text-sm font-semibold text-slate-500 block mb-2">💡 试试常用预设：</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => { setRegexStr(preset.regex); setText(preset.text); }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-sm transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </section>

        {/* 主交互区 */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* 输入框：正则表达式 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <label className="block text-sm font-bold text-slate-700">🔍 在这里输入正则表达式：</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">/</span>
              <input
                type="text"
                value={regexStr}
                onChange={(e) => setRegexStr(e.target.value)}
                placeholder="例如: \d{4}"
                className={`w-full pl-6 pr-8 py-3 bg-slate-50 border rounded-lg font-mono text-lg tracking-wide focus:outline-none focus:ring-2 ${
                  error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg">/g</span>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          </div>

          {/* 输入框：测试文本 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <label className="block text-sm font-bold text-slate-700">📝 在这里输入用来测试的文本：</label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="抓取或者测试的段落..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-base"
            />
          </div>

          {/* 输出：高亮匹配结果 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700">🎯 实时高亮匹配结果：</label>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-1 rounded-full">
                找到 {matchCount} 个匹配
              </span>
            </div>
            <div className="w-full p-4 bg-slate-900 text-slate-100 rounded-lg min-h-[80px] whitespace-pre-wrap break-all leading-relaxed font-mono">
              {renderHighlightedText()}
            </div>
          </div>

          {/* 输出：大白话拆解解释 */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-indigo-100 p-6 rounded-xl shadow-md space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-white">
              <span>🗣️ 大白话公式拆解：</span>
            </h3>
            <hr className="border-indigo-800" />
            <ul className="space-y-2.5 text-sm md:text-base">
              {explanations.map((exp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-slate-200 font-light">{exp}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* 底部小贴士 */}
        <footer className="text-center text-xs text-slate-400 pt-4">
          提示：正则里的特殊符号（如 <code>. $ ^ * + ?</code> 等）如果要当普通字符找，记得在前面加反斜杠 <code>\</code> 转义哦！
        </footer>
      </div>
    </div>
  );
}