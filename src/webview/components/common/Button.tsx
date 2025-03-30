import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ style, children, ...props }) => {
    return (
        <button
            {...props}
            style={{
                backgroundColor: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '2px',
                cursor: 'pointer',
                ...style
            }}
        >
            {children}
        </button>
    );
}; 