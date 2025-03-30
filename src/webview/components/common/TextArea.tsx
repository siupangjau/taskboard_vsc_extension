import * as React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    style?: React.CSSProperties;
}

export const TextArea: React.FC<TextAreaProps> = ({ style, ...props }) => {
    return (
        <textarea
            {...props}
            style={{
                backgroundColor: 'var(--vscode-input-background)',
                color: 'var(--vscode-input-foreground)',
                border: '1px solid var(--vscode-input-border)',
                padding: '4px 8px',
                borderRadius: '2px',
                outline: 'none',
                resize: 'vertical',
                minHeight: '100px',
                ...style
            }}
        />
    );
}; 