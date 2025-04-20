import React, { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  onCanvasChange: (dataUrl: string) => void;
}

const styles = {
  canvas: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    zIndex: 1000,
    top: 0,
    left: 0,
    touchAction: 'none' as const,
  },
};

const DrawingCanvas: React.FC<DrawingCanvasProps> = (props: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    // Get the CSS size of the canvas
    const rect = canvas.getBoundingClientRect();

    // Set the "real" canvas size to the CSS size * dpr
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the drawing context so that everything works in CSS pixels
    ctx.scale(dpr, dpr);

    // Set drawing settings
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  const getPointerPos = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "pen") return;
    e.preventDefault();

    e.currentTarget.setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);
    lastXRef.current = pos.x;
    lastYRef.current = pos.y;
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pressure === 0) return;
    if (e.pointerType !== "pen") return;
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPointerPos(e);

    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(pos.x, pos.y);

    ctx.lineWidth = 2 + e.pressure * 6;
    ctx.stroke();

    lastXRef.current = pos.x;
    lastYRef.current = pos.y;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button < 0) return;
    if (e.pointerType !== "pen") return;
    e.preventDefault();
    setIsDrawing(false);
    if (canvasRef.current) {
      props.onCanvasChange(canvasRef.current.toDataURL("image/png", 1));
    }
  };

  return (
    <canvas
      style={styles.canvas}
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
    />
  );
};

export default DrawingCanvas;
