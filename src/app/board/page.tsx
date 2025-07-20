'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Pen, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Eraser, 
  Undo, 
  Redo, 
  Save, 
  Share2, 
  Users, 
  Settings, 
  Trash2,
  MousePointer,
  Minus,
  Download,
  Upload,
  Palette,
  Eye,
  EyeOff
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { db } from '@/lib/firebase'; // Adjust the import based on your Firebase setup
// Constants - you'll need to assign these values
const DOMAIN_URL = 'https://shiny-space-xylophone-4p54wr5r6gqfjrrq-3000.app.github.dev/'; // Your domain for shareable links

// In your actual implementation, these would come from NextAuth

// Types
interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: 'pen' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'text' | 'eraser';
  points: Point[];
  color: string;
  strokeWidth: number;
  fill?: boolean;
  text?: string;
  fontSize?: number;
  timestamp: number;
  userId: string;
  userName: string;
}

interface Board {
  id: string;
  name: string;
  adminId: string;
  adminName: string;
  isPublic: boolean;
  allowedUsers: string[];
  readOnlyUsers: string[];
  createdAt: any;
  updatedAt: any;
  shareToken?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  cursor?: Point;
  isOnline: boolean;
  color: string;
}

type Tool = 'pen' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'text' | 'eraser' | 'select';

const LiveBlackboard: React.FC = () => {
  // Canvas and drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fill, setFill] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const { data: session, status } = useSession();

  const currentUserId = session?.user?.email || 'test';
  const currentUserName = session?.user?.name || null;
  const currentUserEmail = session?.user?.email || null;
  const currentUserImage = session?.user?.image || null;
  const isAuthenticated = true;
  // Board and user state
  const [boardId, setBoardId] = useState<string>('');
  const [board, setBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI state
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [cursors, setCursors] = useState<{[userId: string]: Point}>({});
  
  // Drawing state
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewElement, setPreviewElement] = useState<DrawingElement | null>(null);

  // Initialize board or join existing
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      console.error('User not authenticated');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const shareToken = urlParams.get('share');
    const existingBoardId = urlParams.get('board');
    
    if (shareToken) {
      joinBoardByToken(shareToken);
    } else if (existingBoardId) {
      setBoardId(existingBoardId);
      loadBoard(existingBoardId);
    } else {
      createNewBoard();
    }
  }, [isAuthenticated, currentUserId]);

  // Real-time listeners
  useEffect(() => {
    if (!boardId || !db) return;

    const elementsUnsubscribe = onSnapshot(
      collection(db, 'boards', boardId, 'elements'),
      (snapshot) => {
        const newElements: DrawingElement[] = [];
        snapshot.forEach((doc) => {
          newElements.push({ id: doc.id, ...doc.data() } as DrawingElement);
        });
        setElements(newElements.sort((a, b) => a.timestamp - b.timestamp));
      }
    );

    const usersUnsubscribe = onSnapshot(
      collection(db, 'boards', boardId, 'users'),
      (snapshot) => {
        const newUsers: User[] = [];
        snapshot.forEach((doc) => {
          newUsers.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(newUsers);
      }
    );

    const cursorsUnsubscribe = onSnapshot(
      collection(db, 'boards', boardId, 'cursors'),
      (snapshot) => {
        const newCursors: {[userId: string]: Point} = {};
        snapshot.forEach((doc) => {
          if (doc.id !== currentUserId) {
            newCursors[doc.id] = doc.data() as Point;
          }
        });
        setCursors(newCursors);
      }
    );

    return () => {
      elementsUnsubscribe();
      usersUnsubscribe();
      cursorsUnsubscribe();
    };
  }, [boardId]);

  // Redraw canvas when elements change
  useEffect(() => {
    redrawCanvas();
  }, [elements, previewElement]);

  const createNewBoard = async () => {
    if (!db || !currentUserId) return;
    
    const newBoard: Omit<Board, 'id'> = {
      name: boardName || 'New Board',
      adminId: currentUserId,
      adminName: currentUserName || currentUserEmail || 'Admin',
      isPublic: false,
      allowedUsers: [currentUserId],
      readOnlyUsers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      shareToken: generateShareToken()
    };

    try {
      const docRef = await addDoc(collection(db, 'boards'), newBoard);
      setBoardId(docRef.id);
      setBoard({ ...newBoard, id: docRef.id } as Board);
      await joinBoard(docRef.id);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const loadBoard = async (id: string) => {
    if (!db) return;
    
    try {
      const unsubscribe = onSnapshot(doc(db, 'boards', id), (doc) => {
        if (doc.exists()) {
          setBoard({ id: doc.id, ...doc.data() } as Board);
        }
      });
      
      await joinBoard(id);
      return unsubscribe;
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  const joinBoard = async (id: string) => {
    if (!db || !currentUserId) return;
    
    const userColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    
    await setDoc(doc(db, 'boards', id, 'users', currentUserId), {
      id: currentUserId,
      name: currentUserName || currentUserEmail || 'Anonymous',
      email: currentUserEmail,
      image: currentUserImage,
      isOnline: true,
      color: userColor,
      joinedAt: serverTimestamp()
    });
  };

  const joinBoardByToken = async (token: string) => {
    if (!db) return;
    
    try {
      const q = query(collection(db, 'boards'), where('shareToken', '==', token));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const boardDoc = snapshot.docs[0];
        setBoardId(boardDoc.id);
        await loadBoard(boardDoc.id);
      }
    } catch (error) {
      console.error('Error joining board by token:', error);
    }
  };

  const generateShareToken = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const getShareableLink = (): string => {
    return `${DOMAIN_URL}?share=${board?.shareToken}`;
  };

  const addElement = async (element: Omit<DrawingElement, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    if (!db || !boardId || !currentUserId) return;
    
    const newElement: Omit<DrawingElement, 'id'> = {
      ...element,
      timestamp: Date.now(),
      userId: currentUserId,
      userName: currentUserName || currentUserEmail || 'Anonymous'
    };

    try {
      await addDoc(collection(db, 'boards', boardId, 'elements'), newElement);
    } catch (error) {
      console.error('Error adding element:', error);
    }
  };

  const updateCursor = async (point: Point) => {
    if (!db || !boardId || !currentUserId) return;
    
    try {
      await setDoc(doc(db, 'boards', boardId, 'cursors', currentUserId), point);
    } catch (error) {
      console.error('Error updating cursor:', error);
    }
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setStartPoint(point);
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPath([point]);
    } else if (currentTool === 'text') {
      setTextPosition(point);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    updateCursor(point);
    
    if (!isDrawing || !startPoint) return;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPath(prev => [...prev, point]);
      setPreviewElement({
        id: 'preview',
        type: currentTool,
        points: [...currentPath, point],
        color: currentTool === 'eraser' ? '#FFFFFF' : strokeColor,
        strokeWidth: currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth,
        timestamp: Date.now(),
        userId: currentUserId || '',
        userName: currentUserName || currentUserEmail || 'Anonymous'
      });
    } else {
      // Shape preview
      let points: Point[] = [];
      switch (currentTool) {
        case 'line':
          points = [startPoint, point];
          break;
        case 'rectangle':
          points = [
            startPoint,
            { x: point.x, y: startPoint.y },
            point,
            { x: startPoint.x, y: point.y }
          ];
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(point.x - startPoint.x, 2) + Math.pow(point.y - startPoint.y, 2)
          );
          points = generateCirclePoints(startPoint, radius);
          break;
        case 'triangle':
          points = [
            { x: startPoint.x, y: startPoint.y },
            { x: point.x, y: point.y },
            { x: startPoint.x - (point.x - startPoint.x), y: point.y }
          ];
          break;
      }
      
      setPreviewElement({
        id: 'preview',
        type: currentTool as any,
        points,
        color: strokeColor,
        strokeWidth,
        fill,
        timestamp: Date.now(),
        userId: currentUserId || '',
        userName: currentUserName || currentUserEmail || 'Anonymous'
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewElement) return;
    
    setIsDrawing(false);
    
    if (currentTool !== 'text') {
      addElement({
        type: previewElement.type,
        points: previewElement.points,
        color: previewElement.color,
        strokeWidth: previewElement.strokeWidth,
        fill: previewElement.fill
      });
    }
    
    setPreviewElement(null);
    setCurrentPath([]);
    setStartPoint(null);
  };

  const handleTextSubmit = () => {
    if (!textInput || !textPosition) return;
    
    addElement({
      type: 'text',
      points: [textPosition],
      color: strokeColor,
      strokeWidth: 1,
      text: textInput,
      fontSize
    });
    
    setTextInput('');
    setTextPosition(null);
  };

  const generateCirclePoints = (center: Point, radius: number): Point[] => {
    const points: Point[] = [];
    const segments = 32;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      points.push({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      });
    }
    
    return points;
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all elements
    [...elements, ...(previewElement ? [previewElement] : [])].forEach(element => {
      drawElement(ctx, element);
    });
    
    // Draw cursors
    Object.entries(cursors).forEach(([userId, cursor]) => {
      const user = users.find(u => u.id === userId);
      if (user) {
        drawCursor(ctx, cursor, user.color, user.name);
      }
    });
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.save();
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (element.fill) {
      ctx.fillStyle = element.color;
    }
    
    switch (element.type) {
      case 'pen':
      case 'eraser':
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        break;
        
      case 'line':
        if (element.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          ctx.lineTo(element.points[1].x, element.points[1].y);
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (element.points.length >= 4) {
          ctx.beginPath();
          ctx.rect(
            element.points[0].x,
            element.points[0].y,
            element.points[2].x - element.points[0].x,
            element.points[2].y - element.points[0].y
          );
          if (element.fill) ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (element.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          if (element.fill) ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'triangle':
        if (element.points.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.closePath();
          if (element.fill) ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'text':
        if (element.text && element.points.length > 0) {
          ctx.font = `${element.fontSize || 16}px Arial`;
          ctx.fillStyle = element.color;
          ctx.fillText(element.text, element.points[0].x, element.points[0].y);
        }
        break;
    }
    
    ctx.restore();
  };

  const drawCursor = (ctx: CanvasRenderingContext2D, point: Point, color: string, name: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Draw cursor pointer
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + 12, point.y + 4);
    ctx.lineTo(point.x + 8, point.y + 8);
    ctx.lineTo(point.x + 4, point.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw name label
    ctx.fillStyle = color;
    ctx.fillRect(point.x + 15, point.y - 8, ctx.measureText(name).width + 8, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(name, point.x + 19, point.y + 3);
    
    ctx.restore();
  };

  const clearBoard = async () => {
    if (!db || !boardId) return;
    
    try {
      const elementsSnapshot = await getDocs(collection(db, 'boards', boardId, 'elements'));
      const deletePromises = elementsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing board:', error);
    }
  };

  const exportBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${board?.name || 'board'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const updateBoardSettings = async (updates: Partial<Board>) => {
    if (!db || !boardId || !board) return;
    
    try {
      await updateDoc(doc(db, 'boards', boardId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating board settings:', error);
    }
  };

  const isAdmin = board?.adminId === currentUserId;
  const hasWriteAccess = isAdmin || (board?.allowedUsers.includes(currentUserId || ''));
  const isReadOnly = board?.readOnlyUsers.includes(currentUserId || '');

  // Show loading or login prompt if not authenticated
  if (!isAuthenticated || !currentUserId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the blackboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-black shadow-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{board?.name || 'Live Blackboard'}</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{users.length} online</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUserPanel(!showUserPanel)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowShareDialog(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Share2 className="w-5 h-5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Toolbar */}
        <div className="w-16 bg-black shadow-sm border-r flex flex-col items-center py-4 space-y-2">
          {[
            { tool: 'select' as Tool, icon: MousePointer },
            { tool: 'pen' as Tool, icon: Pen },
            { tool: 'line' as Tool, icon: Minus },
            { tool: 'rectangle' as Tool, icon: Square },
            { tool: 'circle' as Tool, icon: Circle },
            { tool: 'triangle' as Tool, icon: Triangle },
            { tool: 'text' as Tool, icon: Type },
            { tool: 'eraser' as Tool, icon: Eraser },
          ].map(({ tool, icon: Icon }) => (
            <button
              key={tool}
              onClick={() => setCurrentTool(tool)}
              disabled={!hasWriteAccess || isReadOnly}
              className={`p-2 rounded-lg transition-colors ${
                currentTool === tool
                  ? 'bg-blue-100 text-blue-600'
                  : 'hover:bg-gray-100'
              } ${(!hasWriteAccess || isReadOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
          
          <div className="border-t pt-2 space-y-2">
            <button
              onClick={exportBoard}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Download className="w-5 h-5" />
            </button>
            {isAdmin && (
              <button
                onClick={clearBoard}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          {/* Canvas Controls */}
          <div className="absolute top-4 left-4 z-10 bg-black rounded-lg shadow-sm p-3 flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                disabled={!hasWriteAccess || isReadOnly}
                className="w-8 h-8 rounded border"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                disabled={!hasWriteAccess || isReadOnly}
                className="w-16"
              />
              <span className="text-sm w-6">{strokeWidth}</span>
            </div>
            
            {['rectangle', 'circle', 'triangle'].includes(currentTool) && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fill}
                  onChange={(e) => setFill(e.target.checked)}
                  disabled={!hasWriteAccess || isReadOnly}
                />
                <span className="text-sm">Fill</span>
              </label>
            )}
            
            {currentTool === 'text' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm">Font:</span>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  disabled={!hasWriteAccess || isReadOnly}
                  className="w-16 px-2 py-1 border rounded"
                />
              </div>
            )}
            
            {(!hasWriteAccess || isReadOnly) && (
              <div className="flex items-center space-x-1 text-orange-600">
                <EyeOff className="w-4 h-4" />
                <span className="text-sm">Read Only</span>
              </div>
            )}
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            onMouseDown={hasWriteAccess && !isReadOnly ? handleMouseDown : undefined}
            onMouseMove={handleMouseMove}
            onMouseUp={hasWriteAccess && !isReadOnly ? handleMouseUp : undefined}
            className="w-full h-full cursor-crosshair bg-black"
            style={{ cursor: !hasWriteAccess || isReadOnly ? 'default' : 'crosshair' }}
          />

          {/* Text Input Modal */}
          {textPosition && currentTool === 'text' && (
            <div
              className="absolute bg-black border rounded-lg p-2 shadow-lg z-20"
              style={{ left: textPosition.x, top: textPosition.y }}
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Enter text..."
                className="border px-2 py-1 rounded w-48"
                autoFocus
              />
              <div className="flex justify-end mt-2 space-x-1">
                <button
                  onClick={() => setTextPosition(null)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTextSubmit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Panel */}
        {showUserPanel && (
          <div className="w-64 bg-black border-l shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Users Online ({users.length})</h3>
            </div>
            <div className="p-2 space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {user.id === board?.adminId ? 'Admin' : 'Member'}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Dialog */}
       {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Share Board</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Shareable Link</label>
              <div className="flex">
                <input
                  type="text"
                  value={getShareableLink()}
                  readOnly
                  className="flex-1 border rounded-l-lg px-3 py-2 bg-gray-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(getShareableLink())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowShareDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      {showSettings && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Board Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Board Name</label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder={board?.name}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={board?.isPublic || false}
                    onChange={(e) => updateBoardSettings({ isPublic: e.target.checked })}
                  />
                  <span className="text-sm">Public Board</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Anyone with the link can view and edit
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">User Management</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {users.filter(u => u.id !== board?.adminId).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{user.name}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newReadOnly = board?.readOnlyUsers.includes(user.id)
                              ? board.readOnlyUsers.filter(id => id !== user.id)
                              : [...(board?.readOnlyUsers || []), user.id];
                            updateBoardSettings({ readOnlyUsers: newReadOnly });
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            board?.readOnlyUsers.includes(user.id)
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {board?.readOnlyUsers.includes(user.id) ? 'Read Only' : 'Can Edit'}
                        </button>
                        <button
                          onClick={() => {
                            const newAllowed = board?.allowedUsers.filter(id => id !== user.id) || [];
                            const newReadOnly = board?.readOnlyUsers.filter(id => id !== user.id) || [];
                            updateBoardSettings({ 
                              allowedUsers: newAllowed,
                              readOnlyUsers: newReadOnly
                            });
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    if (boardName.trim()) {
                      updateBoardSettings({ name: boardName.trim() });
                    }
                    setShowSettings(false);
                    setBoardName('');
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowSettings(false);
                  setBoardName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo/Redo Controls - Fixed position */}
      <div className="fixed bottom-4 right-4 bg-black rounded-lg shadow-lg p-2 flex space-x-2">
        <button
          onClick={() => {
            if (historyIndex > 0) {
              setHistoryIndex(historyIndex - 1);
              // Implement undo functionality
            }
          }}
          disabled={historyIndex <= 0 || !hasWriteAccess || isReadOnly}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            if (historyIndex < history.length - 1) {
              setHistoryIndex(historyIndex + 1);
              // Implement redo functionality
            }
          }}
          disabled={historyIndex >= history.length - 1 || !hasWriteAccess || isReadOnly}
          className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default LiveBlackboard;