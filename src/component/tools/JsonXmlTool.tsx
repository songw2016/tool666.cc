'use client';

import { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue }
interface JsonArray extends Array<JsonValue> {}

function escapeXml(unsafe: string) {
  return unsafe.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function jsonToXml(obj: unknown, nodeName = 'root'): string {
  if (obj === null || obj === undefined) return `<${nodeName}/>` + '\n';
  if (typeof obj !== 'object') {
    return `<${nodeName}>${escapeXml(String(obj))}</${nodeName}>` + '\n';
  }

  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, nodeName)).join('');
  }

  const o = obj as JsonObject;
  let xml = `<${nodeName}>` + '\n';
  for (const key of Object.keys(o)) {
    xml += jsonToXml(o[key], key);
  }
  xml += `</${nodeName}>` + '\n';
  return xml;
}

function xmlNodeToJson(node: Element): JsonValue {
  const obj: JsonObject = {};
  if (node.attributes && node.attributes.length) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      obj[`@${attr.name}`] = attr.value;
    }
  }

  const childElements = Array.from(node.children);
  if (childElements.length === 0) {
    const text = node.textContent?.trim() || '';
    return text !== '' ? text : (Object.keys(obj).length ? obj : null);
  }

  for (const child of childElements) {
    const childName = child.nodeName;
    const childObj = xmlNodeToJson(child as Element);
    if (obj[childName] !== undefined) {
      const existing = obj[childName];
      if (Array.isArray(existing)) {
        (existing as JsonArray).push(childObj);
      } else {
        obj[childName] = [existing as JsonValue, childObj] as JsonArray;
      }
    } else {
      obj[childName] = childObj;
    }
  }

  return obj;
}

export function JsonXmlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'json2xml' | 'xml2json'>('json2xml');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input) { setOutput(''); return; }
    try {
      if (mode === 'json2xml') {
        const parsed = JSON.parse(input) as unknown;
        const xml = jsonToXml(parsed, 'root');
        setOutput(xml.trim());
      } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(input, 'application/xml');
        const err = doc.getElementsByTagName('parsererror')[0];
        if (err) throw new Error('XML parse error');
        const root = doc.documentElement;
        const json = { [root.nodeName]: xmlNodeToJson(root) };
        setOutput(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      setOutput('❌ 转换失败');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => { setInput(''); setOutput(''); };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setMode('json2xml')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'json2xml' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>JSON → XML</button>
        <button onClick={() => setMode('xml2json')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'xml2json' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>XML → JSON</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={handleConvert} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">转换</button>
        <div className="flex-1"></div>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
          <RotateCcw className="w-4 h-4" />重置
        </button>
        {output && (
          <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'json2xml' ? 'JSON' : 'XML'}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={mode === 'json2xml' ? '{\n  "key": "value"\n}' : '<root>...</root>'} className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{mode === 'json2xml' ? 'XML' : 'JSON'}</label>
          <textarea value={output} readOnly placeholder="结果..." className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
}
          
