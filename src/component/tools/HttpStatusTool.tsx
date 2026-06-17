'use client';

import { useState } from 'react';
import { Copy, Check, Search, FileText } from 'lucide-react';

type Status = {
  code: number;
  title: string;
  desc?: string;
  group: string;
};

const STATUSES: Status[] = [
  { code: 100, title: 'Continue', desc: '继续处理请求', group: '1xx 信息性响应' },
  { code: 101, title: 'Switching Protocols', desc: '切换协议', group: '1xx 信息性响应' },
  { code: 102, title: 'Processing', desc: '服务器已接收请求，正在处理', group: '1xx 信息性响应' },
  { code: 103, title: 'Early Hints', desc: '提前提示，常用于预加载', group: '1xx 信息性响应' },

  { code: 200, title: 'OK', desc: '请求成功', group: '2xx 成功' },
  { code: 201, title: 'Created', desc: '已创建资源', group: '2xx 成功' },
  { code: 202, title: 'Accepted', desc: '已接受请求，但未处理完成', group: '2xx 成功' },
  { code: 203, title: 'Non-Authoritative Information', desc: '非权威信息', group: '2xx 成功' },
  { code: 204, title: 'No Content', desc: '请求成功但无内容返回', group: '2xx 成功' },
  { code: 205, title: 'Reset Content', desc: '重置内容', group: '2xx 成功' },
  { code: 206, title: 'Partial Content', desc: '部分内容（用于 Range 请求）', group: '2xx 成功' },
  { code: 207, title: 'Multi-Status', desc: '多状态（WebDAV）', group: '2xx 成功' },
  { code: 208, title: 'Already Reported', desc: '已报告（WebDAV）', group: '2xx 成功' },
  { code: 226, title: 'IM Used', desc: '实例操作已使用（RFC 3229）', group: '2xx 成功' },

  { code: 300, title: 'Multiple Choices', desc: '多种选择', group: '3xx 重定向' },
  { code: 301, title: 'Moved Permanently', desc: '永久重定向', group: '3xx 重定向' },
  { code: 302, title: 'Found', desc: '临时重定向（历史用途）', group: '3xx 重定向' },
  { code: 303, title: 'See Other', desc: '另见（使用 GET 获取资源）', group: '3xx 重定向' },
  { code: 304, title: 'Not Modified', desc: '资源未修改（缓存）', group: '3xx 重定向' },
  { code: 305, title: 'Use Proxy', desc: '使用代理（不常用，已废弃）', group: '3xx 重定向' },
  { code: 307, title: 'Temporary Redirect', desc: '临时重定向', group: '3xx 重定向' },
  { code: 308, title: 'Permanent Redirect', desc: '永久重定向', group: '3xx 重定向' },

  { code: 400, title: 'Bad Request', desc: '错误请求，参数或语法不正确', group: '4xx 客户端错误' },
  { code: 401, title: 'Unauthorized', desc: '未授权（需要认证）', group: '4xx 客户端错误' },
  { code: 402, title: 'Payment Required', desc: '需要付款（保留）', group: '4xx 客户端错误' },
  { code: 403, title: 'Forbidden', desc: '禁止访问', group: '4xx 客户端错误' },
  { code: 404, title: 'Not Found', desc: '资源未找到', group: '4xx 客户端错误' },
  { code: 405, title: 'Method Not Allowed', desc: '请求方法不被允许', group: '4xx 客户端错误' },
  { code: 406, title: 'Not Acceptable', desc: '不可接受的内容', group: '4xx 客户端错误' },
  { code: 407, title: 'Proxy Authentication Required', desc: '需要代理认证', group: '4xx 客户端错误' },
  { code: 408, title: 'Request Timeout', desc: '请求超时', group: '4xx 客户端错误' },
  { code: 409, title: 'Conflict', desc: '请求冲突', group: '4xx 客户端错误' },
  { code: 410, title: 'Gone', desc: '资源已永久删除', group: '4xx 客户端错误' },
  { code: 411, title: 'Length Required', desc: '需要 Content-Length', group: '4xx 客户端错误' },
  { code: 412, title: 'Precondition Failed', desc: '前提条件失败', group: '4xx 客户端错误' },
  { code: 413, title: 'Payload Too Large', desc: '请求主体过大', group: '4xx 客户端错误' },
  { code: 414, title: 'URI Too Long', desc: 'URI 过长', group: '4xx 客户端错误' },
  { code: 415, title: 'Unsupported Media Type', desc: '不支持的媒体类型', group: '4xx 客户端错误' },
  { code: 416, title: 'Range Not Satisfiable', desc: '范围不可满足', group: '4xx 客户端错误' },
  { code: 417, title: 'Expectation Failed', desc: '期望失败', group: '4xx 客户端错误' },
  { code: 418, title: "I'm a teapot", desc: '我是茶壶（愚人节彩蛋）', group: '4xx 客户端错误' },
  { code: 421, title: 'Misdirected Request', desc: '请求被错误路由', group: '4xx 客户端错误' },
  { code: 422, title: 'Unprocessable Entity', desc: '不可处理的实体（语义错误）', group: '4xx 客户端错误' },
  { code: 423, title: 'Locked', desc: '资源被锁定（WebDAV）', group: '4xx 客户端错误' },
  { code: 424, title: 'Failed Dependency', desc: '依赖失败（WebDAV）', group: '4xx 客户端错误' },
  { code: 425, title: 'Too Early', desc: '请求过早，可能会导致重放攻击', group: '4xx 客户端错误' },
  { code: 426, title: 'Upgrade Required', desc: '需要升级协议', group: '4xx 客户端错误' },
  { code: 428, title: 'Precondition Required', desc: '需要前提条件', group: '4xx 客户端错误' },
  { code: 429, title: 'Too Many Requests', desc: '请求过多，已被限流', group: '4xx 客户端错误' },
  { code: 431, title: 'Request Header Fields Too Large', desc: '请求头字段过大', group: '4xx 客户端错误' },
  { code: 451, title: 'Unavailable For Legal Reasons', desc: '因法律原因不可用', group: '4xx 客户端错误' },

  { code: 500, title: 'Internal Server Error', desc: '服务器内部错误', group: '5xx 服务器错误' },
  { code: 501, title: 'Not Implemented', desc: '未实现', group: '5xx 服务器错误' },
  { code: 502, title: 'Bad Gateway', desc: '网关错误', group: '5xx 服务器错误' },
  { code: 503, title: 'Service Unavailable', desc: '服务不可用', group: '5xx 服务器错误' },
  { code: 504, title: 'Gateway Timeout', desc: '网关超时', group: '5xx 服务器错误' },
  { code: 505, title: 'HTTP Version Not Supported', desc: 'HTTP 版本不支持', group: '5xx 服务器错误' },
  { code: 506, title: 'Variant Also Negotiates', desc: '协商变体（服务器错误）', group: '5xx 服务器错误' },
  { code: 507, title: 'Insufficient Storage', desc: '存储不足（WebDAV）', group: '5xx 服务器错误' },
  { code: 508, title: 'Loop Detected', desc: '检测到循环（WebDAV）', group: '5xx 服务器错误' },
  { code: 510, title: 'Not Extended', desc: '未扩展', group: '5xx 服务器错误' },
  { code: 511, title: 'Network Authentication Required', desc: '需要网络认证', group: '5xx 服务器错误' },
];

export function HttpStatusTool() {
  const [q, setQ] = useState('');
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filtered = STATUSES.filter((s) => {
    if (!q.trim()) return true;
    const t = q.toLowerCase();
    return (
      String(s.code).includes(t) ||
      s.title.toLowerCase().includes(t) ||
      (s.desc || '').toLowerCase().includes(t) ||
      s.group.toLowerCase().includes(t)
    );
  });

  const groups = Array.from(new Set(filtered.map((s) => s.group)));

  const handleCopy = async (s: Status) => {
    const text = `${s.code} ${s.title} — ${s.desc || ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(s.code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-full">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-md shadow-sm flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索状态码、名称或分类..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(filtered.map((s) => `${s.code} ${s.title} - ${s.desc || ''}`).join('\n'))}
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
                .filter((s) => s.group === g)
                .map((s) => (
                  <div key={s.code} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">{s.code} — {s.title}</div>
                          <div className="text-xs text-gray-500">HTTP/{s.code}</div>
                        </div>
                        {s.desc && <div className="text-xs text-gray-600 mt-1">{s.desc}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleCopy(s)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {copiedCode === s.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && <div className="text-sm text-gray-500">未找到匹配的状态码。</div>}
      </div>
    </div>
  );
}
