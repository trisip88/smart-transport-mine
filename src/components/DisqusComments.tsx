import React from 'react';
import { DiscussionEmbed, CommentCount, CommentEmbed } from 'disqus-react';

export interface DisqusCommentsProps {
  shortname?: string;
  identifier: string;
  title: string;
  url?: string;
  language?: string;
  className?: string;
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  shortname = 'smarttransport',
  identifier,
  title,
  url,
  language = 'en',
  className = '',
}) => {
  const currentUrl = typeof window !== 'undefined' ? (url || window.location.href) : url || 'https://smarttransport.sg';

  const disqusConfig = {
    url: currentUrl,
    identifier: identifier,
    title: title,
    language: language,
  };

  return (
    <div className={`disqus-container bg-surface p-4 md:p-6 rounded-2xl border border-outline-variant/70 shadow-xs ${className}`}>
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant/60">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">forum</span>
          </span>
          <div>
            <h3 className="font-bold text-sm md:text-base text-on-surface">Commuter Community & Live Discussion</h3>
            <p className="text-xs text-on-surface-variant">Share transit tips, line feedback, and crowd updates</p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2.5 py-1 bg-surface-container-high rounded-full border border-outline-variant/50 text-on-surface-variant">
          Disqus #{shortname}
        </span>
      </div>

      <div className="min-h-[250px] w-full">
        <DiscussionEmbed shortname={shortname} config={disqusConfig} />
      </div>
    </div>
  );
};
