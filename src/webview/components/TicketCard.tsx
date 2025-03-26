import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Ticket, TicketStatus } from '../../types';

interface TicketCardProps {
  ticket: Ticket;
  index: number;
  onDelete: (ticket: Ticket) => void;
  onStatusChange: (ticket: Ticket, newStatus: TicketStatus) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, index, onDelete, onStatusChange }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Validate ticket data
  if (!ticket || !ticket.id) {
    console.error('TicketCard: Invalid ticket data:', ticket);
    return null;
  }

  console.log('TicketCard: Rendering ticket:', { id: ticket.id, index, status: ticket.status });
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    onDelete(ticket);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    setShowDeleteConfirm(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Prevent drag from starting
    const newStatus = e.target.value as TicketStatus;
    if (newStatus !== ticket.status) {
      onStatusChange(ticket, newStatus);
    }
  };

  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => {
        console.log('TicketCard: Draggable render:', { 
          id: ticket.id, 
          status: ticket.status,
          isDragging: snapshot.isDragging,
          draggableId: provided.draggableProps['data-rbd-draggable-id']
        });
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            data-testid={`draggable-${ticket.id}`}
            style={{
              ...provided.draggableProps.style,
              padding: '1rem',
              marginBottom: '0.5rem',
              background: snapshot.isDragging
                ? 'var(--vscode-editor-selectionBackground)'
                : 'var(--vscode-editor-background)',
              border: '1px solid var(--vscode-editor-lineHighlightBorder)',
              borderRadius: '3px',
              boxShadow: snapshot.isDragging
                ? '0 4px 8px rgba(0, 0, 0, 0.2)'
                : 'none',
              userSelect: 'none',
              cursor: 'grab',
              position: 'relative'
            }}
          >
            <div style={{ 
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleDeleteClick}
                style={{
                  background: 'var(--vscode-errorForeground)',
                  color: 'white',
                  border: 'none',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Delete
              </button>
            </div>

            {showDeleteConfirm && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'var(--vscode-editor-background)',
                border: '1px solid var(--vscode-editor-lineHighlightBorder)',
                borderRadius: '4px',
                padding: '1rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                minWidth: '200px'
              }}>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: 'var(--vscode-editor-foreground)'
                }}>
                  Are you sure you want to delete ticket "{ticket.title}"?
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={handleConfirmDelete}
                    style={{
                      background: 'var(--vscode-errorForeground)',
                      color: 'white',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
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
              </div>
            )}

            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: 'var(--vscode-editor-foreground)',
              fontSize: '1rem',
              paddingRight: '60px'
            }}>
              {ticket.title}
            </h3>
            <p style={{
              margin: 0,
              color: 'var(--vscode-descriptionForeground)',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }}>
              {ticket.description}
            </p>
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: 'var(--vscode-descriptionForeground)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Status: 
              <select
                value={ticket.status}
                onChange={handleStatusChange}
                onClick={e => e.stopPropagation()} // Prevent drag from starting
                style={{
                  background: 'var(--vscode-dropdown-background)',
                  color: 'var(--vscode-dropdown-foreground)',
                  border: '1px solid var(--vscode-dropdown-border)',
                  borderRadius: '3px',
                  padding: '2px 4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};

export default TicketCard; 