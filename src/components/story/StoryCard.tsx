import { Card } from '@/components/design-system';
import { cn } from '@/lib/utils';

interface StoryCardProps {
  title: string;
  body: string;
  tone?: 'neutral' | 'positive' | 'warning';
}

const toneClasses: Record<NonNullable<StoryCardProps['tone']>, string> = {
  neutral: 'border-border',
  positive: 'border-emerald-300 bg-emerald-50/40',
  warning: 'border-amber-300 bg-amber-50/40',
};

export const StoryCard = ({ title, body, tone = 'neutral' }: StoryCardProps) => {
  return (
    <Card className={cn('rounded-xl border p-4', toneClasses[tone])}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </Card>
  );
};

