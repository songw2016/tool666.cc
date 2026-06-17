'use client';

import { useState, useMemo } from 'react';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'area' | 'volume' | 'temperature';

interface UnitDef {
  name: string;
  symbol: string;
  factor: number;
  offset?: number;
}

const unitData: Record<UnitCategory, { name: string; base: string; units: Record<string, UnitDef> }> = {
  length: {
    name: '长度',
    base: 'm',
    units: {
      mm: { name: '毫米', symbol: 'mm', factor: 0.001 },
      cm: { name: '厘米', symbol: 'cm', factor: 0.01 },
      m: { name: '米', symbol: 'm', factor: 1 },
      km: { name: '千米', symbol: 'km', factor: 1000 },
      inch: { name: '英寸', symbol: 'in', factor: 0.0254 },
      ft: { name: '英尺', symbol: 'ft', factor: 0.3048 },
      yd: { name: '码', symbol: 'yd', factor: 0.9144 },
      mi: { name: '英里', symbol: 'mi', factor: 1609.344 },
      nmi: { name: '海里', symbol: 'nmi', factor: 1852 },
    }
  },
  weight: {
    name: '重量',
    base: 'kg',
    units: {
      mg: { name: '毫克', symbol: 'mg', factor: 0.000001 },
      g: { name: '克', symbol: 'g', factor: 0.001 },
      kg: { name: '千克', symbol: 'kg', factor: 1 },
      t: { name: '吨', symbol: 't', factor: 1000 },
      lb: { name: '磅', symbol: 'lb', factor: 0.45359237 },
      oz: { name: '盎司', symbol: 'oz', factor: 0.02834952 },
      jin: { name: '斤', symbol: '斤', factor: 0.5 },
      liang: { name: '两', symbol: '两', factor: 0.05 },
    }
  },
  area: {
    name: '面积',
    base: 'm2',
    units: {
      cm2: { name: '平方厘米', symbol: 'cm²', factor: 0.0001 },
      m2: { name: '平方米', symbol: 'm²', factor: 1 },
      ha: { name: '公顷', symbol: 'ha', factor: 10000 },
      km2: { name: '平方千米', symbol: 'km²', factor: 1000000 },
      mu: { name: '亩', symbol: '亩', factor: 666.6667 },
      ft2: { name: '平方英尺', symbol: 'ft²', factor: 0.092903 },
      ac: { name: '英亩', symbol: 'ac', factor: 4046.856 },
    }
  },
  volume: {
    name: '体积',
    base: 'l',
    units: {
      ml: { name: '毫升', symbol: 'ml', factor: 0.001 },
      l: { name: '升', symbol: 'L', factor: 1 },
      m3: { name: '立方米', symbol: 'm³', factor: 1000 },
      gal: { name: '加仑(美)', symbol: 'gal', factor: 3.78541 },
      qt: { name: '夸脱', symbol: 'qt', factor: 0.946353 },
      pt: { name: '品脱', symbol: 'pt', factor: 0.473176 },
      cup: { name: '杯', symbol: 'cup', factor: 0.236588 },
    }
  },
  temperature: {
    name: '温度',
    base: 'c',
    units: {
      c: { name: '摄氏度', symbol: '°C', factor: 1, offset: 0 },
      f: { name: '华氏度', symbol: '°F', factor: 5/9, offset: -32 },
      k: { name: '开尔文', symbol: 'K', factor: 1, offset: -273.15 },
    }
  }
};

// 获取分类的默认单位
function getDefaultUnits(category: UnitCategory): [string, string] {
  const keys = Object.keys(unitData[category].units);
  return [keys[0], keys[1] || keys[0]];
}

// 安全获取单位定义
function getUnitDef(category: UnitCategory, unitKey: string): UnitDef | undefined {
  return unitData[category].units[unitKey];
}

export function UnitConverter() {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [value, setValue] = useState('1');
  const [copied, setCopied] = useState(false);

  // 使用 useMemo 确保单位始终对应当前分类
  const { fromUnit, toUnit, setFromUnit, setToUnit } = useMemo(() => {
    // 这里只是初始化，实际状态用 useState 管理
    return { fromUnit: '', toUnit: '', setFromUnit: () => {}, setToUnit: () => {} };
  }, []);

  // 改用独立的 state，但在切换分类时同步重置
  const [units, setUnits] = useState<{ from: string; to: string }>(() => {
    const [from, to] = getDefaultUnits('length');
    return { from, to };
  });

  const currentData = unitData[category];
  const unitEntries = Object.entries(currentData.units);

  // 切换分类
  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory);
    const [newFrom, newTo] = getDefaultUnits(newCategory);
    setUnits({ from: newFrom, to: newTo });
    setValue('1');
  };

  const convert = (val: number, from: string, to: string): number | null => {
    const fromDef = getUnitDef(category, from);
    const toDef = getUnitDef(category, to);
    
    if (!fromDef || !toDef) {
      return null;
    }

    if (category === 'temperature') {
      const celsius = (val + (fromDef.offset || 0)) * fromDef.factor;
      return celsius / toDef.factor - (toDef.offset || 0);
    }
    
    const baseValue = val * fromDef.factor;
    return baseValue / toDef.factor;
  };

  const result = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    
    const converted = convert(num, units.from, units.to);
    if (converted === null) return '单位错误';
    
    if (Math.abs(converted) < 0.000001 || Math.abs(converted) > 1000000000) {
      return converted.toExponential(6);
    }
    return parseFloat(converted.toFixed(8)).toString();
  }, [value, units.from, units.to, category]);

  const handleCopy = async () => {
    const fromDef = getUnitDef(category, units.from);
    const toDef = getUnitDef(category, units.to);
    if (!fromDef || !toDef) return;
    
    await navigator.clipboard.writeText(`${value} ${fromDef.symbol} = ${result} ${toDef.symbol}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setUnits({ from: units.to, to: units.from });
  };

  return (
    <div className="space-y-6">
      {/* 分类选择 */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(unitData) as UnitCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {unitData[cat].name}
          </button>
        ))}
      </div>

      {/* 转换区 */}
      <div className="p-6 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4">
          {/* 从 */}
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">从</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={units.from}
              onChange={(e) => setUnits(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            >
              {unitEntries.map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* 交换按钮 */}
          <button
            onClick={handleSwap}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* 到 */}
          <div className="flex-1 space-y-2">
            <label className="block text-sm font-medium text-gray-700">到</label>
            <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg font-mono text-lg text-gray-900 min-h-[3.25rem] flex items-center">
              {result || '-'}
            </div>
            <select
              value={units.to}
              onChange={(e) => setUnits(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            >
              {unitEntries.map(([key, unit]) => (
                <option key={key} value={key}>
                  {unit.name} ({unit.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {result && result !== '单位错误' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制结果'}
            </button>
          </div>
        )}
      </div>

      {/* 常用换算表 */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">常用换算参考</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {category === 'length' && [
            ['1 米', '3.28084 英尺'],
            ['1 千米', '0.621371 英里'],
            ['1 英寸', '2.54 厘米'],
          ].map(([a, b]) => (
            <div key={a} className="p-2 bg-white rounded-lg text-gray-600">
              {a} = {b}
            </div>
          ))}
          {category === 'weight' && [
            ['1 千克', '2.20462 磅'],
            ['1 斤', '500 克'],
            ['1 盎司', '28.3495 克'],
          ].map(([a, b]) => (
            <div key={a} className="p-2 bg-white rounded-lg text-gray-600">
              {a} = {b}
            </div>
          ))}
          {category === 'temperature' && [
            ['0°C', '32°F / 273.15K'],
            ['100°C', '212°F / 373.15K'],
            ['-40°C', '-40°F / 233.15K'],
          ].map(([a, b]) => (
            <div key={a} className="p-2 bg-white rounded-lg text-gray-600">
              {a} = {b}
            </div>
          ))}
          {category === 'area' && [
            ['1 平方米', '10.7639 平方英尺'],
            ['1 亩', '666.667 平方米'],
            ['1 公顷', '15 亩'],
          ].map(([a, b]) => (
            <div key={a} className="p-2 bg-white rounded-lg text-gray-600">
              {a} = {b}
            </div>
          ))}
          {category === 'volume' && [
            ['1 升', '1000 毫升'],
            ['1 加仑(美)', '3.78541 升'],
            ['1 立方米', '1000 升'],
          ].map(([a, b]) => (
            <div key={a} className="p-2 bg-white rounded-lg text-gray-600">
              {a} = {b}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}