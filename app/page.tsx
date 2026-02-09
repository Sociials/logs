'use client';

import { useEffect, useState, useCallback } from 'react';
import MessageContent from './components/MessageContent';

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

interface Message {
  id: string;
  content: string;
  timestamp: string;
  author: string;
  authorAvatar: string | null;
  embeds: Embed[];
  attachments: Attachment[];
}

type TabType = 'announcements' | 'status';

type StatusColor = 'green' | 'orange' | 'red' | 'gray';

function getStatusColor(content: string): StatusColor {
  // Check for specific emoji IDs first (prioritize last occurrence)
  const EMOJI_IDS = {
    GREEN: '583069431131799562',   // Fixed
    ORANGE: '583069404540174359',  // Issue
    RED: '585068644258676766',     // Down
  };
  console.log(content);
  if (content.includes(EMOJI_IDS.GREEN)) return 'green';
  if (content.includes(EMOJI_IDS.ORANGE)) return 'orange';
  if (content.includes(EMOJI_IDS.RED)) return 'red';

  // Fallback to keyword detection
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('fixed') ||
    lowerContent.includes('resolved') ||
    lowerContent.includes('completed') ||
    lowerContent.includes('operational') ||
    lowerContent.includes('deployed') ||
    lowerContent.includes('stable')) {
    return 'green';
  }

  if (lowerContent.includes('investigating') ||
    lowerContent.includes('monitoring') ||
    lowerContent.includes('identified') ||
    lowerContent.includes('issue') ||
    lowerContent.includes('maintenance') ||
    lowerContent.includes('looking for')) {
    return 'orange';
  }

  if (lowerContent.includes('down') ||
    lowerContent.includes('outage') ||
    lowerContent.includes('failure') ||
    lowerContent.includes('critical') ||
    lowerContent.includes('offline')) {
    return 'red';
  }

  return 'gray';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('announcements');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMessages = useCallback(async (type: TabType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages?type=${type}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.messages);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(activeTab);
    const interval = setInterval(() => fetchMessages(activeTab), 60000);
    return () => clearInterval(interval);
  }, [activeTab, fetchMessages]);

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setMessages([]);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="site-header">
        <div className="site-logo">SOCIIALS / LOGS</div>
        <nav className="site-nav">
          <a href="https://sociials.com" target="_blank" rel="noopener noreferrer">
            Home
          </a>
          <a href="https://discord.gg/aaGvaMmrXA" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          Status Updates & Announcements
        </h1>
        <p className="hero-subtitle">
          Live feed from our Discord server. All updates, announcements,
          and status changes in one place.
        </p>
      </section>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
        >
          Announcements
        </button>
        <button
          className={`tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => handleTabChange('status')}
        >
          Status
        </button>
      </div>

      {/* Status Row */}
      <div className="status-row">
        <div className="status-item">
          <span className={`status-dot ${loading ? 'loading' : 'online'}`}></span>
          <span>{loading ? 'Syncing' : 'Connected'}</span>
        </div>
        <div className="status-item">
          <span>{messages.length} messages</span>
        </div>
        {lastUpdated && (
          <div className="status-item">
            <span>Updated {formatTime(lastUpdated.toISOString())}</span>
          </div>
        )}
      </div>

      {/* Logs Section */}
      <section className="logs-section">
        <h2 className="section-title">
          {activeTab === 'announcements' ? 'Recent Announcements' : 'Status Updates'}
        </h2>

        {loading && (
          <div className="loading-state">
            <span className="spinner"></span>
            Fetching {activeTab} from Discord...
          </div>
        )}

        {error && (
          <div className="error-state">
            <div className="error-title">Unable to load messages</div>
            <div className="error-message">
              {error}. Check that your Discord credentials are configured.
            </div>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="empty-state">
            No {activeTab} yet.
          </div>
        )}

        {!loading && !error && messages.length > 0 && (
          <div className="log-list">
            {messages.map((message, index) => (
              <article
                key={message.id}
                className="log-item"
                style={{ animationDelay: `${index * 60}ms` }}
              >

                <div className="log-meta">
                  {activeTab === 'status' && (

                    <span className={`status-dot status-${getStatusColor(message.content)}`} title="Status Indicator"></span>
                  )}
                  <span className="log-index">#{String(index + 1).padStart(2, '0')}</span>
                  <span className="log-date">{formatDate(message.timestamp)}</span>
                  <span className="log-author">@{message.author}</span>
                </div>
                <MessageContent
                  content={message.content}
                  embeds={message.embeds}
                  attachments={message.attachments}
                />
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ASCII Art Banner */}
      <pre className="ascii-banner" aria-hidden="true">
        {`
███████╗ ██████╗  ██████╗██╗██╗ █████╗ ██╗     ███████╗
██╔════╝██╔═══██╗██╔════╝██║██║██╔══██╗██║     ██╔════╝
███████╗██║   ██║██║     ██║██║███████║██║     ███████╗
╚════██║██║   ██║██║     ██║██║██╔══██║██║     ╚════██║
███████║╚██████╔╝╚██████╗██║██║██║  ██║███████╗███████║
╚══════╝ ╚═════╝  ╚═════╝╚═╝╚═╝╚══════╝╚══════╝╚══════╝`}
      </pre>

      {/* Footer */}
      <footer className="site-footer">
        <span>Auto-refresh every 60s</span>
        <a
          href="https://sociials.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          sociials.com →
        </a>
      </footer>
    </div>
  );
}
