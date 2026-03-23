"use client";

import { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

interface Props {
  selectedAccountId: string | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-400",
  SCHEDULED: "bg-blue-500",
  PUBLISHING: "bg-yellow-500",
  PUBLISHED: "bg-green-500",
  FAILED: "bg-red-500",
};

export default function CalendarView({ selectedAccountId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    const month = format(currentMonth, "yyyy-MM");
    const params = new URLSearchParams({ month });
    if (selectedAccountId) params.set("accountId", selectedAccountId);

    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []));
  }, [currentMonth, selectedAccountId]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function getPostDate(post: Post): Date | null {
    if (post.scheduledAt) return new Date(post.scheduledAt);
    if (post.publishedAt) return new Date(post.publishedAt);
    return new Date(post.createdAt);
  }

  function getPostsForDay(day: Date) {
    return posts.filter((p) => {
      const d = getPostDate(p);
      return d && isSameDay(d, day);
    });
  }

  const selectedDayPosts = selectedDay ? getPostsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded p-1 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded p-1 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="bg-gray-50 px-2 py-2 text-center text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const dayPosts = getPostsForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(selected ? null : day)}
                className={cn(
                  "min-h-[80px] bg-white p-2 text-left transition-colors hover:bg-gray-50",
                  !inMonth && "bg-gray-50 text-gray-300",
                  selected && "ring-2 ring-blue-500 ring-inset"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    today && "bg-blue-600 text-white font-bold",
                    !today && inMonth && "text-gray-900",
                    !today && !inMonth && "text-gray-300"
                  )}
                >
                  {format(day, "d")}
                </span>
                {dayPosts.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayPosts.slice(0, 3).map((p) => (
                      <span
                        key={p.id}
                        className={cn("h-1.5 w-1.5 rounded-full", statusColors[p.status] ?? "bg-gray-400")}
                        title={`${p.linkedInAccount.name}: ${p.content.slice(0, 40)}`}
                      />
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-gray-400">+{dayPosts.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400" /> Draft</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Scheduled</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Published</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Failed</span>
        </div>
      </div>

      {selectedDay && (
        <div className="rounded-lg border bg-white p-6">
          <h3 className="font-semibold mb-3">
            {format(selectedDay, "EEEE, MMMM d, yyyy")}
          </h3>
          {selectedDayPosts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts on this day.</p>
          ) : (
            <ul className="space-y-3">
              {selectedDayPosts.map((post) => (
                <li key={post.id} className="flex items-start gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {post.linkedInAccount.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium">{post.linkedInAccount.name}</span>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          post.status === "PUBLISHED" ? "bg-green-100 text-green-700" :
                          post.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                          post.status === "FAILED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        )}
                      >
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-600 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
