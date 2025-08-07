"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import type { Element, Point } from "./WhiteboardPage";

interface CanvasBoardProps {
  elements: Element[];
  users: any[];
  cursors: Record<string, Point>;
  currentTool: string;
  strokeColor: string;
  strokeWidth: number;
  fill: boolean;
  setFill: (v: boolean) => void;
  boardId: string;
  currentUserId: string;
  canEdit: boolean;
}

const CanvasBoard: React.FC<CanvasBoardProps> = ({
  elements,
  users,
  cursors,
  currentTool,
  strokeColor,
  strokeWidth,
  fill,
  setFill,
  boardId,
  currentUserId,
  canEdit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderTime = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Virtual canvas dimensions
  const VIRTUAL_WIDTH = 1920;
  const VIRTUAL_HEIGHT = 1080;

  // Scale factors for coordinate conversion
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [previewElement, setPreviewElement] = useState<Element | null>(null);
  const [eraserPosition, setEraserPosition] = useState<Point | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Performance optimizations
  const isDirty = useRef<boolean>(true);
  const FPS_TARGET = 60;
  const FRAME_TIME = 1000 / FPS_TARGET;

  // Helper function to check if a point is within eraser radius of another point
  const isPointInEraserRange = useCallback(
    (point: Point, eraserPoint: Point, eraserSize: number): boolean => {
      const distance = Math.sqrt(
        Math.pow(point.x - eraserPoint.x, 2) +
          Math.pow(point.y - eraserPoint.y, 2),
      );
      return distance <= eraserSize;
    },
    [],
  );

  // Helper function to check if any point in a stroke intersects with eraser path
  const doesStrokeIntersectEraser = useCallback(
    (
      strokePoints: Point[],
      eraserPoints: Point[],
      eraserSize: number,
    ): boolean => {
      for (const eraserPoint of eraserPoints) {
        for (const strokePoint of strokePoints) {
          if (isPointInEraserRange(strokePoint, eraserPoint, eraserSize)) {
            return true;
          }
        }
      }
      return false;
    },
    [isPointInEraserRange],
  );

  // Function to remove elements that intersect with eraser path
  const eraseElements = useCallback(
    async (eraserPoints: Point[], eraserSize: number) => {
      const elementsToDelete: string[] = [];

      elements.forEach((element) => {
        if (element.id && element.type === "pen") {
          // Check if this pen stroke intersects with the eraser path
          if (
            doesStrokeIntersectEraser(element.points, eraserPoints, eraserSize)
          ) {
            elementsToDelete.push(element.id);
          }
        } else if (
          element.id &&
          (element.type === "rectangle" || element.type === "circle")
        ) {
          // For shapes, check if any eraser point is within the shape bounds
          const [start, end] = element.points;
          const minX = Math.min(start.x, end.x);
          const maxX = Math.max(start.x, end.x);
          const minY = Math.min(start.y, end.y);
          const maxY = Math.max(start.y, end.y);

          for (const eraserPoint of eraserPoints) {
            if (
              eraserPoint.x >= minX - eraserSize &&
              eraserPoint.x <= maxX + eraserSize &&
              eraserPoint.y >= minY - eraserSize &&
              eraserPoint.y <= maxY + eraserSize
            ) {
              elementsToDelete.push(element.id);
              break;
            }
          }
        }
      });

      // Delete intersecting elements from database
      for (const elementId of elementsToDelete) {
        try {
          await deleteDoc(doc(db, "boards", boardId, "elements", elementId));
        } catch (error) {
          console.error("Failed to delete element:", error);
        }
      }
    },
    [elements, doesStrokeIntersectEraser, boardId],
  );

  // Force canvas recreation - critical for Android app switching
  const forceCanvasRecreation = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Force browser to acknowledge size changes
    canvas.style.display = "none";
    container.offsetHeight; // Force reflow
    canvas.style.display = "block";

    // Multiple setup attempts to handle Android quirks
    setTimeout(() => setupCanvas(), 0);
    setTimeout(() => setupCanvas(), 50);
    setTimeout(() => setupCanvas(), 150);
  }, []);

  // Enhanced canvas setup with multiple validation steps
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear any pending setup
    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
    }

    // Force multiple layout recalculations - critical for Android
    container.offsetHeight; // Force reflow
    const rect = container.getBoundingClientRect();
    container.offsetHeight; // Force another reflow

    // Validate that we got reasonable dimensions
    if (rect.width <= 0 || rect.height <= 0) {
      setupTimeoutRef.current = setTimeout(setupCanvas, 100);
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    // Calculate scale factors with validation
    const containerAspect = rect.width / rect.height;
    const virtualAspect = VIRTUAL_WIDTH / VIRTUAL_HEIGHT;

    let displayWidth, displayHeight;
    let newScaleX, newScaleY;
    let newOffsetX = 0,
      newOffsetY = 0;

    if (containerAspect > virtualAspect) {
      displayHeight = rect.height;
      displayWidth = displayHeight * virtualAspect;
      newOffsetX = (rect.width - displayWidth) / 2;
      newScaleX = newScaleY = displayWidth / VIRTUAL_WIDTH;
    } else {
      displayWidth = rect.width;
      displayHeight = displayWidth / virtualAspect;
      newOffsetY = (rect.height - displayHeight) / 2;
      newScaleX = newScaleY = displayWidth / VIRTUAL_WIDTH;
    }

    // Validate scale factors
    if (
      newScaleX <= 0 ||
      newScaleY <= 0 ||
      !isFinite(newScaleX) ||
      !isFinite(newScaleY)
    ) {
      setupTimeoutRef.current = setTimeout(setupCanvas, 100);
      return;
    }

    // Update scale factors
    setScaleX(newScaleX);
    setScaleY(newScaleY);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);

    // Force canvas style reset - critical for Android
    canvas.style.cssText = "";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";
    canvas.style.webkitUserSelect = "none";
    canvas.style.display = "block";

    // Set canvas buffer size with validation
    const bufferWidth = Math.round(rect.width * dpr);
    const bufferHeight = Math.round(rect.height * dpr);

    if (bufferWidth > 0 && bufferHeight > 0) {
      canvas.width = bufferWidth;
      canvas.height = bufferHeight;

      // Scale context for device pixel ratio
      ctx.scale(dpr, dpr);

      // Enable smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      isDirty.current = true;
    }
  }, []);

  // Enhanced coordinate conversion with validation
  const screenToVirtual = useCallback(
    (clientX: number, clientY: number): Point => {
      const container = containerRef.current;
      if (!container) return { x: 0, y: 0 };

      // CRITICAL: Always get fresh bounding rect for each coordinate conversion
      const rect = container.getBoundingClientRect();

      // Validate rect dimensions
      if (rect.width <= 0 || rect.height <= 0) {
        return { x: 0, y: 0 };
      }

      // Convert to container-relative coordinates
      const containerX = clientX - rect.left;
      const containerY = clientY - rect.top;

      // Validate input coordinates are within bounds
      if (
        containerX < 0 ||
        containerY < 0 ||
        containerX > rect.width ||
        containerY > rect.height
      ) {
        // Allow slight overshoot but clamp extreme values
        const clampedX = Math.max(0, Math.min(rect.width, containerX));
        const clampedY = Math.max(0, Math.min(rect.height, containerY));

        const virtualX = (clampedX - offsetX) / scaleX;
        const virtualY = (clampedY - offsetY) / scaleY;

        return {
          x: Math.max(0, Math.min(VIRTUAL_WIDTH, virtualX)),
          y: Math.max(0, Math.min(VIRTUAL_HEIGHT, virtualY)),
        };
      }

      // Convert to virtual coordinates
      const virtualX = (containerX - offsetX) / scaleX;
      const virtualY = (containerY - offsetY) / scaleY;

      // Clamp to virtual canvas bounds
      return {
        x: Math.max(0, Math.min(VIRTUAL_WIDTH, virtualX)),
        y: Math.max(0, Math.min(VIRTUAL_HEIGHT, virtualY)),
      };
    },
    [scaleX, scaleY, offsetX, offsetY],
  );

  // Convert virtual coordinates to screen coordinates for rendering
  const virtualToScreen = useCallback(
    (point: Point): Point => {
      return {
        x: point.x * scaleX + offsetX,
        y: point.y * scaleY + offsetY,
      };
    },
    [scaleX, scaleY, offsetX, offsetY],
  );

  // Drawing functions - no more eraser composite operations
  const drawPath = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: Point[],
      color: string,
      width: number,
    ) => {
      if (points.length === 0) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = width * scaleX;

      ctx.beginPath();

      if (points.length === 1) {
        const screenPoint = virtualToScreen(points[0]);
        ctx.arc(
          screenPoint.x,
          screenPoint.y,
          (width * scaleX) / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        const screenPoints = points.map(virtualToScreen);
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

        for (let i = 1; i < screenPoints.length; i++) {
          ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }

        ctx.stroke();
      }

      ctx.restore();
    },
    [scaleX, virtualToScreen],
  );

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, element: Element) => {
      if (element.points.length < 2) return;

      ctx.save();
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth * scaleX;

      const [virtualStart, virtualEnd] = element.points;
      const start = virtualToScreen(virtualStart);
      const end = virtualToScreen(virtualEnd);

      switch (element.type) {
        case "rectangle":
          const width = end.x - start.x;
          const height = end.y - start.y;

          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);

          if (element.fill) {
            ctx.fillStyle = element.color + "33";
            ctx.fill();
          }
          ctx.stroke();
          break;

        case "circle":
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
          );

          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);

          if (element.fill) {
            ctx.fillStyle = element.color + "33";
            ctx.fill();
          }
          ctx.stroke();
          break;
      }

      ctx.restore();
    },
    [scaleX, virtualToScreen],
  );

  const drawCursor = useCallback(
    (ctx: CanvasRenderingContext2D, userId: string, position: Point) => {
      const user = users.find((u) => u.id === userId);
      if (!user || userId === currentUserId) return;

      const screenPos = virtualToScreen(position);

      ctx.save();

      ctx.shadowColor = user.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = user.color;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.font = `${12 * scaleX}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const textMetrics = ctx.measureText(user.name);
      const textWidth = textMetrics.width;

      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(screenPos.x + 10, screenPos.y - 20, textWidth + 8, 16);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(user.name, screenPos.x + 14, screenPos.y - 8);

      ctx.restore();
    },
    [users, currentUserId, virtualToScreen, scaleX],
  );

  const drawEraserPreview = useCallback(
    (ctx: CanvasRenderingContext2D, position: Point, size: number) => {
      const screenPos = virtualToScreen(position);

      ctx.save();
      ctx.strokeStyle = "#ff6b6b";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size * scaleX, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    [virtualToScreen, scaleX],
  );

  // Simplified render function - no eraser elements to render
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = performance.now();
    if (now - lastRenderTime.current < FRAME_TIME && !isDirty.current) {
      animationFrameRef.current = requestAnimationFrame(render);
      return;
    }

    lastRenderTime.current = now;
    isDirty.current = false;

    // Clear entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fill background
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fill the virtual canvas area
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(
      offsetX,
      offsetY,
      VIRTUAL_WIDTH * scaleX,
      VIRTUAL_HEIGHT * scaleY,
    );

    // Draw border around virtual canvas
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      offsetX,
      offsetY,
      VIRTUAL_WIDTH * scaleX,
      VIRTUAL_HEIGHT * scaleY,
    );

    // Clip to virtual canvas area
    ctx.save();
    ctx.beginPath();
    ctx.rect(offsetX, offsetY, VIRTUAL_WIDTH * scaleX, VIRTUAL_HEIGHT * scaleY);
    ctx.clip();

    // Draw all stored elements
    elements.forEach((element) => {
      if (element.type === "pen") {
        drawPath(ctx, element.points, element.color, element.strokeWidth);
      } else {
        drawShape(ctx, element);
      }
    });

    // Draw preview element (but not eraser preview - that's handled separately)
    if (previewElement && previewElement.type !== "eraser") {
      if (previewElement.type === "pen") {
        drawPath(
          ctx,
          previewElement.points,
          previewElement.color,
          previewElement.strokeWidth,
        );
      } else {
        drawShape(ctx, previewElement);
      }
    }

    ctx.restore();

    // Draw cursors and eraser preview
    Object.entries(cursors).forEach(([userId, position]) => {
      drawCursor(ctx, userId, position);
    });

    if (eraserPosition && currentTool === "eraser") {
      drawEraserPreview(ctx, eraserPosition, strokeWidth);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    elements,
    previewElement,
    cursors,
    eraserPosition,
    currentTool,
    strokeWidth,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    drawPath,
    drawShape,
    drawCursor,
    drawEraserPreview,
  ]);

  // Database commit function
  const commitElement = useCallback(
    async (elementData: Partial<Element>) => {
      try {
        await addDoc(collection(db, "boards", boardId, "elements"), {
          ...elementData,
          timestamp: Date.now(),
          userId: currentUserId,
        });
      } catch (error) {
        console.error("Failed to commit element:", error);
      }
    },
    [boardId, currentUserId],
  );

  // Event handlers
  const handleStart = useCallback(
    (point: Point) => {
      if (!canEdit) return;

      setIsDrawing(true);
      setStartPoint(point);

      if (currentTool === "pen") {
        setCurrentStroke([point]);
        setPreviewElement({
          type: currentTool,
          points: [point],
          color: strokeColor,
          strokeWidth,
          fill,
          timestamp: Date.now(),
          userId: currentUserId,
        });
      } else if (currentTool === "eraser") {
        setCurrentStroke([point]);
        // Start erasing immediately as user draws
        eraseElements([point], strokeWidth);
      } else if (currentTool === "rectangle" || currentTool === "circle") {
        setPreviewElement({
          type: currentTool,
          points: [point, point],
          color: strokeColor,
          strokeWidth,
          fill,
          timestamp: Date.now(),
          userId: currentUserId,
        });
      }

      if (currentTool === "eraser") {
        setEraserPosition(point);
      }

      isDirty.current = true;
    },
    [
      canEdit,
      currentTool,
      strokeColor,
      strokeWidth,
      fill,
      currentUserId,
      eraseElements,
    ],
  );

  const handleMove = useCallback(
    (point: Point) => {
      if (currentTool === "eraser" && !isDrawing) {
        setEraserPosition(point);
        isDirty.current = true;
        return;
      }

      if (!isDrawing) return;

      if (currentTool === "pen") {
        const newStroke = [...currentStroke, point];
        setCurrentStroke(newStroke);

        setPreviewElement({
          type: currentTool,
          points: newStroke,
          color: strokeColor,
          strokeWidth,
          fill,
          timestamp: Date.now(),
          userId: currentUserId,
        });
      } else if (currentTool === "eraser") {
        const newStroke = [...currentStroke, point];
        setCurrentStroke(newStroke);
        // Continue erasing as user drags
        eraseElements(newStroke, strokeWidth);
      } else if (
        (currentTool === "rectangle" || currentTool === "circle") &&
        startPoint
      ) {
        setPreviewElement({
          type: currentTool,
          points: [startPoint, point],
          color: strokeColor,
          strokeWidth,
          fill,
          timestamp: Date.now(),
          userId: currentUserId,
        });
      }

      if (currentTool === "eraser") {
        setEraserPosition(point);
      }

      isDirty.current = true;
    },
    [
      isDrawing,
      currentStroke,
      currentTool,
      startPoint,
      strokeColor,
      strokeWidth,
      fill,
      currentUserId,
      eraseElements,
    ],
  );

  // Modified handleEnd - no eraser elements stored
  const handleEnd = useCallback(
    (endPoint?: Point) => {
      if (!isDrawing) return;

      setIsDrawing(false);
      setPreviewElement(null);
      setEraserPosition(null);

      if (currentTool === "pen") {
        if (currentStroke.length > 0) {
          commitElement({
            type: currentTool,
            points: currentStroke,
            color: strokeColor,
            strokeWidth,
            fill,
          });
        }
        setCurrentStroke([]);
      } else if (currentTool === "eraser") {
        // Eraser just clears stroke data - erasing already happened during movement
        setCurrentStroke([]);
      } else if (
        (currentTool === "rectangle" || currentTool === "circle") &&
        startPoint &&
        endPoint
      ) {
        commitElement({
          type: currentTool,
          points: [startPoint, endPoint],
          color: strokeColor,
          strokeWidth,
          fill,
        });
      }

      setStartPoint(null);
      isDirty.current = true;
    },
    [
      isDrawing,
      currentStroke,
      currentTool,
      startPoint,
      strokeColor,
      strokeWidth,
      fill,
      commitElement,
    ],
  );

  // Enhanced event handlers with coordinate validation
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(screenToVirtual(e.clientX, e.clientY));
    },
    [handleStart, screenToVirtual],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(screenToVirtual(e.clientX, e.clientY));
    },
    [handleMove, screenToVirtual],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const endPoint = screenToVirtual(e.clientX, e.clientY);
      handleEnd(endPoint);
    },
    [handleEnd, screenToVirtual],
  );

  // Enhanced touch handlers with coordinate recalculation
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        setTimeout(() => setupCanvas(), 0);
        handleStart(screenToVirtual(touch.clientX, touch.clientY));
      }
    },
    [handleStart, screenToVirtual, setupCanvas],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleMove(screenToVirtual(touch.clientX, touch.clientY));
      }
    },
    [handleMove, screenToVirtual],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const endPoint = screenToVirtual(touch.clientX, touch.clientY);
        handleEnd(endPoint);
      } else {
        handleEnd();
      }
    },
    [handleEnd, screenToVirtual],
  );

  const handleMouseLeave = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Enhanced effects with Android-specific handling
  useEffect(() => {
    setupCanvas();

    const handleResize = () => {
      forceCanvasRecreation();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(forceCanvasRecreation, 100);
        setTimeout(forceCanvasRecreation, 300);
        setTimeout(forceCanvasRecreation, 600);
      }
    };

    const handleFocus = () => {
      forceCanvasRecreation();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setTimeout(forceCanvasRecreation, 200);
      }
    };

    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        forceCanvasRecreation();
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
      }
    };
  }, [setupCanvas, forceCanvasRecreation]);

  useEffect(() => {
    isDirty.current = true;
  }, [elements, cursors, users]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // Export functionality
  useEffect(() => {
    const handleExport = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = VIRTUAL_WIDTH;
      exportCanvas.height = VIRTUAL_HEIGHT;
      const exportCtx = exportCanvas.getContext("2d")!;

      exportCtx.fillStyle = "#ffffff";
      exportCtx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      elements.forEach((element) => {
        if (element.type === "pen") {
          if (element.points.length > 0) {
            exportCtx.strokeStyle = element.color;
            exportCtx.lineWidth = element.strokeWidth;
            exportCtx.lineCap = "round";
            exportCtx.lineJoin = "round";

            exportCtx.beginPath();
            exportCtx.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach((point) => {
              exportCtx.lineTo(point.x, point.y);
            });
            exportCtx.stroke();
          }
        } else if (element.type === "rectangle" && element.points.length >= 2) {
          const [start, end] = element.points;
          exportCtx.strokeStyle = element.color;
          exportCtx.lineWidth = element.strokeWidth;
          exportCtx.strokeRect(
            start.x,
            start.y,
            end.x - start.x,
            end.y - start.y,
          );

          if (element.fill) {
            exportCtx.fillStyle = element.color + "33";
            exportCtx.fillRect(
              start.x,
              start.y,
              end.x - start.x,
              end.y - start.y,
            );
          }
        } else if (element.type === "circle" && element.points.length >= 2) {
          const [start, end] = element.points;
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2),
          );

          exportCtx.strokeStyle = element.color;
          exportCtx.lineWidth = element.strokeWidth;
          exportCtx.beginPath();
          exportCtx.arc(start.x, start.y, radius, 0, Math.PI * 2);
          exportCtx.stroke();

          if (element.fill) {
            exportCtx.fillStyle = element.color + "33";
            exportCtx.fill();
          }
        }
      });

      const link = document.createElement("a");
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL("image/png", 1.0);
      link.click();
    };

    window.addEventListener("export-board", handleExport);
    return () => window.removeEventListener("export-board", handleExport);
  }, [elements]);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-800"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 block ${
          canEdit
            ? currentTool === "eraser"
              ? "cursor-none"
              : "cursor-crosshair"
            : "cursor-not-allowed"
        } touch-none select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: "none",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};

export default CanvasBoard;
