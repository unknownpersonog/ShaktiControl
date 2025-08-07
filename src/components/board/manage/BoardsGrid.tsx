import { Board } from "@/components/board/WhiteboardPage";
import BoardCard from "./BoardCard";
import EmptyBoardsState from "./EmptyBoardsState";

interface BoardsGridProps {
  boards: Board[];
  onDeleteBoard: (boardId: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onOpenBoard: (boardId: string) => void;
  onCreateBoard: () => void;
}

export default function BoardsGrid({
  boards,
  onDeleteBoard,
  onRenameBoard,
  onOpenBoard,
  onCreateBoard,
}: BoardsGridProps) {
  if (boards.length === 0) {
    return <EmptyBoardsState onCreateBoard={onCreateBoard} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          onDelete={onDeleteBoard}
          onRename={onRenameBoard}
          onClick={() => onOpenBoard(board.id)}
        />
      ))}
    </div>
  );
}
