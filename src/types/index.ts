import type { PostStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

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
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
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
}

export interface AnalyticsDataPoint {
  date: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  content: string;
  status: PostStatus;
  accountName: string;
  accountId: string;
}
