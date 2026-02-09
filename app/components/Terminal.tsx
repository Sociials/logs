'use client';

import React from 'react';

interface TerminalProps {
    title?: string;
    children: React.ReactNode;
}

export default function Terminal({ title = 'logs@sociials:~', children }: TerminalProps) {
    return (
        <div className="terminal-window">
            {/* Terminal Header */}
            <div className="terminal-header">
                <div className="terminal-buttons">
                    <span className="terminal-btn close"></span>
                    <span className="terminal-btn minimize"></span>
                    <span className="terminal-btn maximize"></span>
                </div>
                <div className="terminal-title">{title}</div>
                <div className="terminal-buttons invisible">
                    <span className="terminal-btn"></span>
                    <span className="terminal-btn"></span>
                    <span className="terminal-btn"></span>
                </div>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
                {/* Scanline Overlay */}
                <div className="scanlines"></div>

                {/* Content */}
                <div className="terminal-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
