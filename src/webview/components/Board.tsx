import * as React from 'react';
import { useBoard } from '../hooks/useBoard';
import { Column } from './Column';
import { styles } from '../styles/components';
import { theme } from '../styles/theme';

interface BoardProps {
  dropAnimation: {
    isDropping: boolean;
    targetColumn: string | null;
    targetIndex: number | null;
  };
}

export const Board: React.FC<BoardProps> = ({ dropAnimation }) => {
  const {
    board,
    loading,
    error,
    onCreateTicket,
    onDeleteTicket,
    onUpdateTicket,
    onUpdateColumn
  } = useBoard();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: theme.colors.text
      }}>
        Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: theme.spacing.md,
        color: theme.colors.button.danger.bg
      }}>
        Error: {error.message}
      </div>
    );
  }

  if (!board) {
    return (
      <div style={{
        padding: theme.spacing.md,
        color: theme.colors.text
      }}>
        No board data available.
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      gap: theme.spacing.lg,
      padding: theme.spacing.lg,
      height: '100%',
      minHeight: '100vh',
      overflowX: 'auto',
      overflowY: 'hidden',
      backgroundColor: theme.colors.background,
      color: theme.colors.text
    }}>
      {board.columns.map((column, index) => (
        <Column
          key={column.id}
          column={column}
          index={index}
          onCreateTicket={onCreateTicket}
          onDeleteTicket={onDeleteTicket}
          onUpdateTicket={onUpdateTicket}
          onUpdateColumn={onUpdateColumn}
          dropAnimation={dropAnimation}
          isTargetColumn={dropAnimation.targetColumn === column.id}
        />
      ))}
    </div>
  );
}; 