export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  ticketIds: string[];
}

export interface Board {
  columns: Column[];
  tickets: { [key: string]: Ticket };
} 