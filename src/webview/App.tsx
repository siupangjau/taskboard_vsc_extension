import * as React from 'react';
import Board from './components/Board';
import { Board as BoardType } from '../types';

declare const vscode: {
  postMessage: (message: any) => void;
};

const App: React.FC = () => {
  const [board, setBoard] = React.useState<BoardType | null>(null);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('App: Received message:', message);

      switch (message.type) {
        case 'boardData':
          console.log('App: Setting board data:', message.board);
          setBoard(message.board);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleBoardChange = React.useCallback((newBoard: BoardType) => {
    console.log('App: Board changed:', newBoard);
    setBoard(newBoard);
    
    // Send the updated board back to the extension
    vscode.postMessage({
      type: 'boardUpdated',
      board: newBoard
    });
  }, []);

  if (!board) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'var(--vscode-editor-foreground)'
      }}>
        Loading board...
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: 'var(--vscode-editor-background)',
      color: 'var(--vscode-editor-foreground)',
      overflow: 'hidden'
    }}>
      <Board
        board={board}
        onBoardChange={handleBoardChange}
      />
    </div>
  );
};

export default App; 