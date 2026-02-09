'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface Embed {
    title?: string;
    description?: string;
    url?: string;
    color?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
}

interface Attachment {
    id: string;
    url: string;
    filename: string;
    isImage: boolean;
}

interface MessageContentProps {
    content: string;
    embeds: Embed[];
    attachments: Attachment[];
}

// Parse Discord custom emojis: <:name:id> or <a:name:id> (animated)
function parseDiscordEmojis(text: string): string {
    // Replace custom emojis with img tags
    return text.replace(
        /<(a?):(\w+):(\d+)>/g,
        (_, animated, name, id) => {
            const ext = animated ? 'gif' : 'png';
            return `![${name}](https://cdn.discordapp.com/emojis/${id}.${ext}?size=24)`;
        }
    );
}

// Parse Discord user mentions: <@id> or <@!id>
function parseDiscordMentions(text: string): string {
    return text.replace(/<@!?(\d+)>/g, '**@user**');
}

// Parse Discord channel mentions: <#id>
function parseDiscordChannels(text: string): string {
    return text.replace(/<#(\d+)>/g, '**#channel**');
}

// Parse Discord role mentions: <@&id>
function parseDiscordRoles(text: string): string {
    return text.replace(/<@&(\d+)>/g, '**@role**');
}

// Parse Discord timestamps: <t:timestamp:format>
function parseDiscordTimestamps(text: string): string {
    return text.replace(/<t:(\d+)(?::[tTdDfFR])?>/g, (_, timestamp) => {
        const date = new Date(parseInt(timestamp) * 1000);
        return date.toLocaleString();
    });
}

// Parse Discord underline: __text__
function parseDiscordUnderline(text: string): string {
    return text.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
}

// Parse Discord spoiler: ||text||
function parseDiscordSpoiler(text: string): string {
    return text.replace(/\|\|([\s\S]+?)\|\|/g, '<span class="spoiler">$1</span>');
}

// Parse Discord strikethrough: ~~text~~ (multiline supported)
function parseDiscordStrikethrough(text: string): string {
    return text.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
}

export default function MessageContent({ content, embeds, attachments }: MessageContentProps) {
    // Process content for Discord-specific formatting
    let processedContent = content;
    processedContent = parseDiscordEmojis(processedContent);
    processedContent = parseDiscordMentions(processedContent);
    processedContent = parseDiscordChannels(processedContent);
    processedContent = parseDiscordRoles(processedContent);
    processedContent = parseDiscordTimestamps(processedContent);
    processedContent = parseDiscordUnderline(processedContent);
    processedContent = parseDiscordSpoiler(processedContent);
    processedContent = parseDiscordStrikethrough(processedContent);

    return (
        <div className="message-content-wrapper">
            {/* Main content with markdown */}
            {processedContent && (
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            // Custom image renderer for emojis
                            img: ({ src, alt }) => {
                                const isEmoji = typeof src === 'string' && src.includes('cdn.discordapp.com/emojis');
                                if (isEmoji) {
                                    return (
                                        <img
                                            src={src}
                                            alt={alt || 'emoji'}
                                            className="discord-emoji"
                                        />
                                    );
                                }
                                return (
                                    <img
                                        src={src}
                                        alt={alt || 'image'}
                                        className="content-image"
                                    />
                                );
                            },
                            // Style links
                            a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer" className="content-link">
                                    {children}
                                </a>
                            ),
                            // Style code blocks
                            code: ({ className, children }) => {
                                const isBlock = typeof className === 'string' && className.includes('language-');
                                if (isBlock) {
                                    return <code className="code-block">{children}</code>;
                                }
                                return <code className="inline-code">{children}</code>;
                            },
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
            )}

            {/* Attachments (images) */}
            {attachments.length > 0 && (
                <div className="attachments">
                    {attachments.map((att) => (
                        att.isImage ? (
                            <img
                                key={att.id}
                                src={att.url}
                                alt={att.filename}
                                className="attachment-image"
                            />
                        ) : (
                            <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="attachment-file"
                            >
                                📎 {att.filename}
                            </a>
                        )
                    ))}
                </div>
            )}

            {/* Embeds */}
            {embeds.length > 0 && (
                <div className="embeds">
                    {embeds.map((embed, index) => (
                        <div
                            key={index}
                            className="embed"
                            style={{ borderLeftColor: embed.color || '#5865f2' }}
                        >
                            {embed.thumbnailUrl && (
                                <img
                                    src={embed.thumbnailUrl}
                                    alt="thumbnail"
                                    className="embed-thumbnail"
                                />
                            )}
                            {embed.title && (
                                <div className="embed-title">
                                    {embed.url ? (
                                        <a href={embed.url} target="_blank" rel="noopener noreferrer">
                                            {embed.title}
                                        </a>
                                    ) : (
                                        embed.title
                                    )}
                                </div>
                            )}
                            {embed.description && (
                                <div className="embed-description">
                                    <ReactMarkdown>{embed.description}</ReactMarkdown>
                                </div>
                            )}
                            {embed.imageUrl && (
                                <img
                                    src={embed.imageUrl}
                                    alt="embed image"
                                    className="embed-image"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
