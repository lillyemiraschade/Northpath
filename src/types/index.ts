import type { PostStatus } from "@prisma/client";

export interface LinkedInAccountSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  profileUrl: string | null;
  postCount: number;
  scheduledCount: number;
}

export interface PostWithAccount {
  id: string;
  content: string;
  mediaUrls: string[];
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  linkedInAccount: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface AnalyticsSummary {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  followerCount: number;
  impressionsTrend: number[];
  engagementTrend: number[];
}

export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  status: PostStatus;
  accountName: string;
}
