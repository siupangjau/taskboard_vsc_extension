import { TicketStatus } from '../../types';

export const VALID_STATUSES: TicketStatus[] = ['todo', 'in-progress', 'done'];

export const COLUMN_NAMES: Record<TicketStatus, string> = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'done': 'Done',
    'deleted': 'Deleted'
};

// VSCode theme variables
export const THEME = {
    background: 'var(--vscode-editor-background)',
    foreground: 'var(--vscode-editor-foreground)',
    border: 'var(--vscode-input-border)',
    description: 'var(--vscode-descriptionForeground)',
    selection: 'var(--vscode-editor-selectionBackground)',
    error: 'var(--vscode-errorForeground)',
    button: {
        background: 'var(--vscode-button-background)',
        foreground: 'var(--vscode-button-foreground)',
        secondaryBackground: 'var(--vscode-button-secondaryBackground)',
        secondaryForeground: 'var(--vscode-button-secondaryForeground)',
    },
    input: {
        background: 'var(--vscode-input-background)',
        foreground: 'var(--vscode-input-foreground)',
        border: 'var(--vscode-input-border)',
    },
    dropdown: {
        background: 'var(--vscode-dropdown-background)',
        foreground: 'var(--vscode-dropdown-foreground)',
        border: 'var(--vscode-dropdown-border)',
    }
}; 