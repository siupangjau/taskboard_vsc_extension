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
  id: TicketStatus;
  name: string;
  tickets: Ticket[];
}

export interface Board {
  columns: Column[];
}

export interface CreateTicketData {
  title: string;
  description: string;
  status: TicketStatus;
}

export type BoardFileType = 'csv' | 'json';

export interface BoardFile {
  path: string;
  type: BoardFileType;
  name: string;
} 