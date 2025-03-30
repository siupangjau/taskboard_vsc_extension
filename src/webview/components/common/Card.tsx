import * as React from 'react';
import { styles } from '../../styles/components';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    isDragging?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    isDragging = false,
    children,
    style,
    ...props
}, ref) => {
    const cardStyle = {
        ...styles.card.base,
        ...(isDragging ? styles.card.dragging : {}),
        ...style
    };

    return (
        <div ref={ref} style={cardStyle} {...props}>
            {children}
        </div>
    );
}); 