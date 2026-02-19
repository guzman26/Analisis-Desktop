import { ChangeIndicator } from '@/utils/periodComparison';

export interface StoryInput {
  title: string;
  value: string;
  trend?: ChangeIndicator;
  detail?: string;
}

export interface StoryCardData {
  key: string;
  title: string;
  body: string;
  tone: 'neutral' | 'positive' | 'warning';
}

function formatTrend(trend?: ChangeIndicator): string {
  if (!trend) return '';
  if (trend.isNeutral) return 'sin cambios vs periodo anterior';
  const direction = trend.isPositive ? 'subio' : 'bajo';
  return `${direction} ${Math.abs(trend.percentage).toFixed(1)}% vs periodo anterior`;
}

function detectTone(trend?: ChangeIndicator): 'neutral' | 'positive' | 'warning' {
  if (!trend || trend.isNeutral) return 'neutral';
  return trend.isPositive ? 'positive' : 'warning';
}

export function buildStoryCards(stories: StoryInput[]): StoryCardData[] {
  return stories.map((story) => {
    const trendText = formatTrend(story.trend);
    const detailText = story.detail ? ` ${story.detail}` : '';
    const body = `${story.value}${trendText ? `, ${trendText}` : ''}.${detailText}`.trim();
    return {
      key: story.title.toLowerCase().replace(/\s+/g, '-'),
      title: story.title,
      body,
      tone: detectTone(story.trend),
    };
  });
}

