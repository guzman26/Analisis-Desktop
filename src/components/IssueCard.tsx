import React, { useState } from 'react';
import { Button } from '@/components/design-system';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Issue } from '@/types';
import { issuesApi } from '@/modules/issues';

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

  const statusStyles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
  };

  const statusOptions = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'IN_PROGRESS', label: 'En progreso' },
    { value: 'RESOLVED', label: 'Resuelto' },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(newStatus);
    try {
      console.log('issue.id', issue.id);
      await issuesApi.updateStatus(issue.id, newStatus);
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
      onClick={onClick}
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{formattedDate}</span>
          <Badge className={statusStyles[currentStatus] || 'bg-muted'}>
            {currentStatus}
          </Badge>
        </div>

        {issue.title && (
          <div className="text-sm font-medium">{issue.title}</div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          ID: <span className="font-medium text-foreground">{issue.id}</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Descripción:</span>
          <p className="text-sm">{issue.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
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
      </CardContent>
    </Card>
  );
};

export default IssueCard;
