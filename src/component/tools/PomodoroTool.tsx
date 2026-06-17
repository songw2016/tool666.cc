'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RefreshCw, Settings } from 'lucide-react';

export function PomodoroTool() {
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(15);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState<number>(4);

  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(workMinutes * 60);
  const cyclesRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // keep timeLeft in sync when user adjusts durations while stopped
    if (!running) {
      if (mode === 'work') setTimeLeft(workMinutes * 60);
      if (mode === 'shortBreak') setTimeLeft(shortBreakMinutes * 60);
      if (mode === 'longBreak') setTimeLeft(longBreakMinutes * 60);
    }
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, mode, running]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 0) {
      // play a short beep
      playBeep();

      if (mode === 'work') {
        cyclesRef.current += 1;
        if (cyclesRef.current % cyclesBeforeLongBreak === 0) {
          switchTo('longBreak');
        } else {
          switchTo('shortBreak');
        }
      } else {
        switchTo('work');
      }
    }
  }, [timeLeft]);

  function switchTo(next: 'work' | 'shortBreak' | 'longBreak') {
    setMode(next);
    setRunning(false);
    if (next === 'work') setTimeLeft(workMinutes * 60);
    if (next === 'shortBreak') setTimeLeft(shortBreakMinutes * 60);
    if (next === 'longBreak') setTimeLeft(longBreakMinutes * 60);
  }

  function toggleStartPause() {
    setRunning((r) => !r);
  }

  function resetTimer() {
    cyclesRef.current = 0;
    setRunning(false);
    switchTo('work');
  }

  function formatTime(totalSeconds: number) {
    if (totalSeconds < 0) totalSeconds = 0;
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const beepCount = 3;
      const interval = 0.45; // seconds between beeps
      const duration = 0.22; // each beep duration

      for (let i = 0; i < beepCount; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 880;
        o.connect(g);
        g.connect(ctx.destination);

        const start = now + i * interval;
        const stop = start + duration;

        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(0.05, start + 0.01);
        g.gain.linearRampToValueAtTime(0.0001, stop - 0.01);

        o.start(start);
        o.stop(stop);
      }

      // close context after all beeps finished
      const total = beepCount * interval + 0.1;
      setTimeout(() => {
        try {
          ctx.close();
        } catch (e) {
          // ignore
        }
      }, total * 1000);
    } catch (e) {
      // ignore
    }
  }

  const totalSecondsForMode = mode === 'work' ? workMinutes * 60 : mode === 'shortBreak' ? shortBreakMinutes * 60 : longBreakMinutes * 60;
  const progress = 1 - timeLeft / Math.max(1, totalSecondsForMode);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => switchTo('work')} className={`px-3 py-2 text-sm rounded-md ${mode === 'work' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            番茄
          </button>
          <button onClick={() => switchTo('shortBreak')} className={`px-3 py-2 text-sm rounded-md ${mode === 'shortBreak' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            短休息
          </button>
          <button onClick={() => switchTo('longBreak')} className={`px-3 py-2 text-sm rounded-md ${mode === 'longBreak' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            长休息
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={toggleStartPause} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? '暂停' : '开始'}
          </button>
          <button onClick={resetTimer} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100">
            <RefreshCw className="w-4 h-4" />重置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <div className="col-span-1 lg:col-span-2 p-6 bg-white border rounded-lg text-center">
          <div className="text-sm text-gray-500">模式</div>
          <div className="text-3xl font-mono mt-2">{mode === 'work' ? '番茄工作' : mode === 'shortBreak' ? '短休息' : '长休息'}</div>
          <div className="text-6xl font-mono mt-4">{formatTime(timeLeft)}</div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-6 overflow-hidden">
            <div style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} className="h-2 bg-blue-600" />
          </div>
        </div>

        <div className="p-6 bg-white border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">设置</div>
            <Settings className="w-4 h-4 text-gray-500" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">工作（分钟）</div>
              <input type="number" min={1} max={180} value={workMinutes} onChange={(e) => setWorkMinutes(Number(e.target.value) || 1)} className="w-20 p-2 border rounded-md text-sm" />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">短休息（分钟）</div>
              <input type="number" min={1} max={60} value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(Number(e.target.value) || 1)} className="w-20 p-2 border rounded-md text-sm" />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">长休息（分钟）</div>
              <input type="number" min={1} max={120} value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(Number(e.target.value) || 1)} className="w-20 p-2 border rounded-md text-sm" />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">循环次数（长休息）</div>
              <input type="number" min={1} max={10} value={cyclesBeforeLongBreak} onChange={(e) => setCyclesBeforeLongBreak(Number(e.target.value) || 1)} className="w-20 p-2 border rounded-md text-sm" />
            </div>

            <div className="text-xs text-gray-500">调整时计时会在停止状态下同步新时长。</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTool;
