import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HiPencil, HiTrash, HiX, HiCheck } from 'react-icons/hi';
import { Ticket, TicketStatus } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { styles } from '../styles/components';
import { theme } from '../styles/theme';

type PointerEventsType = 'none' | 'auto';

interface TicketCardProps {
  ticket: Ticket;
  index: number;
  onDelete: (ticket: Ticket) => void;
  onUpdate: (ticket: Ticket, updates: { title?: string; description?: string; status?: TicketStatus }) => void;
}

export const TicketCard: React.FC<TicketCardProps> = React.memo(({
  ticket,
  index,
  onDelete,
  onUpdate
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState(ticket.title);
  const [editedDescription, setEditedDescription] = React.useState(ticket.description);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: ticket.id,
    data: ticket
  });

  const style = {
    ...styles.ticket.container,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditing ? 'default' : 'grab',
    position: 'relative' as const,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  };

  const dragHandleRef = React.useRef<HTMLDivElement>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConfirming) {
      setIsConfirming(true);
    } else {
      onDelete(ticket);
      setIsConfirming(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsConfirming(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (editedTitle.trim() && (editedTitle !== ticket.title || editedDescription !== ticket.description)) {
      onUpdate(ticket, {
        title: editedTitle.trim(),
        description: editedDescription.trim()
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditedTitle(ticket.title);
    setEditedDescription(ticket.description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={style} ref={setNodeRef}>
        <div
          style={{
            position: 'relative',
            zIndex: 1000,
            pointerEvents: 'auto' as PointerEventsType,
            backgroundColor: theme.colors.background,
            padding: theme.spacing.sm,
            borderRadius: parseInt(theme.borderRadius.sm),
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <form onSubmit={handleSubmitEdit}>
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Ticket title"
              style={styles.input.field}
              required
              autoFocus
            />
            <TextArea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Description"
              style={styles.input.field}
              required
            />
            <div style={styles.form.actions}>
              <Button
                type="button"
                onClick={handleCancelEdit}
                title="Cancel editing"
                style={{
                  padding: '6px',
                  minWidth: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '4px',
                  cursor: 'pointer'
                }}
              >
                <HiX size={16} />
              </Button>
              <Button
                type="submit"
                title="Save changes"
                style={{
                  padding: '6px',
                  minWidth: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: theme.colors.button.primary.bg,
                  color: theme.colors.button.primary.text
                }}
              >
                <HiCheck size={16} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isConfirming) {
          setIsHovered(false);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        <h3 style={styles.ticket.title}>{ticket.title}</h3>
        {(isHovered || isConfirming) && !isDragging && (
          <div
            style={{
              ...styles.ticket.actions,
              position: 'relative',
              zIndex: isConfirming ? 1000 : 'auto',
              backgroundColor: isConfirming ? theme.colors.background : undefined,
              padding: isConfirming ? theme.spacing.sm : undefined,
              borderRadius: isConfirming ? parseInt(theme.borderRadius.sm) : undefined,
              boxShadow: isConfirming ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
            }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onMouseEnter={e => e.stopPropagation()}
            onMouseLeave={e => {
              e.stopPropagation();
              if (!isConfirming) {
                setIsHovered(false);
              }
            }}
          >
            {!isConfirming && (
              <Button
                onClick={handleEdit}
                title="Edit ticket"
                style={{
                  padding: '6px',
                  minWidth: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '4px',
                  cursor: 'pointer'
                }}
              >
                <HiPencil size={16} />
              </Button>
            )}
            <Button
              onClick={handleDelete}
              title={isConfirming ? "Click again to confirm delete" : "Delete ticket"}
              style={{
                padding: '6px',
                minWidth: '32px',
                height: '32px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isConfirming ? theme.colors.button.danger.bg : undefined,
                color: isConfirming ? theme.colors.button.danger.text : undefined,
                marginRight: isConfirming ? '4px' : '0',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isConfirming ? <HiCheck size={16} /> : <HiTrash size={16} />}
            </Button>
            {isConfirming && (
              <Button
                onClick={handleCancelDelete}
                title="Cancel delete"
                style={{
                  padding: '6px',
                  minWidth: '32px',
                  height: '32px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <HiX size={16} />
              </Button>
            )}
          </div>
        )}
      </div>
      <p style={styles.ticket.description}>{ticket.description}</p>
    </div>
  );
}); 