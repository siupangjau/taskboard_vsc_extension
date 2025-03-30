import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TicketCard } from './TicketCard';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { styles } from '../styles/components';
import { Column as ColumnType, Ticket, CreateTicketData, TicketStatus } from '../types';
import { theme } from '../styles/theme';

interface ColumnProps {
  column: ColumnType;
  index: number;
  onCreateTicket: (data: CreateTicketData) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket, updates: { title?: string; description?: string; status?: TicketStatus }) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  dropAnimation: {
    isDropping: boolean;
    targetColumn: string | null;
    targetIndex: number | null;
  };
  isTargetColumn: boolean;
}

export const Column: React.FC<ColumnProps> = React.memo(({
  column,
  index,
  onCreateTicket,
  onDeleteTicket,
  onUpdateTicket,
  onUpdateColumn,
  dropAnimation,
  isTargetColumn
}) => {
  const [isAddingTicket, setIsAddingTicket] = React.useState(false);
  const [newTicketTitle, setNewTicketTitle] = React.useState('');
  const [newTicketDescription, setNewTicketDescription] = React.useState('');
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(column.name);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
      status: column.id as TicketStatus
    }
  });

  // Ensure column ID is valid
  if (!column || !column.id || !['todo', 'in-progress', 'done', 'deleted'].includes(column.id)) {
    console.error('Column: Invalid column data:', column);
    return null;
  }

  // Ensure tickets is an array
  const validTickets = React.useMemo(() => {
    if (!Array.isArray(column.tickets)) {
      console.error('Column: Invalid tickets array:', column.tickets);
      return [];
    }
    return column.tickets.filter(ticket => ticket && ticket.id);
  }, [column.tickets]);

  console.log('Column: Rendering column:', {
    id: column.id,
    ticketCount: validTickets.length,
    tickets: validTickets.map(t => t.id)
  });

  // Memoize the ticket IDs array to prevent unnecessary re-renders
  const ticketIds = React.useMemo(() =>
    validTickets.map(t => t.id),
    [validTickets]
  );

  // Memoize the style to prevent unnecessary re-renders
  const columnStyle = React.useMemo(() => ({
    ...styles.column.container,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    maxHeight: '100vh',
    width: '300px',
    minWidth: '300px'
  }), []);

  const dropZoneStyle = React.useMemo(() => ({
    ...styles.column.ticketList,
    flex: 1,
    minHeight: isOver ? '200px' : '100px', // Increase minimum height when dragging over
    padding: theme.spacing.md,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: theme.spacing.sm,
    backgroundColor: isOver ? theme.colors.dropTarget : undefined,
    transition: 'all 0.2s ease',
    border: isOver ? `2px dashed ${theme.colors.border}` : '2px solid transparent',
    borderRadius: theme.borderRadius.sm,
    margin: isOver ? '-2px' : undefined, // Prevent layout shift when border appears
    position: 'relative' as const,
    '::after': isOver ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      pointerEvents: 'none'
    } : undefined
  }), [isOver]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;

    onCreateTicket({
      title: newTicketTitle.trim(),
      description: newTicketDescription.trim(),
      status: column.id as TicketStatus
    });

    setNewTicketTitle('');
    setNewTicketDescription('');
    setIsAddingTicket(false);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() && editedName !== column.name) {
      onUpdateColumn(column.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  // Create a placeholder ticket for drop preview
  const renderDropPlaceholder = () => {
    if (!dropAnimation.isDropping || !isTargetColumn) return null;

    return (
      <div
        style={{
          height: '100px',
          backgroundColor: theme.colors.dropTarget,
          border: `2px dashed ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          margin: `${theme.spacing.sm} 0`,
          opacity: 0.6,
          transition: 'all 0.2s ease',
          transform: 'scale(1.02)',
        }}
      />
    );
  };

  return (
    <div style={columnStyle}>
      <div style={{
        ...styles.column.header,
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.sm
      }}>
        {isEditingName ? (
          <form onSubmit={handleNameSubmit} style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                style={{
                  ...styles.input.field,
                  marginBottom: 0,
                  height: '24px'
                }}
                autoFocus
                onBlur={handleNameSubmit}
              />
            </div>
          </form>
        ) : (
          <h2
            style={styles.column.title}
            onClick={() => setIsEditingName(true)}
            title="Click to edit column name"
          >
            {column.name}
          </h2>
        )}
        <Button onClick={() => setIsAddingTicket(true)}>+</Button>
      </div>

      {isAddingTicket && (
        <div style={{
          padding: `0 ${theme.spacing.md}`,
          marginBottom: theme.spacing.sm
        }}>
          <form onSubmit={handleCreateTicket} style={styles.form.container}>
            <Input
              type="text"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              placeholder="Ticket title"
              style={styles.input.field}
            />
            <TextArea
              value={newTicketDescription}
              onChange={(e) => setNewTicketDescription(e.target.value)}
              placeholder="Description"
              style={styles.input.field}
            />
            <div style={styles.form.actions}>
              <Button type="submit">Add</Button>
              <Button type="button" onClick={() => setIsAddingTicket(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div ref={setNodeRef} style={dropZoneStyle}>
        <SortableContext
          items={ticketIds}
          strategy={verticalListSortingStrategy}
        >
          {validTickets.map((ticket, ticketIndex) => {
            // Insert placeholder before the target ticket
            const showPlaceholderBefore =
              isTargetColumn &&
              dropAnimation.isDropping &&
              dropAnimation.targetIndex === ticketIndex;

            return (
              <React.Fragment key={ticket.id}>
                {showPlaceholderBefore && renderDropPlaceholder()}
                <TicketCard
                  ticket={ticket}
                  index={ticketIndex}
                  onDelete={onDeleteTicket}
                  onUpdate={onUpdateTicket}
                />
                {/* Show placeholder at the end of the list */}
                {ticketIndex === validTickets.length - 1 &&
                  isTargetColumn &&
                  dropAnimation.isDropping &&
                  dropAnimation.targetIndex === validTickets.length &&
                  renderDropPlaceholder()}
              </React.Fragment>
            );
          })}
          {/* Show placeholder in empty column */}
          {validTickets.length === 0 &&
            isTargetColumn &&
            dropAnimation.isDropping &&
            renderDropPlaceholder()}
        </SortableContext>
      </div>
    </div>
  );
}); 