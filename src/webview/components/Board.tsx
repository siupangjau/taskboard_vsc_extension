import * as React from 'react';
import { DragDropContext, DropResult, DragStart, DragUpdate } from 'react-beautiful-dnd';
import type { Board as BoardType, Column as ColumnType, CreateTicketData, Ticket, TicketStatus } from '../../types';
import Column from './Column';

declare const vscode: {
  postMessage: (message: any) => void;
};

interface BoardProps {
  board: BoardType;
  onBoardChange: (board: BoardType) => void;
}

const Board: React.FC<BoardProps> = ({ board, onBoardChange }) => {
  // Sort and validate columns, ensuring tickets array exists
  const sortedColumns = React.useMemo(() => {
    // Only show active columns (exclude deleted)
    const columnOrder: TicketStatus[] = ['todo', 'in-progress', 'done'];
    return columnOrder.map(status => {
      const existingColumn = board.columns.find(col => col.id === status);
      return {
        id: status,
        name: existingColumn?.name || (status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)),
        tickets: (existingColumn?.tickets || []).filter(ticket => ticket && ticket.id)
      };
    });
  }, [board.columns]);

  // Keep track of deleted tickets in a separate column (but don't display it)
  const deletedColumn = React.useMemo(() => {
    const existing = board.columns.find(col => col.id === 'deleted');
    return {
      id: 'deleted' as TicketStatus,
      name: 'Deleted',
      tickets: (existing?.tickets || []).filter(ticket => ticket && ticket.id)
    };
  }, [board.columns]);

  React.useEffect(() => {
    // Update board if columns are missing or in wrong order
    const currentColumns = [...sortedColumns];
    // Always include deleted column in data but not in UI
    if (deletedColumn.tickets.length > 0) {
      currentColumns.push(deletedColumn);
    }

    const needsUpdate = !board.columns.every((col, idx) => {
      const currentCol = currentColumns[idx];
      return currentCol && col.id === currentCol.id;
    });

    if (needsUpdate) {
      console.log('Board: Updating columns order');
      onBoardChange({
        ...board,
        columns: currentColumns
      });
    }
  }, [board, sortedColumns, deletedColumn, onBoardChange]);

  console.log('Board: Rendering with data:', { 
    columns: sortedColumns.map(col => ({ id: col.id, ticketCount: col.tickets.length }))
  });

  const handleDragStart = (initial: DragStart) => {
    console.log('Board: Drag started:', initial);
  };

  const handleDragUpdate = (update: DragUpdate) => {
    console.log('Board: Drag updated:', update);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    console.log('Board: Drag ended:', { destination, source, draggableId });

    if (!destination) {
      console.log('Board: No destination, dropping cancelled');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Board: Dropped in same position, no update needed');
      return;
    }

    // Validate source and destination IDs
    if (!['todo', 'in-progress', 'done'].includes(source.droppableId) ||
        !['todo', 'in-progress', 'done'].includes(destination.droppableId)) {
      console.error('Board: Invalid column ID', { source: source.droppableId, destination: destination.droppableId });
      return;
    }

    const sourceStatus = source.droppableId as TicketStatus;
    const destStatus = destination.droppableId as TicketStatus;

    const sourceColumn = board.columns.find(col => col.id === sourceStatus);
    const destColumn = board.columns.find(col => col.id === destStatus);

    if (!sourceColumn || !destColumn) {
      console.error('Board: Could not find source or destination column', { 
        source: { id: sourceStatus, found: !!sourceColumn }, 
        destination: { id: destStatus, found: !!destColumn },
        columns: board.columns.map(c => c.id)
      });
      return;
    }

    // Validate that we can find the ticket being dragged
    const ticketToMove = sourceColumn.tickets[source.index];
    if (!ticketToMove || ticketToMove.id !== draggableId) {
      console.error('Board: Ticket mismatch', { 
        expected: draggableId, 
        found: ticketToMove?.id,
        sourceTickets: sourceColumn.tickets.map(t => t.id)
      });
      return;
    }

    console.log('Board: Moving ticket between columns:', {
      from: sourceColumn.name,
      to: destColumn.name,
      ticketIndex: source.index
    });

    const newColumns = board.columns.map(col => {
      // Remove from source column
      if (col.id === sourceColumn.id) {
        const newTickets = [...col.tickets];
        const [removed] = newTickets.splice(source.index, 1);
        console.log('Board: Removed ticket from source:', removed);
        return {
          ...col,
          tickets: newTickets
        };
      }
      // Add to destination column
      if (col.id === destColumn.id) {
        const ticket = sourceColumn.tickets[source.index];
        if (!ticket) {
          console.error('Board: Could not find ticket to move', { source, sourceColumn });
          return col;
        }
        
        const newTickets = [...col.tickets];
        const updatedTicket = {
          ...ticket,
          status: destColumn.id,
          updatedAt: new Date().toISOString()
        };
        newTickets.splice(destination.index, 0, updatedTicket);
        console.log('Board: Added ticket to destination:', updatedTicket);
        
        return {
          ...col,
          tickets: newTickets
        };
      }
      return col;
    });

    const newBoard = {
      ...board,
      columns: newColumns
    };
    console.log('Board: Updated board after drag:', newBoard);
    onBoardChange(newBoard);

    // Send message to extension to save changes
    vscode.postMessage({
      type: 'boardUpdated',
      board: newBoard
    });
  };

  const handleCreateTicket = React.useCallback((data: CreateTicketData) => {
    console.log('Board: Creating new ticket:', data);
    
    // Validate status
    if (!['todo', 'in-progress', 'done'].includes(data.status)) {
      console.error('Board: Invalid status for new ticket', { status: data.status });
      return;
    }
    
    const timestamp = Date.now();
    const newTicket: Ticket = {
      id: `ticket-${timestamp}`,
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Board: New ticket created:', newTicket);

    const newColumns = board.columns.map(col => {
      if (col.id === data.status) {
        return {
          ...col,
          tickets: [...col.tickets, newTicket]
        };
      }
      return col;
    });

    const newBoard = {
      ...board,
      columns: newColumns
    };

    console.log('Board: Updated board after ticket creation:', newBoard);
    onBoardChange(newBoard);
    
    // Send message to extension to save changes
    vscode.postMessage({
      type: 'boardUpdated',
      board: newBoard
    });
  }, [board, onBoardChange]);

  const handleDeleteTicket = React.useCallback((ticket: Ticket) => {
    console.log('Board: Deleting ticket:', ticket);

    if (!ticket || !ticket.id) {
      console.error('Board: Invalid ticket to delete:', ticket);
      return;
    }

    // Create a new array of columns with the ticket removed from its current column
    const newColumns = board.columns.map(col => {
      if (!col || !Array.isArray(col.tickets)) {
        return col;
      }

      if (col.id === ticket.status) {
        // Remove from current column
        return {
          ...col,
          tickets: col.tickets.filter(t => t && t.id && t.id !== ticket.id)
        };
      }
      if (col.id === 'deleted') {
        // Add to deleted column
        const updatedTicket = {
          ...ticket,
          status: 'deleted' as TicketStatus,
          updatedAt: new Date().toISOString()
        };
        return {
          ...col,
          tickets: [...col.tickets.filter(t => t && t.id && t.id !== ticket.id), updatedTicket]
        };
      }
      return col;
    }).filter(col => col && Array.isArray(col.tickets));

    // If deleted column doesn't exist yet, create it
    if (!newColumns.some(col => col.id === 'deleted')) {
      newColumns.push({
        id: 'deleted',
        name: 'Deleted',
        tickets: [{
          ...ticket,
          status: 'deleted',
          updatedAt: new Date().toISOString()
        }]
      });
    }

    const newBoard = {
      ...board,
      columns: newColumns
    };

    console.log('Board: Updated board after deletion:', newBoard);
    onBoardChange(newBoard);

    // Send message to extension to save changes
    vscode.postMessage({
      type: 'boardUpdated',
      board: newBoard
    });
  }, [board, onBoardChange]);

  const handleStatusChange = React.useCallback((ticket: Ticket, newStatus: TicketStatus) => {
    console.log('Board: Changing ticket status:', { ticket, newStatus });

    if (!ticket || !ticket.id) {
      console.error('Board: Invalid ticket to update:', ticket);
      return;
    }

    // Update the ticket's status in its current column
    const newColumns = board.columns.map(col => {
      if (!col || !Array.isArray(col.tickets)) {
        return col;
      }

      if (col.id === ticket.status) {
        // Remove from current column
        return {
          ...col,
          tickets: col.tickets.filter(t => t && t.id && t.id !== ticket.id)
        };
      }
      if (col.id === newStatus) {
        // Add to new column
        const updatedTicket = {
          ...ticket,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        return {
          ...col,
          tickets: [...col.tickets, updatedTicket]
        };
      }
      return col;
    }).filter(col => col && Array.isArray(col.tickets));

    const newBoard = {
      ...board,
      columns: newColumns
    };

    console.log('Board: Updated board after status change:', newBoard);
    onBoardChange(newBoard);

    // Send message to extension to save changes
    vscode.postMessage({
      type: 'boardUpdated',
      board: newBoard
    });
  }, [board, onBoardChange]);

  if (!board || !board.columns) {
    console.error('Board: Invalid board data:', board);
    return (
      <div style={{
        padding: '1rem',
        color: 'var(--vscode-editor-foreground)'
      }}>
        No board data available
      </div>
    );
  }

  return (
    <DragDropContext 
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: 'flex',
        gap: '1rem',
        height: '100%',
        padding: '1rem',
        overflowX: 'auto'
      }}>
        {sortedColumns.map((column) => (
          <Column
            key={column.id}
            column={column}
            tickets={column.tickets || []}
            onCreateTicket={handleCreateTicket}
            onDeleteTicket={handleDeleteTicket}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </DragDropContext>
  );
};

export default Board; 