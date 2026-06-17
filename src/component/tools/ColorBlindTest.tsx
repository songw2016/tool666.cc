'use client';

import React, { useState } from 'react';

// 测试题目数据：经典的石原氏色盲测试图模拟
// 注意：实际项目中请将 image 替换为真实的石原氏测试图路径（存放在 public 文件夹下）
const TEST_DATA = [
  {
    id: 1,
    image: '/images/ishihara-12.jpg', // 正常人读出 12，红绿色盲也读出 12（通常作为示范图）
    placeholder: '图中的数字是多少？',
    correctAnswer: '12',
    description: '示范图：所有人都能看到 12'
  },
  {
    id: 2,
    image: '/images/ishihara-6.jpg', // 正常人读出 6，红绿色盲可能读不出或读错
    placeholder: '图中的数字是多少？',
    correctAnswer: '6',
    description: '检测红绿色盲/色弱'
  },
  {
    id: 3,
    image: '/images/ishihara-29.jpg', // 正常人读出 29，红绿色盲读出 70
    placeholder: '图中的数字是多少？',
    correctAnswer: '29',
    alternativeAnswer: '70',
    description: '检测红绿突变'
  },
  {
    id: 4,
    image: '/images/ishihara-74.jpg', // 正常人读出 5，全色盲/严重色弱看不到数字
    placeholder: '图中的数字是多少？',
    correctAnswer: '74',
    description: '检测全色弱/色盲'
  }
];

export default function ColorBlindTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = TEST_DATA[currentIndex];
  const progress = ((currentIndex) / TEST_DATA.length) * 100;

  // 处理下一题
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedAnswers = [...userAnswers, inputValue.trim()];
    setUserAnswers(updatedAnswers);
    setInputValue('');

    if (currentIndex < TEST_DATA.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  // 评估测试结果
  const evaluateResults = () => {
    let score = 0;
    let redGreenBlindCount = 0;

    userAnswers.forEach((ans, index) => {
      const q = TEST_DATA[index];
      if (ans === q.correctAnswer) {
        score++;
      } else if (q.alternativeAnswer && ans === q.alternativeAnswer) {
        redGreenBlindCount++;
      }
    });

    if (score === TEST_DATA.length) {
      return {
        status: '正常',
        color: 'text-green-600 bg-green-50 border-green-200',
        advice: '恭喜！您的色觉完全正常，能够清晰分辨各种色彩组合。'
      };
    } else if (redGreenBlindCount > 0 || score === 1) {
      return {
        status: '疑似红绿色盲/色弱',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        advice: '测试结果显示您可能存在红绿色觉异常。建议前往医院眼科进行更专业的石原氏色觉检查。'
      };
    } else {
      return {
        status: '疑似色弱/全色盲',
        color: 'text-red-600 bg-red-50 border-red-200',
        advice: '您对部分图形的分辨较为困难，可能存在某种程度的色弱或全色盲。请以专业医疗机构的诊断为准。'
      };
    }
  };

  // 重置测试
  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswers([]);
    setInputValue('');
    setIsFinished(false);
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">色盲色弱在线自测</h2>
      <p className="text-xs text-center text-gray-500 mb-6">本测试仅供趣味参考，不代替专业医学诊断</p>

      {!isFinished ? (
        <div>
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress || 5}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mb-4 text-right">题目: {currentIndex + 1} / {TEST_DATA.length}</p>

          {/* 测试图显示区域 */}
          <div className="flex justify-center mb-6 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 aspect-square items-center relative overflow-hidden">
            {/* 提示：这里需要放置真实的石原氏色盲图片 */}
            {/* <img src={currentQuestion.image} alt="Color Blind Test" className="w-64 h-64 object-cover rounded-full shadow" /> */}
            
            {/* 临时占位图效果（实际开发请替换为上面的 img 标签） */}
            <div className="w-64 h-64 rounded-full flex flex-col items-center justify-center bg-gradient-to-tr from-red-200 via-green-200 to-blue-200 relative p-4 shadow-inner">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] rounded-full"></div>
              <span className="text-4xl font-extrabold text-gray-700/80 tracking-widest">{currentQuestion.correctAnswer}</span>
              <p className="text-[10px] text-gray-500 absolute bottom-4">模拟测试图 {currentQuestion.id}</p>
            </div>
          </div>

          {/* 答案输入表单 */}
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">请输入您在圆圈中看到的数字：</label>
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl font-semibold outline-none transition"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setInputValue('看不清'); const e = { preventDefault: () => {} }; handleNext(e as any); }}
                className="w-1/3 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition text-sm"
              >
                看不清/无数字
              </button>
              <button
                type="submit"
                className="w-2/3 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition text-sm"
              >
                {currentIndex === TEST_DATA.length - 1 ? '查看结果' : '下一题'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 测试结果展示 */
        <div className="space-y-6 text-center animate-fade-in">
          {(() => {
            const result = evaluateResults();
            return (
              <>
                <div className={`p-6 rounded-2xl border ${result.color}`}>
                  <p className="text-sm uppercase tracking-wider font-semibold opacity-80">您的色觉评估结果</p>
                  <h3 className="text-3xl font-black mt-2">{result.status}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {result.advice}
                </p>
              </>
            );
          })()}

          {/* 答题详情回顾 */}
          <div className="text-left border-t pt-4">
            <h4 className="text-sm font-bold text-gray-700 mb-3">答题详情反馈：</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {TEST_DATA.map((q, idx) => (
                <div key={q.id} className="text-xs flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-gray-500">图 {q.id} ({q.description.split('：')[0]})</span>
                  <div>
                    <span className="mr-2 text-gray-400">您的答案: <strong className="text-gray-700">{userAnswers[idx]}</strong></span>
                    {userAnswers[idx] === q.correctAnswer ? (
                      <span className="text-green-600 font-bold">✓ 正确</span>
                    ) : (
                      <span className="text-red-500 font-bold">✗ 标准: {q.correctAnswer}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-950 text-white font-medium rounded-xl transition shadow"
          >
            重新测试
          </button>
        </div>
      )}
    </div>
  );
}