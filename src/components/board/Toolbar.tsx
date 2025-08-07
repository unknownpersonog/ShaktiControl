"use client";
import React from "react";
import { Pen, Eraser, Square, Circle, Home } from "lucide-react";

const tools = [
  { tool: "pen", icon: Pen },
  { tool: "eraser", icon: Eraser },
  { tool: "rectangle", icon: Square },
  { tool: "circle", icon: Circle },
];

interface ToolbarProps {
  currentTool: string;
  setCurrentTool: (tool: string) => void;
  strokeColor: string;
  setStrokeColor: (c: string) => void;
  strokeWidth: number;
  setStrokeWidth: (n: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setCurrentTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
}) => (
  <div className="w-16 bg-black border-r border-gray-800 flex flex-col items-center py-4 space-y-2">
    {/* Tool Buttons */}
    <div className="flex flex-col space-y-1">
      {tools.map(({ tool, icon: Icon }) => (
        <button
          key={tool}
          title={tool.charAt(0).toUpperCase() + tool.slice(1)}
          onClick={() => setCurrentTool(tool)}
          className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center relative group
            ${
              currentTool === tool
                ? "bg-white text-black shadow-lg"
                : "hover:bg-gray-800 text-gray-400 hover:text-white"
            }`}
        >
          <Icon className="w-5 h-5" />
          {currentTool === tool && (
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
          )}
        </button>
      ))}
    </div>

    {/* Divider */}
    <div className="w-8 h-px bg-gray-700 my-4"></div>

    {/* Color Picker */}
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-700 hover:border-gray-600 transition-colors"
          title="Choose Color"
        />
        <div className="absolute inset-0 rounded-lg bg-transparent hover:bg-white hover:bg-opacity-10 transition-all pointer-events-none"></div>
      </div>

      {/* Stroke Width Indicator */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-gray-500 font-medium">{strokeWidth}</div>
        <div
          className="bg-white rounded-full transition-all"
          style={{
            width: `${Math.max(4, strokeWidth)}px`,
            height: `${Math.max(4, strokeWidth)}px`,
          }}
        ></div>
      </div>

      {/* Stroke Width Slider */}
      <div className="relative">
        <input
          type="range"
          min={1}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-2 h-20 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          style={{
            writingMode: "vertical-lr" as const,
            WebkitAppearance: "slider-vertical",
          }}
          title={`Stroke Width: ${strokeWidth}px`}
        />
      </div>
    </div>

    {/* Spacer to push home button to bottom */}
    <div className="flex-1"></div>

    {/* Home Button - Distinguished from other tools */}
    <div className="mt-auto pt-4 border-t border-gray-800">
      <button
        onClick={() => (window.location.href = "/")}
        title="Home"
        className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default Toolbar;
