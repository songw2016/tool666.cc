'use client';

import React, { useState, useEffect } from 'react';

export  function CsvToSqlConverter() {
  const [csvInput, setCsvInput] = useState<string>(
    `id,name,age,is_active,created_at\n1,"John Doe",28,true,2026-01-15\n2,"Jane Smith",34,false,2026-02-20\n3,O'Connor,19,true,2026-05-21`
  );
  const [tableName, setTableName] = useState<string>('my_table');
  const [includeCreate, setIncludeCreate] = useState<boolean>(true);
  const [sqlOutput, setSqlOutput] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<string>('复制 SQL');

  // 解析 CSV 行（处理双引号内有逗号的复杂情况）
  const parseCsvLine = (text: string): string[] => {
    const result: string[] = [];
    let insideQuote = false;
    let entry = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  // 核心转换逻辑
  useEffect(() => {
    if (!csvInput.trim()) {
      setSqlOutput('-- 请在左侧输入或粘贴 CSV 数据');
      return;
    }

    const lines = csvInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 1) return;

    const headers = parseCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());
    let sqlResult = '';
    const cleanTableName = tableName.trim() || 'my_table';

    if (includeCreate) {
      sqlResult += `CREATE TABLE ${cleanTableName} (\n`;
      const sampleValues = lines.length > 1 ? parseCsvLine(lines[1]) : [];
      
      const columnDefs = headers.map((header, index) => {
        const val = sampleValues[index] || '';
        let type = 'VARCHAR(255)';
        if (val && !isNaN(Number(val))) {
          type = val.includes('.') ? 'DECIMAL(10,2)' : 'INT';
        } else if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
          type = 'BOOLEAN';
        }
        return `  ${header} ${type}`;
      });
      
      sqlResult += columnDefs.join(',\n') + '\n);\n\n';
    }

    const insertRows: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      const formattedValues = headers.map((_, index) => {
        let val = values[index];
        if (val === undefined || val === '' || val.toUpperCase() === 'NULL') {
          return 'NULL';
        }
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        if (val.toLowerCase() === 'true') return 'TRUE';
        if (val.toLowerCase() === 'false') return 'FALSE';
        if (!isNaN(Number(val))) return val;

        const escapedStr = val.replace(/'/g, "''");
        return `'${escapedStr}'`;
      });

      insertRows.push(`(${formattedValues.join(', ')})`);
    }

    if (insertRows.length > 0) {
      sqlResult += `INSERT INTO ${cleanTableName} (${headers.join(', ')})\nVALUES\n`;
      sqlResult += insertRows.join(',\n') + ';';
    } else {
      sqlResult += '-- 未检测到有效的数据行';
    }

    setSqlOutput(sqlResult);
  }, [csvInput, tableName, includeCreate]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlOutput);
      setCopyStatus('已复制！');
      setTimeout(() => setCopyStatus('复制 SQL'), 2000);
    } catch (err) {
      setCopyStatus('复制失败');
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([sqlOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${tableName || 'export'}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto"> 

        {/* 控制配置栏 - 改为浅蓝底色 */}
        <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
              目标数据表名
            </label>
            <input
              type="text"
              className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
              value={tableName}
              onChange={(e) => setTableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="my_table"
            />
          </div>
          <div className="flex items-center md:pt-8 select-none">
            <label className="flex items-center cursor-pointer text-sm text-slate-700 font-medium">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 mr-2 cursor-pointer"
                checked={includeCreate}
                onChange={(e) => setIncludeCreate(e.target.checked)}
              />
              包含 <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 mx-1 text-xs font-mono font-bold">CREATE TABLE</code> 语句
              
            </label> 
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:pt-4 w-full"> 
        {/* 提示文字：在小屏上占满，大屏上弹性自适应，增加温馨的小图标 */}
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-md border border-blue-200/60 shadow-sm max-w-md">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>建议少量多批次生成，避免一次性处理过大数据导致浏览器卡顿。</span>
        </div> 

        {/* 操作按钮：微调了 py-2 让其高度与其他输入框更协调 */}
        <button
            onClick={() => setCsvInput('')}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg transition shadow-sm flex-shrink-0 text-center"
        >
            清空输入
        </button>
        </div>
        </div>

        {/* 主交互面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：CSV 输入（白底蓝字强调） */}
          <div className="flex flex-col h-[550px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">CSV 原始数据输入</span>
              <span className="text-xs text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">首行为字段名</span>
            </div>
            <textarea
              className="w-full flex-1 p-4 font-mono text-sm text-blue-900 bg-white placeholder-slate-400 resize-none focus:outline-none"
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="id,name,age&#10;1,张三,25"
            />
          </div>

          {/* 右侧：SQL 输出（灰色高对比度代码背景） */}
          <div className="flex flex-col h-[550px] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">生成的 SQL 语句预览</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition shadow-sm"
                >
                  {copyStatus}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition shadow-sm"
                >
                  下载 .sql 文件
                </button>
              </div>
            </div>
            {/* 使用了温和的深灰蓝/浅灰背景，确保代码高亮具备良好的可读性 */}
            <pre className="w-full flex-1 bg-slate-900 p-4 font-mono text-sm text-cyan-300 overflow-auto whitespace-pre-wrap selection:bg-blue-800 selection:text-white">
              <code>{sqlOutput}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}