import { TimelineEvent } from '@/utils/timelineBuilder';

interface ProductionTimelineProps {
  events: TimelineEvent[];
  emptyText?: string;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDotClass(kind?: TimelineEvent['kind']): string {
  switch (kind) {
    case 'success':
      return 'bg-emerald-500';
    case 'warning':
      return 'bg-amber-500';
    case 'danger':
      return 'bg-red-500';
    default:
      return 'bg-slate-400';
  }
}

export const ProductionTimeline = ({
  events,
  emptyText = 'Sin eventos para mostrar.',
}: ProductionTimelineProps) => {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="relative pl-6">
          {index < events.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-[calc(100%+8px)] w-px bg-border" />
          ) : null}
          <span
            className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ${getDotClass(event.kind)}`}
          />
          <div className="rounded-md border bg-background px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {formatDateTime(event.timestamp)}
            </p>
            <p className="text-sm font-medium text-foreground">{event.title}</p>
            {event.description ? (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
};

