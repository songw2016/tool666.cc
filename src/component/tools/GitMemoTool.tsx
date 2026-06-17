'use client';

import { useState } from 'react';
import { Copy, Check, Search, FileText } from 'lucide-react';

type Cmd = {
  id: string;
  title: string;
  desc?: string;
  cmd: string;
  group?: string;
};

const COMMANDS: Cmd[] = [
  { id: 'init', title: '初始化仓库', desc: '在当前目录初始化一个 Git 仓库', cmd: 'git init', group: '基础' },
  { id: 'clone', title: '克隆仓库', desc: '从远端克隆', cmd: 'git clone <repo-url>', group: '基础' },
  { id: 'status', title: '查看状态', desc: '查看工作区和暂存区状态', cmd: 'git status', group: '基础' },
  { id: 'add', title: '添加文件到暂存区', desc: '添加单个或全部文件', cmd: 'git add <file>|git add .', group: '提交' },
  { id: 'commit', title: '提交', desc: '提交已暂存的变更', cmd: 'git commit -m "描述"', group: '提交' },
  { id: 'amend', title: '修改上次提交', desc: '修改最近的一次提交（非公共分支慎用）', cmd: 'git commit --amend', group: '提交' },
  { id: 'branch', title: '创建/切换分支', desc: '创建并切换到新分支', cmd: 'git checkout -b <branch>', group: '分支' },
  { id: 'switch', title: '切换分支（新）', desc: '使用 switch 切换分支', cmd: 'git switch <branch>', group: '分支' },
  { id: 'merge', title: '合并分支', desc: '把 feature 合并到 main', cmd: 'git merge <branch>', group: '分支' },
  { id: 'rebase', title: '变基', desc: '交互式变基以整理提交', cmd: 'git rebase -i <base>', group: '分支' },
  { id: 'stash', title: '保存当前修改', desc: '临时保存未提交的修改', cmd: 'git stash|git stash pop', group: '杂项' },
  { id: 'reset-soft', title: '回退（保留修改）', desc: '回退 commit，但保留工作区修改', cmd: 'git reset --soft <commit>', group: '回退' },
  { id: 'reset-hard', title: '强制回退', desc: '彻底回退到指定提交（危险）', cmd: 'git reset --hard <commit>', group: '回退' },
  { id: 'reflog', title: '恢复误删提交', desc: '查看引用日志并恢复', cmd: 'git reflog', group: '恢复' },
  { id: 'remote-add', title: '添加远端', desc: '添加远端仓库并命名', cmd: 'git remote add origin <repo-url>', group: '远程' },
  { id: 'push', title: '推送', desc: '推送到远端分支', cmd: 'git push origin <branch>', group: '远程' },
  { id: 'pull', title: '拉取并合并', desc: '从远端拉取并合并', cmd: 'git pull', group: '远程' },
  { id: 'fetch', title: '抓取远端', desc: '只抓取远端更新不合并', cmd: 'git fetch', group: '远程' },
  { id: 'log', title: '查看提交日志', desc: '简洁日志格式', cmd: 'git log --oneline --graph --decorate', group: '查看' },
  { id: 'cherry-pick', title: '摘樱桃', desc: '把指定提交应用到当前分支', cmd: 'git cherry-pick <commit>', group: '分支' },
  { id: 'config', title: '配置用户名/邮箱', desc: '设置仓库或全局用户名和邮箱', cmd: 'git config --global user.name "Name"\ngit config --global user.email "you@example.com"', group: '配置' },
];

export function GitMemoTool() {
  const [q, setQ] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = COMMANDS.filter((c) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      c.title.toLowerCase().includes(s) ||
      (c.desc || '').toLowerCase().includes(s) ||
      c.cmd.toLowerCase().includes(s) ||
      (c.group || '').toLowerCase().includes(s)
    );
  });

  const handleCopy = async (cmd: string, id: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  const groups = Array.from(new Set(filtered.map((c) => c.group || '其他')));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-full">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-md shadow-sm flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索命令、描述或分组..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(filtered.map((c) => `${c.title}: ${c.cmd}`).join('\n'))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            复制全部
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g}>
            <div className="text-sm font-medium text-gray-700 mb-2">{g}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered
                .filter((c) => (c.group || '其他') === g)
                .map((c) => (
                  <div key={c.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">{c.title}</div>
                          <div className="text-xs text-gray-500">{c.id}</div>
                        </div>
                        {c.desc && <div className="text-xs text-gray-600 mt-1">{c.desc}</div>}
                        <pre className="mt-3 p-3 bg-white border border-gray-100 rounded text-xs font-mono whitespace-pre-wrap">{c.cmd}</pre>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleCopy(c.cmd, c.id)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {copiedId === c.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-sm text-gray-500">未找到匹配的命令。</div>}
      </div>
    </div>
  );
}
