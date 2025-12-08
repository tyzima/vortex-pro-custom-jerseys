import React from 'react';

export const BasketballIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2.5 12h19" />
        <path d="M12 2.5c0 5.5-2.5 10.5-6 13.5" />
        <path d="M12 2.5c0 5.5 2.5 10.5 6 13.5" />
        <path d="M12 21.5c0-5.5-2.5-10.5-6-13.5" />
        <path d="M12 21.5c0-5.5 2.5-10.5 6-13.5" />
    </svg>
);

export const SoccerIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7l-4 3v5l4 3 4-3v-5z" />
        <path d="M12 7V2.5" />
        <path d="M8 10L4 7" />
        <path d="M8 15l-4 3" />
        <path d="M16 15l4 3" />
        <path d="M16 10l4-3" />
        <path d="M12 18v4.5" />
    </svg>
);

export const LacrosseIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M19 5L5 19" />
        <path d="M5 5l14 14" />
        <circle cx="12" cy="12" r="2" />
        <path d="M17 7l2-2" />
        <path d="M7 17l-2 2" />
        <path d="M7 7l-2-2" />
        <path d="M17 17l2 2" />
    </svg>
);

export const TrainingIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M6.5 4h11" />
        <path d="M6.5 20h11" />
        <path d="M12 4v16" />
        <path d="M4 8h16" />
        <path d="M4 16h16" />
        <rect x="4" y="8" width="16" height="8" rx="2" />
    </svg>
);
