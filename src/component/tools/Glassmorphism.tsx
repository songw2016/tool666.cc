'use client';

import React, { useState, useEffect } from 'react';
//GlassmorphismGenerator - 一个基于 Next.js 和 Tailwind CSS 的玻璃拟态效果生成器，提供实时预览和动态参数调整功能，帮助开发者轻松创建具有磨砂玻璃质感的 UI 元素，并生成通用 CSS 代码以便在项目中使用。
export  function GlassmorphismGenerator() {
  // 状态管理
  const [bgGrad1, setBgGrad1] = useState('#ff007f');
  const [bgGrad2, setBgGrad2] = useState('#7f00ff');
  const [opacity, setOpacity] = useState(0.20);
  const [blur, setBlur] = useState(15);
  const [borderOpacity, setBorderOpacity] = useState(0.40);
  const [radius, setRadius] = useState(20);
  const [copyText, setCopyText] = useState('一键复制 CSS 代码');

  // 动态生成的 CSS 代码字符串
  const generatedCss = `background: rgba(255, 255, 255, ${opacity});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid rgba(255, 255, 255, ${borderOpacity});
border-radius: ${radius}px;
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);`;

  // 复制代码到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCss);
      setCopyText('🎉 复制成功！');
      setTimeout(() => setCopyText('一键复制 CSS 代码'), 1500);
    } catch (err) {
      setCopyText('❌ 复制失败，请手动复制');
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-5 transition-all duration-300"
      style={{ background: `linear-gradient(135deg, ${bgGrad1}, ${bgGrad2})` }}
    >
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* 左侧：实时预览区域 */}
        <div className="flex-1 min-h-[400px] md:min-h-[500px] bg-black/10 rounded-3xl relative overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-sm border border-white/10">
          {/* 背景装饰流体圆圈 1 */}
          <div 
            className="absolute w-36 h-36 rounded-full top-[15%] left-[15%] animate-pulse"
            style={{ background: 'linear-gradient(45deg, #ff00a0, #ff758c)', transform: 'scale(1.2)' }}
          />
          {/* 背景装饰流体圆圈 2 */}
          <div 
            className="absolute w-52 h-52 rounded-full bottom-[10%] right-[10%] animate-bounce"
            style={{ background: 'linear-gradient(45deg, #00f2fe, #4facfe)', animationDuration: '6s' }}
          />

          {/* 核心玻璃卡片 */}
          <div 
            className="w-80 h-52 z-10 flex flex-col justify-center items-center p-5 text-center text-white transition-all duration-150"
            style={{
              background: `rgba(255, 255, 255, ${opacity})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
              borderRadius: `${radius}px`,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <h3 className="text-2xl font-bold tracking-wide">Glassmorphism</h3>
            <p className="text-sm opacity-80 mt-2 font-light">完美磨砂玻璃质感</p>
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="flex-1 bg-white/95 text-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 justify-between border border-white/50">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">玻璃拟态生成器</h2>
            <p className="text-xs text-gray-400 mb-4">实时调参并生成 Next.js / Tailwind 通用 CSS</p>
            
            <div className="flex flex-col gap-5">
              {/* 背景渐变设置 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">环境背景渐变色</label>
                <div className="flex gap-3">
                  <input 
                    type="color" 
                    value={bgGrad1} 
                    onChange={(e) => setBgGrad1(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-xl cursor-pointer p-0.5"
                  />
                  <input 
                    type="color" 
                    value={bgGrad2} 
                    onChange={(e) => setBgGrad2(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-xl cursor-pointer p-0.5"
                  />
                </div>
              </div>

              {/* 玻璃不透明度 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>玻璃不透明度</span>
                  <span className="font-mono text-purple-600">{opacity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={opacity} 
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* 模糊度 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>模糊程度 (Blur)</span>
                  <span className="font-mono text-purple-600">{blur}px</span>
                </div>
                <input 
                  type="range" min="0" max="30" step="1" value={blur} 
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* 边框不透明度 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>边框高光不透明度</span>
                  <span className="font-mono text-purple-600">{borderOpacity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" value={borderOpacity} 
                  onChange={(e) => setBorderOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* 圆角 */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>圆角大小 (Radius)</span>
                  <span className="font-mono text-purple-600">{radius}px</span>
                </div>
                <input 
                  type="range" min="0" max="50" step="1" value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* 代码输出与复制 */}
          <div className="flex flex-col gap-2 mt-4">
            <label className="text-sm font-semibold text-gray-600">生成的 CSS 代码：</label>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
              {generatedCss}
            </pre>
            <button 
              onClick={handleCopy}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-purple-200 active:scale-[0.98]"
            >
              {copyText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}