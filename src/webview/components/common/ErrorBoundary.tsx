import * as React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '1rem',
                    color: 'var(--vscode-errorForeground)',
                    backgroundColor: 'var(--vscode-editor-background)',
                    border: '1px solid var(--vscode-errorForeground)',
                    borderRadius: '4px',
                    margin: '1rem'
                }}>
                    <h2>Something went wrong</h2>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
} 