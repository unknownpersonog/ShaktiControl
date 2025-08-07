"use client";
import { useState } from "react";
import { Layout, Edit3, Trash2, Calendar, Hash } from "lucide-react";
import { Board } from "@/components/board/WhiteboardPage";

interface BoardCardProps {
  board: Board;
  onDelete: (boardId: string) => void;
  onRename: (boardId: string, newName: string) => void;
  onClick: () => void;
}

export default function BoardCard({
  board,
  onDelete,
  onRename,
  onClick,
}: BoardCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(board.name);

  const handleRename = () => {
    if (name.trim() && name !== board.name) {
      onRename(board.id, name.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-600/20 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-200 cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Board Icon */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>

          {isEditing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              className="bg-transparent border-b border-blue-500 text-white text-lg font-medium outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className="text-white text-lg font-medium group-hover:text-blue-400 transition-colors">
              {board.name}
            </h3>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            title="Rename board"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(board.id);
            }}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete board"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Board Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Created</span>
          </div>
          <span className="text-gray-400 text-sm">
            {board.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Board ID</span>
          </div>
          <span className="text-gray-400 text-sm font-mono">
            {board.id.slice(0, 8)}...
          </span>
        </div>
      </div>

      {/* Open Button */}
      <button
        onClick={onClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <Layout className="w-4 h-4" />
        <span>Open Board</span>
      </button>
    </div>
  );
}
