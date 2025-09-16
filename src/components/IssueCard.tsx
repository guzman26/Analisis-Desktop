import React, { useState } from 'react';
import { Card, Button } from '@/components/design-system';
import { Issue } from '@/types';
import '../styles/designSystem.css';
import './IssueCard.css';
import { updateIssueStatus } from '@/api/endpoints';

interface IssueCardProps {
  issue: Issue;
  /** Optional click handler to show more details */
  onClick?: () => void;
  /** Optional callback when status changes */
  onStatusChange?: (newStatus: string) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onClick,
  onStatusChange,
}) => {
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(issue.status);
  console.log('issue', issue);

  // Fecha normalizada DD/MM/YYYY
  const formattedDate = `${new Date(issue.createdAt).toLocaleDateString(
    'es-ES',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  )}`;

  // Compute CSS class for status badge based on current status
  const statusClass = `status-badge ${currentStatus
    .toLowerCase()
    .replace('_', '-')}`;

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'RESOLVED', label: 'Resuelto' },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(newStatus);
    try {
      console.log('issue.id', issue.id);
      await updateIssueStatus(issue.id, newStatus);
      setCurrentStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch {
      // Optionally show error
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Card
      variant="default"
      isHoverable
      isPressable={!!onClick}
      onClick={onClick}
      className="issue-card"
    >
      {/* Header: Date & Status */}
      <div className="issue-card-header macos-hstack">
        <span className="issue-date macos-text-headline">{formattedDate}</span>
        <span className={statusClass}>{currentStatus}</span>
      </div>

      {/* Title */}
      {issue.title && (
        <div className="issue-title">
          <span className="macos-text-callout issue-title-text">
            {issue.title}
          </span>
        </div>
      )}

      {/* Secondary Info: ID */}
      <div className="issue-secondary macos-hstack">
        <span className="label macos-text-footnote">ID:</span>
        <span className="value macos-text-footnote">{issue.id}</span>
      </div>

      {/* Description */}
      <div className="issue-description macos-stack">
        <span className="label macos-text-footnote">Descripción:</span>
        <p className="macos-text-body description-text">{issue.description}</p>
      </div>

      {/* Status Update Buttons */}
      <div className="issue-actions macos-hstack">
        {statusOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={currentStatus === opt.value ? 'primary' : 'secondary'}
            size="small"
            disabled={currentStatus === opt.value || !!updating}
            isLoading={updating === opt.value}
            onClick={() => handleStatusChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default IssueCard;
