import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import TicketCard from './TicketCard';
import { Column as ColumnType, Ticket, CreateTicketData, TicketStatus } from '../../types';

interface ColumnProps {
  column: ColumnType;
  tickets: Ticket[];
  onCreateTicket: (data: CreateTicketData) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: TicketStatus) => void;
}

const Column: React.FC<ColumnProps> = ({ column, tickets, onCreateTicket, onDeleteTicket, onStatusChange }) => {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newTicketTitle, setNewTicketTitle] = React.useState('');
  const [newTicketDescription, setNewTicketDescription] = React.useState('');

  // Ensure column ID is valid
  if (!column || !column.id || !['todo', 'in-progress', 'done', 'deleted'].includes(column.id)) {
    console.error('Column: Invalid column data:', column);
    return null;
  }

  // Ensure tickets is an array
  const validTickets = React.useMemo(() => {
    if (!Array.isArray(tickets)) {
      console.error('Column: Invalid tickets array:', tickets);
      return [];
    }
    return tickets.filter(ticket => ticket && ticket.id);
  }, [tickets]);

  console.log('Column: Rendering column:', { 
    id: column.id, 
    ticketCount: validTickets.length,
    tickets: validTickets.map(t => t.id)
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) {
      return;
    }
    onCreateTicket({
      title: newTicketTitle.trim(),
      description: newTicketDescription.trim(),
      status: column.id
    });
    setNewTicketTitle('');
    setNewTicketDescription('');
    setIsCreating(false);
  };

  return (
    <div style={{
      background: 'var(--vscode-editor-background)',
      border: '1px solid var(--vscode-editor-lineHighlightBorder)',
      borderRadius: '4px',
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      margin: '0 8px'
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--vscode-editor-lineHighlightBorder)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          margin: 0,
          color: 'var(--vscode-editor-foreground)',
          fontSize: '1rem'
        }}>{column.name}</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              background: 'var(--vscode-button-background)',
              color: 'var(--vscode-button-foreground)',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSubmit} style={{ padding: '1rem' }}>
          <input
            type="text"
            value={newTicketTitle}
            onChange={(e) => setNewTicketTitle(e.target.value)}
            placeholder="Title"
            style={{
              width: '100%',
              marginBottom: '0.5rem',
              padding: '0.5rem',
              background: 'var(--vscode-input-background)',
              color: 'var(--vscode-input-foreground)',
              border: '1px solid var(--vscode-input-border)'
            }}
          />
          <textarea
            value={newTicketDescription}
            onChange={(e) => setNewTicketDescription(e.target.value)}
            placeholder="Description"
            style={{
              width: '100%',
              marginBottom: '0.5rem',
              padding: '0.5rem',
              background: 'var(--vscode-input-background)',
              color: 'var(--vscode-input-foreground)',
              border: '1px solid var(--vscode-input-border)',
              minHeight: '100px'
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              style={{
                background: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewTicketTitle('');
                setNewTicketDescription('');
              }}
              style={{
                background: 'var(--vscode-button-secondaryBackground)',
                color: 'var(--vscode-button-secondaryForeground)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => {
          console.log('Column: Droppable render:', { 
            id: column.id, 
            isDraggingOver: snapshot.isDraggingOver,
            draggingOverWith: snapshot.draggingOverWith,
            tickets: validTickets.map(t => ({ id: t.id, status: t.status }))
          });
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              data-column-id={column.id}
              data-testid={`droppable-${column.id}`}
              style={{
                padding: '1rem',
                flexGrow: 1,
                overflowY: 'auto',
                background: snapshot.isDraggingOver
                  ? 'var(--vscode-editor-selectionBackground)'
                  : 'transparent',
                transition: 'background-color 0.2s ease',
                minHeight: '100px'
              }}
            >
              {validTickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  onDelete={onDeleteTicket}
                  onStatusChange={onStatusChange}
                />
              ))}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
};

export default Column; 