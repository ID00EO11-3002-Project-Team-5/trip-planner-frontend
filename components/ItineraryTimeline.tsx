"use client";
import { useMemo } from 'react';

interface TimelineActivity {
  id: string;
  title: string;
  date: string;
  time: string;
  cost?: number;
  duration?: number; // in hours
}

interface ItineraryTimelineProps {
  activities: TimelineActivity[];
}

// Helper functions moved outside component for React Compiler optimization
function parseTime(time: string): number {
  if (!time) return 0;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1]) * 60 + parseInt(match[2]);
}

function formatTime(time: string): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  const hour = parseInt(match[1]);
  const minute = match[2];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'No date') return dateStr;
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getTimePosition(time: string): number {
  const minutes = parseTime(time);
  // Map 0-1440 minutes (24 hours) to 0-100%
  // Start display at 6 AM (360 minutes) for better visualization
  const displayStart = 360; // 6 AM
  const displayEnd = 1320; // 10 PM
  const displayRange = displayEnd - displayStart;
  
  if (minutes < displayStart) return 0;
  if (minutes > displayEnd) return 100;
  
  return ((minutes - displayStart) / displayRange) * 100;
}

export function ItineraryTimeline({ activities }: ItineraryTimelineProps) {
  // Group activities by date and sort
  const timeline = useMemo(() => {
    const grouped: Record<string, TimelineActivity[]> = {};
    
    activities.forEach((activity) => {
      const date = activity.date || 'No date';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(activity);
    });

    // Sort each day's activities by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const timeA = parseTime(a.time);
        const timeB = parseTime(b.time);
        return timeA - timeB;
      });
    });

    // Sort dates
    return Object.entries(grouped).sort((a, b) => {
      const dateA = new Date(a[0]).getTime();
      const dateB = new Date(b[0]).getTime();
      return dateA - dateB;
    });
  }, [activities]);

  if (activities.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No activities scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Timeline View</h3>
        <div className="text-xs text-slate-500">
          Showing {activities.filter(a => a.time).length} timed activities
        </div>
      </div>

      {/* Time scale header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-2">
          <span>6 AM</span>
          <span>9 AM</span>
          <span>12 PM</span>
          <span>3 PM</span>
          <span>6 PM</span>
          <span>9 PM</span>
        </div>
        <div className="h-1 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 dark:from-slate-700 dark:via-blue-900 dark:to-slate-700 rounded-full"></div>
      </div>

      {/* Timeline by date */}
      {timeline.map(([date, dayActivities]) => {
        const dayTotal = dayActivities.reduce((sum, a) => sum + (a.cost || 0), 0);
        const timedActivities = dayActivities.filter(a => a.time);
        
        return (
          <div key={date} className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div>
                <div className="font-medium">{formatDate(date)}</div>
                <div className="text-xs text-slate-500">
                  {dayActivities.length} activities
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  ${dayTotal.toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">total</div>
              </div>
            </div>

            {/* Gantt-style timeline */}
            {timedActivities.length > 0 ? (
              <div className="relative space-y-2">
                {timedActivities.map((activity) => {
                  const position = getTimePosition(activity.time);
                  const duration = activity.duration || 1;
                  const width = (duration / 16) * 100; // 16 hours display window
                  
                  return (
                    <div key={activity.id} className="relative h-10">
                      <div
                        className="absolute h-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                        style={{
                          left: `${position}%`,
                          width: `${Math.max(width, 15)}%`,
                        }}
                        title={`${formatTime(activity.time)} - ${activity.title}${activity.cost ? ` ($${activity.cost})` : ''}`}
                      >
                        <div className="flex items-center justify-between h-full">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-medium">{formatTime(activity.time)}</span>
                            <span className="text-xs truncate">{activity.title}</span>
                          </div>
                          {activity.cost && activity.cost > 0 && (
                            <span className="text-xs font-semibold ml-2">${activity.cost}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic text-center py-4">
                No scheduled activities for this day
              </div>
            )}

            {/* List unscheduled activities */}
            {dayActivities.filter(a => !a.time).length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                <div className="text-xs text-slate-500 mb-1">Unscheduled:</div>
                <div className="space-y-1">
                  {dayActivities.filter(a => !a.time).map((activity) => (
                    <div key={activity.id} className="text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>• {activity.title}</span>
                      {activity.cost && activity.cost > 0 && (
                        <span className="text-xs font-medium">${activity.cost}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
