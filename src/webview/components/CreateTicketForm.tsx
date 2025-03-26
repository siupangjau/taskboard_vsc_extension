import * as React from 'react';
import { CreateTicketData } from '../../types';

interface CreateTicketFormProps {
  columnId: string;
  onSubmit: (data: CreateTicketData) => void;
  onCancel: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ columnId, onSubmit, onCancel }) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      status: columnId
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{
      padding: '1rem',
      backgroundColor: 'var(--vscode-editor-background)',
      borderRadius: '4px',
      marginBottom: '0.5rem'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ticket title"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'var(--vscode-input-background)',
            color: 'var(--vscode-input-foreground)',
            border: '1px solid var(--vscode-input-border)',
            borderRadius: '2px'
          }}
          required
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: 'var(--vscode-input-background)',
            color: 'var(--vscode-input-foreground)',
            border: '1px solid var(--vscode-input-border)',
            borderRadius: '2px',
            minHeight: '100px',
            resize: 'vertical'
          }}
          required
        />
      </div>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'flex-end'
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-secondaryForeground)',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default CreateTicketForm; 