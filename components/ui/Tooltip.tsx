import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top', variant = 'default', disabled = false }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const variantClasses = {
        default: 'bg-white text-black border-neutral-200',
        danger: 'bg-red-600 text-white border-red-700'
    };

    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && !disabled && (
                <div className={`absolute z-50 px-2 py-1 text-[11px] font-semibold tracking-wide rounded-lg shadow-lg whitespace-nowrap border ${positionClasses[position]} ${variantClasses[variant]}`}>
                    {content}
                </div>
            )}
        </div>
    );
};
