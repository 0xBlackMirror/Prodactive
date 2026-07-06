"use client";

import React, { useMemo, useState } from 'react';
import { Feature, Release } from '@/lib/store';
import { ArrowRight } from 'lucide-react';

interface GanttTimelineProps {
  features: Feature[];
  releases: Release[];
  onFeatureClick?: (feature: Feature) => void;
}

export function GanttTimeline({ features, releases, onFeatureClick }: GanttTimelineProps) {
  // Determine date bounds
  const bounds = useMemo(() => {
    let minTime = Infinity;
    let maxTime = -Infinity;

    // Default to today +/- 2 months if no dates
    const now = new Date();
    let hasDates = false;

    features.forEach(f => {
      if (f.startDate) {
        minTime = Math.min(minTime, new Date(f.startDate).getTime());
        hasDates = true;
      }
      if (f.targetDate) {
        maxTime = Math.max(maxTime, new Date(f.targetDate).getTime());
        hasDates = true;
      }
    });
    
    releases.forEach(r => {
      if (r.targetDate) {
        maxTime = Math.max(maxTime, new Date(r.targetDate).getTime());
        hasDates = true;
      }
      if (r.startDate) {
        minTime = Math.min(minTime, new Date(r.startDate).getTime());
        hasDates = true;
      }
    });

    if (!hasDates) {
      const today = new Date();
      minTime = new Date(today.setMonth(today.getMonth() - 1)).getTime();
      maxTime = new Date(today.setMonth(today.getMonth() + 3)).getTime();
    } else {
      // Add padding
      const padding = 1000 * 60 * 60 * 24 * 14; // 14 days
      minTime -= padding;
      maxTime += padding;
    }

    return { minTime, maxTime, totalDuration: maxTime - minTime };
  }, [features, releases]);

  const getDatePercent = (dateStr?: string) => {
    if (!dateStr) return null;
    const time = new Date(dateStr).getTime();
    return Math.max(0, Math.min(100, ((time - bounds.minTime) / bounds.totalDuration) * 100));
  };

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers = [];
    const curr = new Date(bounds.minTime);
    curr.setDate(1); // start of month
    
    while (curr.getTime() <= bounds.maxTime) {
      const pct = getDatePercent(curr.toISOString());
      if (pct !== null && pct >= 0 && pct <= 100) {
        markers.push({
          pct,
          label: curr.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
        });
      }
      curr.setMonth(curr.getMonth() + 1);
    }
    return markers;
  }, [bounds]);

  // Group features by release
  const groupedFeatures = useMemo(() => {
    const sortedFeatures = [...features].sort((a, b) => {
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aStart - bStart;
    });

    const groups: { release: Release | null, features: Feature[] }[] = [];
    
    const backlog = sortedFeatures.filter(f => !f.releaseId);
    if (backlog.length > 0) {
      groups.push({ release: null, features: backlog });
    }

    releases.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).forEach(r => {
      const releaseFeats = sortedFeatures.filter(f => f.releaseId === r.id);
      if (releaseFeats.length > 0 || r.targetDate) {
        groups.push({ release: r, features: releaseFeats });
      }
    });

    return groups;
  }, [features, releases]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
      
      {/* Header / Axis */}
      <div className="h-12 border-b border-border bg-muted/30 relative flex">
        <div className="w-64 flex-shrink-0 border-r border-border p-3 font-semibold text-sm">
          Plan
        </div>
        <div className="flex-1 relative overflow-hidden">
          {monthMarkers.map((marker, i) => (
            <div 
              key={i} 
              className="absolute top-0 bottom-0 border-l border-border/50 text-xs text-muted-foreground p-2"
              style={{ left: `${marker.pct}%` }}
            >
              {marker.label}
            </div>
          ))}
          {/* Today line */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-destructive/50 z-20"
            style={{ left: `${getDatePercent(new Date().toISOString())}%` }}
          >
            <div className="absolute top-0 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-1 rounded">Today</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-64 flex-shrink-0 border-r border-border" />
          <div className="flex-1 relative">
            {monthMarkers.map((marker, i) => (
              <div 
                key={i} 
                className="absolute top-0 bottom-0 border-l border-border/30"
                style={{ left: `${marker.pct}%` }}
              />
            ))}
            <div 
              className="absolute top-0 bottom-0 w-px bg-destructive/20"
              style={{ left: `${getDatePercent(new Date().toISOString())}%` }}
            />
          </div>
        </div>

        <div className="relative z-10 py-2">
          {groupedFeatures.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              
              {/* Release Header */}
              {group.release && (
                <div className="flex h-8 bg-accent/20 border-y border-border/50 mb-2">
                  <div className="w-64 flex-shrink-0 px-3 flex items-center text-sm font-bold text-primary">
                    v{group.release.version}
                  </div>
                  <div className="flex-1 relative">
                    {group.release.targetDate && (
                      <div 
                        className="absolute h-full w-px bg-primary flex items-center"
                        style={{ left: `${getDatePercent(group.release.targetDate)}%` }}
                      >
                        <div className="absolute right-2 text-[10px] font-bold text-primary whitespace-nowrap bg-background/80 px-1 rounded">
                          Release
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!group.release && (
                <div className="flex h-8 bg-muted/20 border-y border-border/50 mb-2">
                  <div className="w-64 flex-shrink-0 px-3 flex items-center text-sm font-bold text-muted-foreground">
                    Backlog (Unassigned)
                  </div>
                </div>
              )}

              {/* Features */}
              {group.features.map(feature => {
                const startPct = getDatePercent(feature.startDate) || 0;
                const endPct = getDatePercent(feature.targetDate) || 0;
                const hasDates = feature.startDate || feature.targetDate;
                
                const left = hasDates ? (feature.startDate ? startPct : endPct - 5) : 0;
                const width = hasDates && feature.startDate && feature.targetDate ? Math.max(endPct - startPct, 0.5) : 5;

                return (
                  <div key={feature.id} className="flex min-h-10 hover:bg-accent/10 border-b border-transparent hover:border-border/50 transition-colors">
                    <div className="w-64 flex-shrink-0 px-3 py-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        feature.priority === 'Critical' ? 'bg-destructive' :
                        feature.priority === 'High' ? 'bg-orange-500' :
                        feature.priority === 'Medium' ? 'bg-blue-500' : 'bg-muted-foreground'
                      }`} />
                      <span 
                        className="text-sm truncate cursor-pointer hover:underline"
                        onClick={() => onFeatureClick?.(feature)}
                      >
                        {feature.title}
                      </span>
                    </div>
                    <div className="flex-1 relative py-2">
                      {hasDates ? (
                        <div 
                          className={`absolute h-6 rounded-md shadow-sm border flex items-center px-2 cursor-pointer transition-transform hover:scale-[1.02] ${
                            feature.priority === 'Critical' ? 'bg-destructive/20 border-destructive/30 text-destructive' :
                            feature.priority === 'High' ? 'bg-orange-500/20 border-orange-500/30 text-orange-600 dark:text-orange-400' :
                            feature.priority === 'Medium' ? 'bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400' : 
                            'bg-muted border-border text-muted-foreground'
                          }`}
                          style={{ left: `${left}%`, width: `${width}%`, minWidth: '4px' }}
                          onClick={() => onFeatureClick?.(feature)}
                          title={`${feature.title}\n${feature.startDate} - ${feature.targetDate}`}
                        >
                          {width > 10 && <span className="text-xs truncate font-medium">{feature.title}</span>}
                        </div>
                      ) : (
                        <div className="h-full flex items-center px-2">
                          <span className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-0.5 rounded">Unscheduled</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
