import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Board, Ticket, TicketStatus } from '../types';

export class FileService {
    private fileWatcher: vscode.FileSystemWatcher | undefined;
    private readonly requiredHeaders = ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt'];

    constructor() {}

    private generateTicketId(): string {
        return `ticket-${Date.now()}`;
    }

    private ensureTicketId(ticket: Partial<Ticket>): Ticket {
        if (!ticket.id || !ticket.id.startsWith('ticket-')) {
            ticket.id = this.generateTicketId();
        }
        
        return {
            id: ticket.id,
            title: ticket.title || '',
            description: ticket.description || '',
            status: (ticket.status as TicketStatus) || 'todo',
            createdAt: ticket.createdAt || new Date().toISOString(),
            updatedAt: ticket.updatedAt || new Date().toISOString()
        };
    }

    private parseCSVLine(line: string): string[] {
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Handle escaped quotes
                    currentValue += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quotes
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                // End of field
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        values.push(currentValue);
        return values;
    }

    async readFile(filePath: string): Promise<Board> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const extension = path.extname(filePath).toLowerCase();

            if (extension === '.json') {
                const data = JSON.parse(content);
                // If it's already in Board format
                if (data.columns) {
                    const board = data as Board;
                    // Ensure all tickets have valid IDs
                    board.columns = board.columns.map(col => ({
                        ...col,
                        tickets: col.tickets.map(t => this.ensureTicketId(t))
                    }));
                    return board;
                }
                // Convert array of tickets to Board format
                const tickets = Array.isArray(data) ? data : [];
                return this.convertTicketsToBoard(tickets.map(t => this.ensureTicketId(t)));
            } else if (extension === '.csv') {
                // Split content into lines, handling potential \r\n
                const lines = content.split(/\r?\n/).filter(line => line.trim());
                
                if (lines.length === 0) {
                    return this.convertTicketsToBoard([]);
                }

                // Parse and validate headers
                const headers = this.parseCSVLine(lines[0]);
                const missingHeaders = this.requiredHeaders.filter(h => !headers.includes(h));
                if (missingHeaders.length > 0) {
                    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
                }

                // Parse tickets
                const tickets = lines.slice(1)
                    .map(line => {
                        const values = this.parseCSVLine(line);
                        const ticket: any = {};
                        headers.forEach((header, index) => {
                            ticket[header] = values[index] || '';
                        });
                        return this.ensureTicketId(ticket);
                    });

                return this.convertTicketsToBoard(tickets);
            }
            throw new Error('Unsupported file format');
        } catch (error) {
            console.error('Error reading file:', error);
            throw error;
        }
    }

    async writeFile(filePath: string, data: Board): Promise<void> {
        try {
            const extension = path.extname(filePath).toLowerCase();
            let content: string;

            if (extension === '.json') {
                content = JSON.stringify(data, null, 2);
            } else if (extension === '.csv') {
                const tickets = this.extractTicketsFromBoard(data);
                
                // Always write headers in the correct order
                const headers = this.requiredHeaders;
                const headerRow = headers.join(',');

                if (tickets.length === 0) {
                    content = headerRow + '\n';
                } else {
                    const rows = tickets.map(ticket => {
                        return headers.map(header => {
                            const value = (ticket[header as keyof Ticket] || '').toString();
                            // Escape special characters
                            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        }).join(',');
                    });
                    content = [headerRow, ...rows].join('\n');
                }
            } else {
                throw new Error('Unsupported file format');
            }

            await fs.promises.writeFile(filePath, content, 'utf8');
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }
    }

    private convertTicketsToBoard(tickets: Ticket[]): Board {
        return {
            columns: [
                {
                    id: 'todo',
                    name: 'To Do',
                    tickets: tickets.filter(t => t.status === 'todo')
                },
                {
                    id: 'in-progress',
                    name: 'In Progress',
                    tickets: tickets.filter(t => t.status === 'in-progress')
                },
                {
                    id: 'done',
                    name: 'Done',
                    tickets: tickets.filter(t => t.status === 'done')
                }
            ]
        };
    }

    private extractTicketsFromBoard(data: Board): Ticket[] {
        return data.columns.flatMap(column => column.tickets);
    }

    watchFile(filePath: string, onChange: () => void) {
        this.dispose(); // Clean up any existing watcher
        const pattern = new vscode.RelativePattern(path.dirname(filePath), path.basename(filePath));
        this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        this.fileWatcher.onDidChange(onChange);
        this.fileWatcher.onDidCreate(onChange);
    }

    dispose() {
        if (this.fileWatcher) {
            this.fileWatcher.dispose();
            this.fileWatcher = undefined;
        }
    }
} 