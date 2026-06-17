'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash } from 'lucide-react';

const DEFAULT_ZONES = [
  { id: 'Asia/Shanghai', labelCN: '上海', labelEN: 'Shanghai (CST)' },
  { id: 'Europe/London', labelCN: '伦敦', labelEN: 'London (BST/GMT)' },
  { id: 'America/New_York', labelCN: '纽约', labelEN: 'New York (ET)' },
  { id: 'Asia/Tokyo', labelCN: '东京', labelEN: 'Tokyo (JST)' },
  { id: 'UTC', labelCN: '协调世界时', labelEN: 'UTC' },
];

function formatTimeForZone(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    }).format(date);
  } catch (e) {
    return '--:--:--';
  }
}

function formatDateForZone(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    }).format(date);
  } catch (e) {
    return '';
  }
}

export function WorldClock() {
  const [zones, setZones] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('worldClocks.zones');
      if (raw) return JSON.parse(raw) as string[];
    } catch (e) {
      // ignore
    }
    return DEFAULT_ZONES.map((z) => z.id);
  });

  const [now, setNow] = useState<Date>(new Date());
  const [selectedAdd, setSelectedAdd] = useState<string>(DEFAULT_ZONES[0].id);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('worldClocks.zones', JSON.stringify(zones));
    } catch (e) {
      // ignore
    }
  }, [zones]);

  function addZone() {
    if (!selectedAdd) return;
    setZones((prev) => (prev.includes(selectedAdd) ? prev : [...prev, selectedAdd]));
  }

  function removeZone(tz: string) {
    setZones((prev) => prev.filter((z) => z !== tz));
  }

  const availableOptions = DEFAULT_ZONES;

  function getZoneMeta(id: string) {
    return DEFAULT_ZONES.find((z) => z.id === id) || { id, labelCN: id, labelEN: id };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <Clock className="w-5 h-5 text-gray-600" />
          <div className="text-lg font-medium">世界时钟</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select value={selectedAdd} onChange={(e) => setSelectedAdd(e.target.value)} className="p-2 border rounded-md text-sm">
            {availableOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.labelCN} — {o.labelEN}
              </option>
            ))}
          </select>
          <button onClick={addZone} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4" />添加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((tz) => {
          const meta = getZoneMeta(tz as string as string);
          return (
            <div key={tz} className="p-4 bg-white border rounded-lg flex flex-col">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">{meta.labelCN}</div>
                  <div className="text-xs text-gray-400">{meta.labelEN}</div>
                  <div className="text-xl font-medium mt-1">{formatDateForZone(now, tz)}</div>
                </div>
                <button onClick={() => removeZone(tz)} className="text-gray-500 hover:text-red-600 p-1">
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 text-4xl font-mono text-center">{formatTimeForZone(now, tz)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorldClock;
