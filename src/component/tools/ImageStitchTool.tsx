"use client";
import { useRef, useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSwappingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SpliceMode = "nine" | "row" | "col";

// 高清配置：格子 600px，足够大，不压缩
const CONFIG = {
  gridSize: "w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40",
  itemSize: 600, // 关键：每格 1200px，高清
  gap: 20,
  borderRadius: 16,
  borderWidth: 4,
  watermarkText: "",
};

const GRID_IDS = Array.from({ length: 9 }, (_, i) => `g${i}`);

function SortableGridCell({
  id,
  image,
  onDelete,
}: {
  id: string;
  image: string | null;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative ${CONFIG.gridSize} rounded-md overflow-hidden cursor-move border border-white bg-gray-50 ${isDragging ? "opacity-50" : ""}`}
      {...attributes}
      {...listeners}
    >
      {image ? (
        <>
          <img src={image} className="w-full h-full object-cover" alt="" />
          <button
            onClick={onDelete}
            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center"
          >
            ×
          </button>
        </>
      ) : (
        <div className="text-gray-400 text-sm flex items-center justify-center h-full">空位</div>
      )}
    </div>
  );
}

export function ImageStitchTool() {
  const [grid, setGrid] = useState<(string | null)[]>(Array(9).fill(null));
  const [mode, setMode] = useState<SpliceMode>("nine");
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const oldIndex = GRID_IDS.indexOf(active.id as string);
    const newIndex = GRID_IDS.indexOf(over.id as string);
    if (oldIndex === newIndex) return;

    const newGrid = [...grid];
    [newGrid[oldIndex], newGrid[newIndex]] = [newGrid[newIndex], newGrid[oldIndex]];
    setGrid(newGrid);
    setActiveId(null);
  };

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newGrid = [...grid];
    let ptr = 0;

    Array.from(files).forEach((file) => {
      while (ptr < 9 && newGrid[ptr] !== null) ptr++;
      if (ptr >= 9) return;
      newGrid[ptr] = URL.createObjectURL(file);
      ptr++;
    });
    setGrid(newGrid);
  };

  const handleClear = () => {
    grid.forEach((u) => u && URL.revokeObjectURL(u));
    setGrid(Array(9).fill(null));
    setPreviewUrl("");
  };

  const delImg = (idx: number) => {
    const newGrid = [...grid];
    newGrid[idx] && URL.revokeObjectURL(newGrid[idx]!);
    newGrid[idx] = null;
    setGrid(newGrid);
  };

  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // 核心：高清不压缩 + DPR 适配 Retina
  const generateSplice = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imgList = grid.filter(Boolean) as string[];
    if (imgList.length === 0) return;

    const { itemSize, gap, borderRadius, borderWidth } = CONFIG;
    const innerSize = itemSize - borderWidth * 2;

    // 1. 关键：DPR 高清适配（Retina 2x/3x）
    const dpr = window.devicePixelRatio || 1;
    let totalW = 0;
    let totalH = 0;

    if (mode === "nine") {
      totalW = itemSize * 3 + gap * 4;
      totalH = itemSize * 3 + gap * 4;
    } else if (mode === "row") {
      totalW = imgList.length * itemSize + gap * (imgList.length + 1);
      totalH = itemSize + gap * 2;
    } else {
      totalW = itemSize + gap * 2;
      totalH = imgList.length * itemSize + gap * (imgList.length + 1);
    }

    // 2. 按 DPR 放大画布，CSS 尺寸不变
    canvas.width = totalW * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = totalW + "px";
    canvas.style.height = totalH + "px";
    ctx.scale(dpr, dpr);

    // 3. 高清绘制设置
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, totalW, totalH);

    const loadAndDraw = (src: string, idx: number) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => {
          let bx = 0, by = 0;
          if (mode === "nine") {
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            bx = gap + col * (itemSize + gap);
            by = gap + row * (itemSize + gap);
          } else if (mode === "row") {
            bx = gap + idx * (itemSize + gap);
            by = gap;
          } else {
            bx = gap;
            by = gap + idx * (itemSize + gap);
          }

          // 白色圆角背景
          ctx.fillStyle = "#fff";
          drawRoundRect(ctx, bx, by, itemSize, itemSize, borderRadius);
          ctx.fill();

          // 4. 关键：用原图尺寸绘制，不压缩
          ctx.save();
          drawRoundRect(ctx, bx + borderWidth, by + borderWidth, innerSize, innerSize, borderRadius - 2);
          ctx.clip();
          ctx.drawImage(
            img,
            0, 0, img.naturalWidth, img.naturalHeight, // 原图尺寸
            bx + borderWidth, by + borderWidth, innerSize, innerSize // 目标尺寸
          );
          ctx.restore();
          resolve();
        };
      });
    };

    // 等待所有图片绘制完成再加水印
    const drawAll = async () => {
      if (mode === "nine") {
        for (let i = 0; i < grid.length; i++) {
          if (grid[i]) await loadAndDraw(grid[i]!, i);
        }
      } else {
        for (let i = 0; i < imgList.length; i++) {
          await loadAndDraw(imgList[i], i);
        }
      }

      // 水印
      ctx.font = "20px sans-serif";
      ctx.fillStyle = "rgba(100,100,100,0.3)";
      ctx.textAlign = "right";
      //ctx.fillText(CONFIG.watermarkText, totalW - 20, totalH - 20);

      // 5. 关键：导出 PNG 无损
      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    drawAll();
  };

  const handlePreview = () => {
    setPreviewUrl("");
    setTimeout(generateSplice, 50);
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement("a");
    a.download = `${mode === "nine" ? "九宫格高清" : mode === "row" ? "横版长图高清" : "竖版长图高清"}.png`;
    a.href = previewUrl;
    a.click();
  };

  useEffect(() => {
    if (grid.some(Boolean)) handlePreview();
  }, [mode, grid]);

  const activeImage = activeId ? grid[GRID_IDS.indexOf(activeId)] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5"> 
      {/* 按钮栏放大 */}
      <div className="flex flex-wrap gap-3 justify-center items-center bg-white p-4 rounded-xl shadow-sm">
        <label className="px-5 py-2.5 bg-green-600 text-white rounded-lg cursor-pointer text-base font-medium">
          选择图片 ({grid.filter(Boolean).length}/9)
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleSelectFile} />
        </label>

        <button onClick={handleClear} className="px-5 py-2.5 bg-gray-600 text-white rounded-lg text-base font-medium">清空</button>
        <button onClick={handlePreview} className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg text-base font-medium">生成预览</button>
        <button onClick={handleDownload} disabled={!previewUrl} className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-base font-medium disabled:opacity-50">下载高清图</button>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as SpliceMode)}
          className="px-4 py-2.5 border rounded-lg text-base bg-green-500 outline-none"
        >
          <option value="nine">九宫格拼接</option>
          <option value="row">横版长图</option>
          <option value="col">竖版长图</option>
        </select>
      </div>

      {/* 宫格放大，手机/PC 都大 */}
      <div className="flex justify-center py-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={GRID_IDS} strategy={rectSwappingStrategy}>
            <div className="grid grid-cols-3 gap-3">
              {GRID_IDS.map((id, i) => (
                <SortableGridCell
                  key={id}
                  id={id}
                  image={grid[i]}
                  onDelete={() => delImg(i)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeImage ? (
              <div className={`${CONFIG.gridSize} rounded-md shadow-lg`}>
                <img src={activeImage} className="w-full h-full object-cover" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 预览区放大，高清显示 */}
      {previewUrl && (
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-base text-gray-500 mb-3">拼接预览</p>
          <img src={previewUrl} className="max-h-[500px] w-auto object-contain mx-auto rounded-lg shadow-md" alt="高清预览" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}