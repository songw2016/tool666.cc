'use client';

import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Copy } from 'lucide-react';

export function TextToQr() {
  const [text, setText] = useState('');
  const [size, setSize] = useState<number>(300);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  async function generate() {
    setError('');
    if (!text.trim()) {
      setError('请输入文本以生成二维码');
      setQrUrl(null);
      return;
    }
    setLoading(true);
    try {
      // dynamic import so build won't fail if dependency isn't installed yet
      const QR = await import('qrcode');
      const dataUrl = await QR.toDataURL(text, { width: size, margin: 1 });
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      // to keep same behavior as before we create an object URL from the blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      blobUrlRef.current = obj;
      setQrUrl(obj);
    } catch (e) {
      setError('生成失败: ' + (e as Error).message);
      setQrUrl(null);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    a.click();
  }

  function reset() {
    setText('');
    setQrUrl(null);
    setError('');
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }

  async function copyImage() {
    if (!qrUrl) return;
    try {
      const resp = await fetch(qrUrl);
      const blob = await resp.blob();
      if (typeof (window as any).ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
        const item = new (window as any).ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        // Fallback: copy data URL text so user can paste the image data where supported
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            await navigator.clipboard.writeText(reader.result as string);
          } catch (err) {
            setError('复制图片失败: 浏览器不支持直接复制图片，请下载。');
          }
        };
        reader.readAsDataURL(blob);
      } else {
        setError('复制图片失败: 当前浏览器不支持复制图片，请下载。');
      }
    } catch (e) {
      setError('复制图片失败: ' + (e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          生成二维码
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">大小</span>
          <input type="number" min={100} max={2000} value={size} onChange={(e) => setSize(Number(e.target.value) || 300)} className="w-24 p-2 border rounded-md text-sm" />
        </div>

        <div className="flex-1" />

        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">
          <RotateCcw className="w-4 h-4" />重置
        </button>

        {qrUrl && (
          <>
            <button onClick={download} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Download className="w-4 h-4" />下载
            </button>
            <button onClick={copyImage} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">
              <Copy className="w-4 h-4" />复制图片
            </button>
          </>
        )}
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="输入要转换成二维码的文本或链接..." className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">二维码预览</label>
          <div className="border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] flex items-center justify-center p-4">
            {loading ? (
              <div className="text-sm text-gray-500">生成中...</div>
            ) : qrUrl ? (
              <img src={qrUrl} alt="QR code" className="max-w-full max-h-96" />
            ) : (
              <div className="text-sm text-gray-400">生成的二维码将在这里显示</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextToQr;
