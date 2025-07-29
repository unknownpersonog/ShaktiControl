import { Layout, Plus } from 'lucide-react';

interface EmptyBoardsStateProps {
  onCreateBoard: () => void;
}

export default function EmptyBoardsState({ onCreateBoard }: EmptyBoardsStateProps) {
  return (
    <div className="bg-gray-600/10 border border-gray-800 rounded-lg p-12 text-center">
      <div className="w-16 h-16 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
        <Layout className="w-8 h-8 text-gray-500" />
      </div>
      <h3 className="text-white text-lg font-medium mb-2">No boards yet</h3>
      <p className="text-gray-500 mb-6">Create your first whiteboard to get started</p>
      <button
        onClick={onCreateBoard}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Create Your First Board</span>
      </button>
    </div>
  );
}
