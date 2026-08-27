import React, { useState } from 'react';
import { DiscussionEmbed } from 'disqus-react';

interface DiscussionTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  badge: string;
  badgeColor: string;
  popularCommentsCount?: number;
}

const DISCUSSION_TOPICS: DiscussionTopic[] = [
  {
    id: 'general-commuters',
    title: 'Singapore Commuter Forum & Daily Transit Chat',
    category: 'General',
    description: 'Discuss daily travel tips, peak hour shortcuts, interchange navigations, and fare optimization.',
    icon: 'chat',
    badge: 'Trending',
    badgeColor: 'bg-primary/10 text-primary',
    popularCommentsCount: 24,
  },
  {
    id: 'mrt-bus-delay-reports',
    title: 'Crowdsourced MRT & Bus Delay Reports',
    category: 'Real-Time Updates',
    description: 'Share on-the-ground observations of train delays, bus bunching, track faults, and heavy crowds.',
    icon: 'report_problem',
    badge: 'Live Updates',
    badgeColor: 'bg-amber-100 text-amber-900',
    popularCommentsCount: 18,
  },
  {
    id: 'station-amenities-feedback',
    title: 'MRT Station Amenities, Accessibility & Lifts',
    category: 'Infrastructure',
    description: 'Feedback on stroller/wheelchair access, lift maintenance, bicycle parking, and sheltered linkways.',
    icon: 'accessible',
    badge: 'Commuter Feedback',
    badgeColor: 'bg-emerald-100 text-emerald-900',
    popularCommentsCount: 12,
  },
  {
    id: 'green-commute-carbon',
    title: 'Green Commute & Carbon Savings Discussion',
    category: 'Eco Mobility',
    description: 'Share active mobility experiences, walking connectors, cycling paths, and carbon offset milestones.',
    icon: 'eco',
    badge: 'Eco Living',
    badgeColor: 'bg-teal-100 text-teal-900',
    popularCommentsCount: 9,
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh_TW', label: '繁體中文 (Traditional Chinese)' },
  { code: 'zh', label: '简体中文 (Simplified Chinese)' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
];

export const CommunityView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic>(DISCUSSION_TOPICS[0]);
  const [language, setLanguage] = useState<string>('en');
  const [customShortname, setCustomShortname] = useState<string>('smarttransport');
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  // Construct URL and identifier for the topic
  const pageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/community/${selectedTopic.id}`
    : `https://smarttransport.sg/community/${selectedTopic.id}`;

  const disqusConfig = {
    url: pageUrl,
    identifier: `smarttransport-topic-${selectedTopic.id}`,
    title: selectedTopic.title,
    language: language,
  };

  return (
    <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/70 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[32px]">forum</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                Commuter Community Forum
              </h1>
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                Disqus Live
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Connect with fellow Singapore commuters. Report delays, share route tips, review station amenities, and discuss public transport improvements in real-time.
            </p>
          </div>
        </div>

        {/* Language & Config Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
          <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-xl border border-outline-variant/60">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">translate</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
              title="Select Disqus interface language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/60 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            title="Disqus Configuration"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>
        </div>
      </div>

      {/* Advanced Settings Drawer */}
      {isConfigOpen && (
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/80 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between animate-in fade-in duration-150">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface">Disqus Forum Shortname</span>
            <span className="text-xs text-on-surface-variant">
              Embed configured with shortname <code className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{customShortname}</code>
            </span>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={customShortname}
              onChange={(e) => setCustomShortname(e.target.value)}
              placeholder="e.g. smarttransport"
              className="px-3 py-1.5 text-xs bg-surface rounded-lg border border-outline-variant focus:border-primary focus:outline-none w-full md:w-48 font-mono"
            />
            <button
              onClick={() => setIsConfigOpen(false)}
              className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Channels on Left, DiscussionEmbed on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Discussion Channels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">
            Discussion Channels
          </h2>

          <div className="flex flex-col gap-2.5">
            {DISCUSSION_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-surface border-primary ring-1 ring-primary shadow-xs'
                      : 'bg-surface hover:bg-surface-container-low border-outline-variant/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1.5 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{topic.icon}</span>
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">{topic.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${topic.badgeColor}`}>
                      {topic.badge}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold leading-snug ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {topic.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant line-clamp-2">{topic.description}</p>
                </div>
              );
            })}
          </div>

          {/* Guidelines Box */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 text-xs text-on-surface-variant flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span>Community Guidelines</span>
            </div>
            <p>
              Please keep discussions respectful and constructive. Report verified delays to assist fellow travelers.
            </p>
          </div>
        </div>

        {/* Right Column: Active Disqus Thread Embed */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl p-6 md:p-8 border border-outline-variant/70 shadow-xs flex flex-col gap-6">
            {/* Thread Header */}
            <div className="border-b border-outline-variant/60 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1.5">
                <span className="material-symbols-outlined text-[16px]">{selectedTopic.icon}</span>
                <span>{selectedTopic.category} Channel</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-on-surface">
                {selectedTopic.title}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                {selectedTopic.description}
              </p>
            </div>

            {/* Disqus DiscussionEmbed Component */}
            <div className="min-h-[400px] w-full" id={`disqus-embed-wrapper-${selectedTopic.id}`}>
              <DiscussionEmbed
                key={`${customShortname}-${selectedTopic.id}-${language}`}
                shortname={customShortname}
                config={disqusConfig}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
