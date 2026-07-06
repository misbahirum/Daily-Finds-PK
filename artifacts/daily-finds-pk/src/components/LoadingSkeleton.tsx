import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border animate-pulse h-full">
          <div className="w-full aspect-4/3 bg-muted" />
          <div className="p-5 flex flex-col flex-1">
            <div className="h-3 w-24 bg-muted rounded mb-3" />
            <div className="h-5 w-3/4 bg-muted rounded mb-2" />
            <div className="h-5 w-1/2 bg-muted rounded mb-4" />
            
            <div className="h-3 w-full bg-muted rounded mb-2" />
            <div className="h-3 w-4/5 bg-muted rounded mb-6" />
            
            <div className="h-6 w-20 bg-muted rounded mb-5 mt-auto" />
            
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-muted rounded-xl" />
              <div className="h-10 w-10 bg-muted rounded-xl flex-shrink-0" />
              <div className="h-10 w-10 bg-muted rounded-xl flex-shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
