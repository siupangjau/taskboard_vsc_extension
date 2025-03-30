import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({ style, ...props }) => {
    return (
        <input
            {...props}
            style={{
                backgroundColor: 'var(--vscode-input-background)',
                color: 'var(--vscode-input-foreground)',
                border: '1px solid var(--vscode-input-border)',
                padding: '4px 8px',
                borderRadius: '2px',
                outline: 'none',
                ...style
            }}
        />
    );
}; 