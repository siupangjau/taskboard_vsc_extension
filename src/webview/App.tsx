import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { Board } from './components/Board';
import { useBoard } from './hooks/useBoard';
import { Ticket } from './types';
import { styles } from './styles/components';
import { theme } from './styles/theme';

declare const vscode: {
  postMessage: (message: any) => void;
};

interface DragState {
  activeTicket: Ticket | null;
  dropAnimation: {
    isDropping: boolean;
    targetColumn: string | null;
    targetIndex: number | null;
  };
}

export const App: React.FC = () => {
  const [dragState, setDragState] = React.useState<DragState>({
    activeTicket: null,
    dropAnimation: {
      isDropping: false,
      targetColumn: null,
      targetIndex: null
    }
  });
  const { board, handleDragEnd } = useBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 100
      }
    })
  );

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    if (!board) return;

    const { active } = event;
    const activeTicket = board.columns
      .flatMap(col => col.tickets)
      .find(ticket => ticket.id === active.id);

    setDragState(prev => ({
      ...prev,
      activeTicket,
      dropAnimation: {
        isDropping: false,
        targetColumn: null,
        targetIndex: null
      }
    }));
  }, [board]);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    if (!board) return;
    const { active, over } = event;

    if (!over) {
      setDragState(prev => ({
        ...prev,
        dropAnimation: {
          isDropping: false,
          targetColumn: null,
          targetIndex: null
        }
      }));
      return;
    }

    const overId = String(over.id);

    // Find target column and position
    const targetColumn = board.columns.find(col =>
      col.id === overId || col.tickets.some(t => t.id === overId)
    );

    if (!targetColumn) return;

    const isOverColumn = overId === targetColumn.id;
    const targetIndex = isOverColumn ?
      targetColumn.tickets.length :
      targetColumn.tickets.findIndex(t => t.id === overId);

    setDragState(prev => ({
      ...prev,
      dropAnimation: {
        isDropping: true,
        targetColumn: targetColumn.id,
        targetIndex
      }
    }));
  }, [board]);

  const handleDragCancel = React.useCallback(() => {
    setDragState({
      activeTicket: null,
      dropAnimation: {
        isDropping: false,
        targetColumn: null,
        targetIndex: null
      }
    });
  }, []);

  const customHandleDragEnd = React.useCallback((event: DragEndEvent) => {
    handleDragEnd(event);
    handleDragCancel();
  }, [handleDragEnd, handleDragCancel]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={customHandleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Board
          dropAnimation={dragState.dropAnimation}
        />
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          })
        }}>
          {dragState.activeTicket ? (
            <div style={{
              ...styles.ticket.container,
              transform: 'rotate(-3deg)',
              boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)',
              cursor: 'grabbing',
              backgroundColor: theme.colors.background,
              opacity: 0.9,
              width: '280px'
            }}>
              <h3 style={styles.ticket.title}>{dragState.activeTicket.title}</h3>
              <p style={styles.ticket.description}>{dragState.activeTicket.description}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default App; 