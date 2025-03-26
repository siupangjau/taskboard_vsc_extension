import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';

console.log('Webview: React initialization starting');

const container = document.getElementById('root');
if (!container) {
    console.error('Webview: Failed to find root element');
} else {
    console.log('Webview: Found root element, creating root');
    try {
        const root = ReactDOM.createRoot(container);
        console.log('Webview: Root created, rendering App');
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('Webview: App rendered successfully');
    } catch (error) {
        console.error('Webview: Failed to render App:', error);
    }
} 