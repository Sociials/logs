'use client';

import React from 'react';

interface LogEntryProps {
    id: string;
    content: string;
    timestamp: string;
    author: string;
    index: number;
}

export default function LogEntry({ content, timestamp, author, index }: LogEntryProps) {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    return (
        <div
            className="log-entry"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="log-header">
                <span className="log-prefix">[{String(index + 1).padStart(3, '0')}]</span>
                <span className="log-timestamp">{formattedDate} {formattedTime}</span>
                <span className="log-author">@{author}</span>
            </div>
            <div className="log-content">
                <span className="log-arrow">▸</span>
                <span className="log-message">{content}</span>
            </div>
        </div>
    );
}
