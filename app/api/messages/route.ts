import { NextRequest, NextResponse } from 'next/server';

interface DiscordAuthor {
  id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
}

interface DiscordAttachment {
  id: string;
  url: string;
  proxy_url: string;
  filename: string;
  content_type?: string;
  width?: number;
  height?: number;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  image?: {
    url: string;
    proxy_url: string;
    width?: number;
    height?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url: string;
  };
}

interface DiscordMessage {
  id: string;
  content: string;
  timestamp: string;
  author: DiscordAuthor;
  embeds?: DiscordEmbed[];
  attachments?: DiscordAttachment[];
}

export interface FormattedEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface FormattedAttachment {
  id: string;
  url: string;
  filename: string;
  isImage: boolean;
}

export interface FormattedMessage {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  authorAvatar: string | null;
  embeds: FormattedEmbed[];
  attachments: FormattedAttachment[];
}

// Convert Discord color int to hex
function intToHex(color?: number): string | undefined {
  if (!color) return undefined;
  return '#' + color.toString(16).padStart(6, '0');
}

export async function GET(request: NextRequest) {
  const token = process.env.DISCORD_BOT_TOKEN;

  // Get channel type from query params
  const searchParams = request.nextUrl.searchParams;
  const channelType = searchParams.get('type') || 'announcements';

  // Get the appropriate channel ID based on type
  const channelId = channelType === 'status'
    ? process.env.DISCORD_STATUS_CHANNEL_ID
    : process.env.DISCORD_ANNOUNCEMENTS_CHANNEL_ID;

  if (!token || !channelId) {
    return NextResponse.json(
      { error: `Missing Discord configuration for ${channelType}` },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
      {
        headers: {
          Authorization: `Bot ${token}`,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Discord API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages from Discord' },
        { status: response.status }
      );
    }

    const messages: DiscordMessage[] = await response.json();

    // Format messages for frontend
    const formattedMessages: FormattedMessage[] = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      timestamp: msg.timestamp,
      author: msg.author.global_name || msg.author.username,
      authorAvatar: msg.author.avatar
        ? `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png`
        : null,
      embeds: (msg.embeds || []).map((embed) => ({
        title: embed.title,
        description: embed.description,
        url: embed.url,
        color: intToHex(embed.color),
        imageUrl: embed.image?.url,
        thumbnailUrl: embed.thumbnail?.url,
      })),
      attachments: (msg.attachments || []).map((att) => ({
        id: att.id,
        url: att.url,
        filename: att.filename,
        isImage: att.content_type?.startsWith('image/') ||
          /\.(png|jpg|jpeg|gif|webp)$/i.test(att.filename),
      })),
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching Discord messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
