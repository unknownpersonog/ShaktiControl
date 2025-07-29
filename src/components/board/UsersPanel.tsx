'use client';
import React, { useState } from 'react';
import type { Board } from './WhiteboardPage';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface UsersPanelProps {
  users: any[];
  board: Board | null;
  setBoard: (b: Board) => void;
  isAdmin: boolean;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ users, board, setBoard, isAdmin }) => {
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleEditor = async (userId: string) => {
    if (!board || !board.id) return;
    setUpdating(userId);
    const editors = board.permissions?.editors ?? [];
    let newEditors = editors.includes(userId)
      ? editors.filter(u => u !== userId)
      : [...editors, userId];
    await updateDoc(doc(db, 'boards', board.id), {
      'permissions.editors': newEditors,
    });
    setBoard({ ...board, permissions: { ...board.permissions, editors: newEditors } });
    setUpdating(null);
  };

  return (
    <div className="w-64 bg-black border-l border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold">Online Users ({users.length})</h3>
      </div>
      <div className="p-2 space-y-3 max-h-96 overflow-y-auto">
        {users.map(user => (
          <div key={user.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800">
            <div className="w-3 h-3 rounded-full border border-gray-600"
              style={{ backgroundColor: user.color }} />
            <div className="flex-1 text-sm">
              {user.name}
              <div className="text-xs text-gray-400">
                {user.id === board?.adminId ? 'Admin' : user.id.startsWith('anonymous_') ? 'Anonymous' : 'Member'}
              </div>
            </div>
            {isAdmin && user.id !== board?.adminId && (
              <button
                className={`px-2 py-1 rounded text-xs
                  ${board?.permissions?.editors?.includes(user.id) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}
                  ${updating === user.id ? 'opacity-50' : ''}`}
                disabled={updating === user.id}
                onClick={() => toggleEditor(user.id)}
              >
                {board?.permissions?.editors?.includes(user.id) ? 'Can Edit' : 'View Only'}
              </button>
            )}
            <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPanel;
