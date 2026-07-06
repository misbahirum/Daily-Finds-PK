import React from 'react';
import { Instagram } from 'lucide-react';
import { SiPinterest } from 'react-icons/si';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-16 py-12">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col items-center text-center space-y-6">
        <div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Daily <span className="text-primary">Finds</span> PK
          </span>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Your trusted friend scouring Daraz and Pakistani online stores to handpick the best home, kitchen, and lifestyle deals for you.
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <a href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="p-2 rounded-full bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" aria-label="Pinterest">
            <SiPinterest className="h-5 w-5" />
          </a>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground/80 max-w-lg mx-auto">
            Disclaimer: Some links on this website are affiliate links. I may earn a commission at no extra cost to you if you make a purchase through these links. This helps keep the curation going!
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            &copy; {new Date().getFullYear()} Daily Finds PK. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
