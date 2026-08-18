export interface OverallStats {
  totalMessages: number;
  totalWords: number;
  totalMedia: number;
  totalLinks: number;
  participantCount: number;
  mostActiveParticipant: string;
  avgMessagesPerDay: number;
}

export interface UserStat {
  name: string;
  messages: number;
  words: number;
  media: number;
  activityPercentage: number;
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

export interface ChatAnalysisData {
  id?: string;
  fileName: string;
  uploadedAt: string;
  overall: OverallStats;
  userAnalysis: UserStat[];
  timeAnalysis: TimeAnalysis;
  contentAnalysis: ContentAnalysis;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
