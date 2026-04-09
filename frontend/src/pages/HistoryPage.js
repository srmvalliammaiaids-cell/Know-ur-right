import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Bookmark, ChevronRight, Search, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const severityColors = { urgent: '#FF4081', moderate: '#FF6B00', informational: '#00E676' };
const catColors = { employment: '#FF6B00', consumer_rights: '#00E676', landlord_dispute: '#D500F9', women_rights: '#FF4081', police_matter: '#FF9800', property: '#4CAF50', family_law: '#2196F3', sc_st_rights: '#E91E63', criminal: '#F44336', other: '#9E9E9E' };

const HistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | bookmarked

  useEffect(() => {
    loadQueries();
  }, []);

  const loadQueries = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const data = await api.getUserQueries(user.id, 50);
      setQueries(data.queries || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (queryId) => {
    try {
      const result = await api.toggleBookmark(queryId);
      setQueries(prev => prev.map(q => q.id === queryId ? { ...q, is_bookmarked: result.is_bookmarked } : q));
      toast.success(result.is_bookmarked ? 'Bookmarked!' : 'Removed bookmark');
    } catch (error) {
      toast.error('Failed to bookmark');
    }
  };

  const filtered = filter === 'bookmarked' ? queries.filter(q => q.is_bookmarked) : queries;

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="history-page">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Clock className="w-7 h-7 text-[#FF6B00]" /> Query History
            </h1>
            <p className="text-white/60 text-sm mt-1">{queries.length} queries</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${filter === 'all' ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-white/60'}`}
            data-testid="filter-all"
          >
            All
          </button>
          <button
            onClick={() => setFilter('bookmarked')}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-1 ${filter === 'bookmarked' ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-white/60'}`}
            data-testid="filter-bookmarked"
          >
            <Bookmark className="w-4 h-4" /> Saved
          </button>
        </div>

        {/* Query list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-xl font-bold text-white/60 mb-2">
              {filter === 'bookmarked' ? 'No saved queries' : 'No queries yet'}
            </p>
            <p className="text-white/40 mb-6">
              {filter === 'bookmarked' ? 'Bookmark queries to find them here' : 'Ask your first legal question'}
            </p>
            <button onClick={() => navigate('/query')} className="btn-primary">
              Ask a Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((q, index) => (
              <motion.div
                key={q.id}
                className="bg-[#111742] border border-white/10 rounded-xl p-4 hover:border-white/20 cursor-pointer transition-all"
                onClick={() => navigate(`/result/${q.id}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                data-testid={`history-item-${index}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{q.original_text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${catColors[q.category] || '#555'}20`, color: catColors[q.category] || '#aaa' }}>
                        {q.category?.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${severityColors[q.severity] || '#555'}20`, color: severityColors[q.severity] || '#aaa' }}>
                        {q.severity}
                      </span>
                      <span className="text-xs text-white/40">{q.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBookmark(q.id); }}
                      className={`p-2 rounded-lg transition-all ${q.is_bookmarked ? 'text-[#FF6B00] bg-[#FF6B00]/10' : 'text-white/30 hover:text-white/60'}`}
                      data-testid={`bookmark-${q.id}`}
                    >
                      <Bookmark className="w-4 h-4" fill={q.is_bookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default HistoryPage;
