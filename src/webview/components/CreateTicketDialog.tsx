import * as React from 'react';
import { CreateTicketData } from '../types';
import { Button } from './common/Button';
import { Input } from './common/Input';
import { TextArea } from './common/TextArea';
import { styles } from '../styles/components';

interface CreateTicketDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTicketData) => void;
}

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            status: 'todo'
        });

        setTitle('');
        setDescription('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={styles.dialog.container}>
                <h2 style={styles.dialog.header}>Create New Ticket</h2>
                <form onSubmit={handleSubmit} style={styles.form.container}>
                    <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ticket title"
                        style={styles.input.field}
                        required
                    />
                    <TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        style={styles.input.field}
                        required
                    />
                    <div style={styles.form.actions}>
                        <Button type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}; 