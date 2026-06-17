'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DynamicEditor from 'next/dynamic';

// 动态加载 Monaco Editor，禁用 SSR 渲染，防止构建时报错
const MonacoEditor = DynamicEditor(
  () => import('@monaco-editor/react'),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-zinc-900 animate-pulse rounded-lg border border-zinc-800" /> 
  }
);

// 定义数据画像指标接口
interface JsonMetricsData {
  depth: number;
  keysCount: number;
  size: number;
}
//JsonDashboardPage - 一个基于的 JSON 数据格式化与可视化看板组件，提供智能格式化、数据画像统计和交互树视图功能，帮助开发者高效分析和理解 JSON 数据结构。
export  function JsonDashboard() {
  // 核心状态：原始输入字符串
  const [rawJson, setRawJson] = useState<string>('{\n  "projectName": "JSON Dashboard",\n  "version": "1.0.0",\n  "features": [\n    "Smart Formatting",\n    "Data Profiling",\n    "Dynamic Tree View"\n  ],\n  "author": {\n    "name": "Developer",\n    "active": true\n  }\n}');
  
  // 解析后的对象与错误捕获
  const [parsedJson, setParsedJson] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  
  // 交互状态：当前选中的视图 Tab (code / tree)
  const [activeTab, setActiveTab] = useState<'code' | 'tree'>('code');
  // 树形视图中已被折叠/展开的节点路径记录
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});

  // 监听输入并解析 JSON
  useEffect(() => {
    if (!rawJson.trim()) {
      setParsedJson({});
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(rawJson);
      setParsedJson(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [rawJson]);

  // 核心功能：使用 useMemo 高效计算 JSON 深度、键数和体积
  const metrics = useMemo<JsonMetricsData>(() => {
    if (error || !parsedJson || Object.keys(parsedJson).length === 0) {
      return { depth: 0, keysCount: 0, size: 0 };
    }
    
    let maxDepth = 0;
    let totalKeys = 0;

    function calculate(obj: any, currentDepth: number) {
      if (obj && typeof obj === 'object') {
        maxDepth = Math.max(maxDepth, currentDepth);
        const keys = Object.keys(obj);
        totalKeys += keys.length;
        keys.forEach(key => calculate(obj[key], currentDepth + 1));
      }
    }
    
    calculate(parsedJson, 1);
    const sizeInBytes = new Blob([rawJson]).size;

    return { depth: maxDepth, keysCount: totalKeys, size: sizeInBytes };
  }, [parsedJson, rawJson, error]);

  // 快捷操作：一键压缩 JSON
  const handleMinify = () => {
    if (error) return;
    try {
      setRawJson(JSON.stringify(parsedJson));
    } catch (e) {}
  };

  // 快捷操作：一键美化格式化
  const handleBeautify = () => {
    if (error) return;
    try {
      setRawJson(JSON.stringify(parsedJson, null, 2));
    } catch (e) {}
  };

  // 树形视图辅助渲染函数：递归生成 DOM 节点
  const renderTreeNodes = (data: any, path: string = 'root'): React.ReactNode => {
    const isCollapsed = collapsedPaths[path];
    
    if (data === null) return <span className="text-amber-500 font-mono">null</span>;
    if (typeof data === 'boolean') return <span className="text-purple-400 font-mono">{data ? 'true' : 'false'}</span>;
    if (typeof data === 'number') return <span className="text-cyan-400 font-mono">{data}</span>;
    if (typeof data === 'string') return <span className="text-emerald-400 font-mono">"{data}"</span>;

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);

    return (
      <div className="pl-4 font-mono text-sm border-l border-zinc-800 my-0.5">
        {/* 节点头部：点击可折叠 */}
        <span 
          className="cursor-pointer select-none text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
          onClick={() => setCollapsedPaths(prev => ({ ...prev, [path]: !prev[path] }))}
        >
          <span className="text-xs text-zinc-600 w-3 inline-block">
            {isCollapsed ? '▶' : '▼'}
          </span>
          <span className="text-blue-400">{isArray ? `Array[${keys.length}]` : `Object`}</span>
        </span>

        {/* 节点内容 */}
        {!isCollapsed && (
          <div className="mt-1 space-y-1">
            {keys.map((key) => {
              const currentPath = `${path}.${key}`;
              return (
                <div key={key} className="flex flex-col md:flex-row md:items-start pl-2">
                  <span className="text-zinc-300 font-medium mr-2 shrink-0">
                    "{key}":
                  </span>
                  <div className="flex-1">
                    {renderTreeNodes(data[key], currentPath)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col antialiased">
      {/* 顶部通栏 Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-md text-xs">JSON</span>
            高级格式化与可视化看板
          </h1> 
        </div> */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleBeautify}
            disabled={!!error}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-medium rounded-md border border-zinc-700 transition"
          >
            美化格式
          </button>
          <button 
            onClick={handleMinify}
            disabled={!!error}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-medium rounded-md border border-zinc-700 transition"
          >
            压缩数据
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto overflow-hidden">
        {/* 数据画像统计面板 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">最大嵌套深度</p>
            <p className="text-3xl font-bold font-mono mt-2 text-blue-500">{metrics.depth} <span className="text-xs font-normal text-zinc-500">层</span></p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">总键值对数 (Keys)</p>
            <p className="text-3xl font-bold font-mono mt-2 text-emerald-500">{metrics.keysCount} <span className="text-xs font-normal text-zinc-500">个</span></p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">数据体积 (Size)</p>
            <p className="text-3xl font-bold font-mono mt-2 text-cyan-500">
              {(metrics.size / 1024).toFixed(3)} <span className="text-xs font-normal text-zinc-500">KB</span>
            </p>
          </div>
        </section>

        {/* 双栏主工作区 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[550px]">
          
          {/* 左侧栏：代码输入编辑器 */}
          <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
            <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex justify-between items-center px-4">
              <span className="text-xs font-semibold tracking-wider text-zinc-400 font-mono">INPUT_JSON_EDITOR</span>
              {error && (
                <span className="text-xs px-2 py-0.5 bg-red-950 border border-red-800 text-red-400 rounded font-mono max-w-[250px] truncate" title={error}>
                  语法错误: {error}
                </span>
              )}
            </div>
            <div className="flex-1 min-h-[450px] lg:h-full">
              <MonacoEditor
                height="100%"
                language="json"
                theme="vs-dark"
                value={rawJson}
                onChange={(val) => setRawJson(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>
          </div>

          {/* 右侧栏：可视化输出看板 */}
          <div className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30">
            {/* 视图切换 Tabs */}
            <div className="bg-zinc-900/80 border-b border-zinc-800 p-2 flex items-center justify-between px-4">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeTab === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  格式化输出
                </button>
                <button
                  onClick={() => setActiveTab('tree')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${activeTab === 'tree' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  交互树视图
                </button>
              </div>
              <span className="text-xs font-mono text-zinc-500">VISUAL_PREVIEW</span>
            </div>

            {/* 视图内容区 */}
            <div className="flex-1 p-4 overflow-auto bg-zinc-950/60 max-h-[600px] lg:max-h-none">
              {error ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm py-12">
                  <span className="text-2xl mb-2">⚠️</span>
                  <p>请先修复左侧 JSON 语法错误以启用可视化视图</p>
                </div>
              ) : Object.keys(parsedJson).length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-sm py-12">
                  无可用数据，请在左侧编辑器中输入
                </div>
              ) : activeTab === 'code' ? (
                // 格式化输出模式
                <pre className="font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap selection:bg-zinc-800">
                  {JSON.stringify(parsedJson, null, 2)}
                </pre>
              ) : (
                // 交互树渲染模式
                <div className="p-2 select-text selection:bg-zinc-800">
                  {renderTreeNodes(parsedJson)}
                </div>
              )}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
