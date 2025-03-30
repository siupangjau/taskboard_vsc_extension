export type TicketStatus = 'todo' | 'in-progress' | 'done' | 'deleted';

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    position: number;
}

export interface Column {
    id: string;
    name: string;
    tickets: Ticket[];
}

export interface Board {
    columns: Column[];
}

export interface DraggableProvided {
    draggableProps: {
        'data-rbd-draggable-id': string;
        style?: React.CSSProperties;
    };
    dragHandleProps: object;
    innerRef: (element: HTMLElement | null) => void;
}

export interface DraggableSnapshot {
    isDragging: boolean;
    draggingOver: string | null;
}

export interface CreateTicketData {
    title: string;
    description: string;
    status: TicketStatus;
} 