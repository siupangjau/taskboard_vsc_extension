import * as React from 'react';
import { Board, CreateTicketData, Ticket, TicketStatus } from '../../types';
import { VALID_STATUSES } from '../utils/constants';

declare const vscode: {
    postMessage: (message: any) => void;
};

interface UseBoardResult {
    board: Board | null;
    loading: boolean;
    error: Error | null;
    onCreateTicket: (data: CreateTicketData) => void;
    onDeleteTicket: (ticket: Ticket) => void;
    onUpdateTicket: (ticket: Ticket, updates: { title?: string; description?: string; status?: TicketStatus }) => void;
    onUpdateColumn: (columnId: string, name: string) => void;
    setBoard: React.Dispatch<React.SetStateAction<Board | null>>;
    handleDragEnd: (event: DragEndEvent) => void;
}

export const useBoard = (): UseBoardResult => {
    const [board, setBoard] = React.useState<Board | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            console.log('useBoard: Received message:', message);

            switch (message.type) {
                case 'boardData':
                    console.log('useBoard: Setting board data:', message.board);
                    setBoard(message.board);
                    setLoading(false);
                    break;
                case 'error':
                    console.error('useBoard: Received error:', message.error);
                    setError(new Error(message.error));
                    setLoading(false);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        // Request initial board data
        console.log('useBoard: Requesting initial board data');
        vscode.postMessage({ type: 'requestBoardData' });

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Update board state and notify extension
    const updateBoard = React.useCallback((newBoard: Board) => {
        setBoard(newBoard);
        vscode.postMessage({
            type: 'boardUpdated',
            board: newBoard
        });
    }, []);

    // Create ticket handler
    const onCreateTicket = React.useCallback((data: CreateTicketData) => {
        if (!board) return;

        console.log('useBoard: Creating new ticket:', data);

        // Find the maximum position in the target column
        const targetColumn = board.columns.find(col => col.id === data.status);
        const maxPosition = targetColumn?.tickets.reduce((max, t) => Math.max(max, t.position || 0), 0) || 0;

        const newTicket: Ticket = {
            id: `ticket-${Date.now()}`,
            title: data.title,
            description: data.description,
            status: data.status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            position: maxPosition + 1000  // Use 1000 increment for easy insertion
        };

        const newColumns = board.columns.map(col => {
            if (col.id === data.status) {
                return {
                    ...col,
                    tickets: [...col.tickets, newTicket].sort((a, b) => a.position - b.position)
                };
            }
            return col;
        });

        console.log('useBoard: Updating board with new ticket');
        updateBoard({
            ...board,
            columns: newColumns
        });
    }, [board, updateBoard]);

    // Delete ticket handler
    const onDeleteTicket = React.useCallback((ticket: Ticket) => {
        if (!board || !ticket?.id) {
            console.error('useBoard: Invalid ticket to delete:', ticket);
            return;
        }

        const newColumns = board.columns.map(col => {
            if (col.id === ticket.status) {
                return {
                    ...col,
                    tickets: col.tickets.filter(t => t.id !== ticket.id)
                };
            }
            if (col.id === 'deleted') {
                return {
                    ...col,
                    tickets: [...col.tickets, { ...ticket, status: 'deleted' as TicketStatus }]
                };
            }
            return col;
        });

        updateBoard({
            ...board,
            columns: newColumns
        });
    }, [board, updateBoard]);

    // Update ticket handler
    const onUpdateTicket = React.useCallback((ticket: Ticket, updates: { title?: string; description?: string; status?: TicketStatus }) => {
        if (!board) return;

        const updatedTicket = {
            ...ticket,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const newColumns = board.columns.map(col => {
            if (col.id === ticket.status && updates.status !== col.id) {
                // Remove from old column
                return {
                    ...col,
                    tickets: col.tickets.filter(t => t.id !== ticket.id)
                };
            }
            if (updates.status && col.id === updates.status) {
                // Add to new column
                const maxPosition = col.tickets.reduce((max, t) => Math.max(max, t.position || 0), 0);
                updatedTicket.position = maxPosition + 1000;
                return {
                    ...col,
                    tickets: [...col.tickets, updatedTicket].sort((a, b) => a.position - b.position)
                };
            }
            if (col.id === ticket.status && !updates.status) {
                // Update in same column
                return {
                    ...col,
                    tickets: col.tickets.map(t => t.id === ticket.id ? updatedTicket : t)
                };
            }
            return col;
        });

        updateBoard({
            ...board,
            columns: newColumns
        });
    }, [board, updateBoard]);

    // Handle drag end
    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        if (!board) return;

        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Find source and target columns
        const sourceColumn = board.columns.find(col => col.tickets.some(t => t.id === activeId));
        const targetColumn = board.columns.find(col => col.tickets.some(t => t.id === overId) || col.id === overId);

        if (!sourceColumn || !targetColumn) return;

        const activeTicket = sourceColumn.tickets.find(t => t.id === activeId);
        if (!activeTicket) return;

        // If dropping in the same column
        if (sourceColumn.id === targetColumn.id) {
            const oldIndex = sourceColumn.tickets.findIndex(t => t.id === activeId);
            const newIndex = targetColumn.tickets.findIndex(t => t.id === overId);

            if (oldIndex === newIndex) return;

            // Calculate new position
            const prevPosition = newIndex > 0 ? targetColumn.tickets[newIndex - 1].position : 0;
            const nextPosition = newIndex < targetColumn.tickets.length - 1 ? targetColumn.tickets[newIndex].position : prevPosition + 2000;
            const newPosition = prevPosition + (nextPosition - prevPosition) / 2;

            // Update positions in the same column
            const newColumns = board.columns.map(col => {
                if (col.id === sourceColumn.id) {
                    const updatedTickets = [...col.tickets];
                    const [movedTicket] = updatedTickets.splice(oldIndex, 1);
                    movedTicket.position = newPosition;
                    updatedTickets.splice(newIndex, 0, movedTicket);
                    return {
                        ...col,
                        tickets: updatedTickets.sort((a, b) => a.position - b.position)
                    };
                }
                return col;
            });

            updateBoard({
                ...board,
                columns: newColumns
            });
        } else {
            // Moving to a different column
            const isOverColumn = overId === targetColumn.id;
            const overIndex = isOverColumn ?
                targetColumn.tickets.length :
                targetColumn.tickets.findIndex(t => t.id === overId);

            // Calculate position in new column
            const prevPosition = overIndex > 0 ? targetColumn.tickets[overIndex - 1].position : 0;
            const nextPosition = overIndex < targetColumn.tickets.length ? targetColumn.tickets[overIndex].position : prevPosition + 2000;
            const newPosition = prevPosition + (nextPosition - prevPosition) / 2;

            // Update columns
            const newColumns = board.columns.map(col => {
                if (col.id === sourceColumn.id) {
                    return {
                        ...col,
                        tickets: col.tickets.filter(t => t.id !== activeId)
                    };
                }
                if (col.id === targetColumn.id) {
                    const updatedTicket = {
                        ...activeTicket,
                        status: targetColumn.id as TicketStatus,
                        position: newPosition,
                        updatedAt: new Date().toISOString()
                    };

                    const newTickets = [...col.tickets];
                    if (isOverColumn) {
                        newTickets.push(updatedTicket);
                    } else {
                        newTickets.splice(overIndex, 0, updatedTicket);
                    }

                    return {
                        ...col,
                        tickets: newTickets.sort((a, b) => a.position - b.position)
                    };
                }
                return col;
            });

            onUpdateTicket(activeTicket, {
                status: targetColumn.id as TicketStatus
            });

            updateBoard({
                ...board,
                columns: newColumns
            });
        }
    }, [board, onUpdateTicket, updateBoard]);

    const onUpdateColumn = React.useCallback((columnId: string, name: string) => {
        if (!board) return;

        const newColumns = board.columns.map(col => {
            if (col.id === columnId) {
                return {
                    ...col,
                    name
                };
            }
            return col;
        });

        updateBoard({
            ...board,
            columns: newColumns
        });
    }, [board, updateBoard]);

    return {
        board,
        loading,
        error,
        onCreateTicket,
        onDeleteTicket,
        onUpdateTicket,
        onUpdateColumn,
        setBoard,
        handleDragEnd
    };
}; 