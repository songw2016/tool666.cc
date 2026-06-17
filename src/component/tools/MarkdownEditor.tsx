'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw, Eye, Edit3 } from 'lucide-react';

// 简单的 Markdown 渲染器
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-red-600">$1</code>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto my-4"><code>$1</code></pre>')
    .replace(/^\> (.*$)/gim, '<blockquote class="pl-4 border-l-4 border-blue-400 text-gray-600 italic my-3">$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    .replace(/\n/gim, '<br />');
}

export function MarkdownEditor() {
  const [text, setText] = useState('# 欢迎使用 Markdown 编辑器\n\n## 功能特点\n\n- **实时预览**：左侧编辑，右侧实时预览\n- **支持语法**：标题、列表、代码块、链接等\n- **导出功能**：支持复制和导出 HTML\n\n## 示例代码\n\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```\n\n> 这是一个引用块\n\n[访问 Tool666.cc](https://www.tool666.cc)');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => setText('');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('split')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>分屏</button>
          <button onClick={() => setViewMode('edit')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Edit3 className="w-4 h-4 inline mr-1" />编辑</button>
          <button onClick={() => setViewMode('preview')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}><Eye className="w-4 h-4 inline mr-1" />预览</button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            <RotateCcw className="w-4 h-4" />清空
          </button>
        </div>
      </div>

      <div className={`grid ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Markdown</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[600px] p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
            <div 
              className="w-full h-[600px] p-6 bg-white border border-gray-200 rounded-lg overflow-auto prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}