export interface OverallStats {
  totalMessages: number;
  totalWords: number;
  totalMedia: number;
  totalLinks: number;
  participantCount: number;
  mostActiveParticipant: string;
  avgMessagesPerDay: number;
  mostActiveDay?: string;
  peakActivityDate?: string;
  overallMood?: string;
}


export interface UserStat {
  name: string;
  messages: number;
  words: number;
  media: number;
  activityPercentage: number;
  avgWordsPerMessage?: number;
}

export interface TimePoint {
  date?: string;
  month?: string;
  day?: string;
  hour?: number;
  count: number;
}

export interface TimeAnalysis {
  byDate: TimePoint[];
  byMonth: TimePoint[];
  byDayOfWeek: TimePoint[];
  byHour: TimePoint[];
}

export interface WordStat {
  word: string;
  count: number;
}

export interface EmojiStat {
  emoji: string;
  count: number;
}

export interface SharedLink {
  url: string;
  sharedBy: string;
  date: string;
}

export interface ContentAnalysis {
  topWords: WordStat[];
  topEmojis: EmojiStat[];
  sharedLinks: SharedLink[];
  mediaStats: {
    totalMedia: number;
    mediaByParticipant: Record<string, number>;
  };
}

export interface SentimentAnalysis {
  positiveCount: number;
  positivePercentage: number;
  neutralCount: number;
  neutralPercentage: number;
  negativeCount: number;
  negativePercentage: number;
  overallMood: string;
}


export interface VelocityAnalysis {
  peakDate: string;
  peakDateCount: number;
  peakHour: string;
  peakHourCount: number;
  longestMessage?: {
    author: string;
    message: string;
    wordCount: number;
    date: string;
  } | null;
}

export interface ChatMessagePreview {
  author: string;
  message: string;
  date: string;
  isMedia: boolean;
}

export interface ChatAnalysisData {
  id?: string;
  fileName: string;
  uploadedAt: string;
  overall: OverallStats;
  userAnalysis: UserStat[];
  timeAnalysis: TimeAnalysis;
  contentAnalysis: ContentAnalysis;
  sentimentAnalysis?: SentimentAnalysis;
  velocityAnalysis?: VelocityAnalysis;
  chatPreview?: ChatMessagePreview[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
