import React from 'react';
import { Card } from '@/components/design-system';
import { Issue } from '@/types';
import '../styles/designSystem.css';

interface IssueCardProps {
  issue: Issue;
  /** Optional click handler to show more details */
  onClick?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick }) => {
  // Format creation date in Spanish locale (e.g. 04/06/2025, 16:19)
  const formattedDate = new Date(issue.createdAt).toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'var(--macos-orange)';
      case 'IN_PROGRESS':
        return 'var(--macos-yellow)';
      case 'CLOSED':
        return 'var(--macos-green)';
      default:
        return 'var(--macos-gray-3)';
    }
  };

  return (
    <Card
      variant="flat"
      isHoverable
      isPressable={!!onClick}
      onClick={onClick}
      padding="medium"
      style={{ width: '100%' }}
    >
      {/* Header: Date & Status */}
      <div
        className="macos-hstack"
        style={{
          justifyContent: 'space-between',
          marginBottom: 'var(--macos-space-2)',
        }}
      >
        <span className="macos-text-headline" style={{ fontWeight: 700 }}>
          {formattedDate}
        </span>
        <span
          className="macos-text-footnote"
          style={{
            backgroundColor: getStatusColor(issue.status),
            color: 'var(--macos-text-on-color)',
            padding: 'var(--macos-space-1) var(--macos-space-2)',
            borderRadius: 'var(--macos-radius-small)',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {issue.status}
        </span>
      </div>

      {/* Title */}
      {issue.title && (
        <div style={{ marginBottom: 'var(--macos-space-3)' }}>
          <span className="macos-text-callout" style={{ fontWeight: 600 }}>
            {issue.title}
          </span>
        </div>
      )}

      {/* Secondary Info: ID */}
      <div
        className="macos-hstack"
        style={{
          gap: 'var(--macos-space-1)',
          marginBottom: 'var(--macos-space-2)',
        }}
      >
        <span
          className="macos-text-footnote"
          style={{ color: 'var(--macos-text-secondary)', fontWeight: 600 }}
        >
          ID:
        </span>
        <span
          className="macos-text-footnote"
          style={{ fontFamily: 'monospace', fontWeight: 600 }}
        >
          {issue.id}
        </span>
      </div>

      {/* Description */}
      <div className="macos-stack" style={{ gap: 'var(--macos-space-1)' }}>
        <span
          className="macos-text-footnote"
          style={{ color: 'var(--macos-text-secondary)', fontWeight: 600 }}
        >
          Descripción:
        </span>
        <p className="macos-text-body" style={{ margin: 0 }}>
          {issue.description}
        </p>
      </div>
    </Card>
  );
};

export default IssueCard;
