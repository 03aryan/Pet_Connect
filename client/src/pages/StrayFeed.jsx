import { useState, useEffect } from 'react';
import { BowlIcon, LocationIcon, ClockIcon, UsersIcon, CheckCircleIcon, AlertIcon, HeartIcon } from '../icons';
import { apiRequest } from '../lib/api';

const tabs = [
  { key: 'all', label: 'All Updates' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'good', label: 'Good News' },
];

export default function StrayFeed() {
  const [activeTab, setActiveTab] = useState('all');
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadStrays = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/strays?limit=20', { signal: controller.signal });
        setFeedData(data.reports || []);
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Failed to load stray feed', err);
      } finally {
        setLoading(false);
      }
    };
    loadStrays();
    return () => controller.abort();
  }, []);

  const filtered = feedData.filter((f) => activeTab === 'all' || f.type === activeTab);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.round(diffHours / 24)} days ago`;
  };

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5 animate-pulse-dot">
          <BowlIcon className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Stray Feed</h1>
        <p className="mt-3 text-gray-500 max-w-lg mx-auto">
          Real-time updates on stray animals in your area. Help, share, or celebrate — every action matters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                : 'bg-white/60 text-gray-500 border border-beige-dark/30 hover:border-primary/30 hover:text-primary-dark hover:scale-105'
            }`}
          >
            {tab.key === 'urgent' && <AlertIcon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
            {tab.key === 'good' && <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-beige-dark/30 hidden sm:block" />

        <div className="space-y-5 stagger-grid">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Loading live updates...</div>
          ) : filtered.length === 0 ? (
             <div className="text-center py-10 text-gray-400">No updates found.</div>
          ) : filtered.map((item, index) => {
            const isUrgent = item.type === 'urgent';
            return (
              <div key={item._id || index} className="relative sm:pl-14 group animate-fade-in-up">
                {/* Timeline dot */}
                <div className={`
                  hidden sm:flex absolute left-[11px] top-6 w-[18px] h-[18px] rounded-full border-[3px] items-center justify-center transition-transform group-hover:scale-125
                  ${isUrgent
                    ? 'bg-red-100 border-red-400'
                    : 'bg-green-100 border-green-400'
                  }
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isUrgent ? 'bg-red-500' : 'bg-green-500'}`} />
                </div>

                {/* Card */}
                <div className={`
                  glass-card rounded-2xl overflow-hidden
                  ${isUrgent
                    ? 'hover:border-red-200/60'
                    : ''
                  }
                `}>
                  {/* Top accent */}
                  <div className={`h-1 ${isUrgent ? 'bg-gradient-to-r from-red-400 to-orange-400' : 'bg-gradient-to-r from-green-400 to-emerald-400'}`} />

                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                    {item.imageURL && (
                      <div className="sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0">
                         <img src={item.imageURL} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      {/* Badge + time */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`
                          inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider
                          ${isUrgent
                            ? 'bg-red-50 text-red-600'
                            : 'bg-green-50 text-green-600'
                          }
                        `}>
                          {isUrgent
                            ? <><AlertIcon className="w-3.5 h-3.5" /> Urgent</>
                            : <><CheckCircleIcon className="w-3.5 h-3.5" /> Good News</>
                          }
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {formatTime(item.createdAt)}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h2>

                      {/* Description */}
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">{item.description}</p>

                      {/* Location + helpers */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <LocationIcon className="w-3.5 h-3.5 text-primary" />
                            {item.location}
                          </div>
                          {item.helpersCount > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <UsersIcon className="w-3.5 h-3.5 text-primary" />
                              {item.helpersCount} helper{item.helpersCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        {isUrgent ? (
                          <button className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 active:scale-[0.98]">
                            Offer Help
                          </button>
                        ) : (
                          <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-primary-dark border border-primary/30 rounded-xl hover:bg-primary/10 transition-all duration-200">
                            <HeartIcon className="w-3.5 h-3.5" />
                            Celebrate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
