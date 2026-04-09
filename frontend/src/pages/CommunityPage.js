import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Send, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'employment', label: 'Employment' },
  { value: 'consumer_rights', label: 'Consumer' },
  { value: 'landlord_dispute', label: 'Landlord' },
  { value: 'women_rights', label: "Women's Rights" },
  { value: 'police_matter', label: 'Police' },
  { value: 'family_law', label: 'Family' },
  { value: 'property', label: 'Property' },
  { value: 'other', label: 'Other' },
];

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answeringId, setAnsweringId] = useState(null);

  const [newQuestion, setNewQuestion] = useState({ title: '', description: '', category: 'other' });

  useEffect(() => {
    loadQuestions();
  }, [categoryFilter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getCommunityQuestions(null, categoryFilter || null);
      setQuestions(data.questions || []);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (questionId) => {
    try {
      const result = await api.upvoteQuestion(questionId);
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, upvotes: result.upvotes } : q));
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.title.trim()) {
      toast.error('Please enter a question title');
      return;
    }
    try {
      const result = await api.createCommunityQuestion({
        ...newQuestion,
        user_id: user?.id || null,
        user_name: user?.email?.split('@')[0] || 'Anonymous',
        language: 'en',
      });
      setQuestions(prev => [result, ...prev]);
      setNewQuestion({ title: '', description: '', category: 'other' });
      setShowForm(false);
      toast.success('Question posted!');
    } catch (error) {
      toast.error('Failed to post question');
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!answerText.trim()) return;
    try {
      await api.answerQuestion(questionId, {
        text: answerText,
        user_id: user?.id || null,
        user_name: user?.email?.split('@')[0] || 'Anonymous',
      });
      setAnswerText('');
      setAnsweringId(null);
      loadQuestions();
      toast.success('Answer posted!');
    } catch (error) {
      toast.error('Failed to post answer');
    }
  };

  const catColor = (cat) => {
    const colors = { employment: '#FF6B00', consumer_rights: '#00E676', landlord_dispute: '#D500F9', women_rights: '#FF4081', police_matter: '#FF9800', family_law: '#2196F3', property: '#4CAF50', other: '#9E9E9E' };
    return colors[cat] || '#9E9E9E';
  };

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="community-page">
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-[#D500F9]" /> Community Q&A
            </h1>
            <p className="text-white/60 text-sm mt-1">Ask questions, share knowledge</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary text-sm px-4 py-2"
            data-testid="ask-question-btn"
          >
            {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showForm ? 'Cancel' : 'Ask'}
          </button>
        </div>

        {/* New Question Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#111742] border border-white/10 rounded-xl p-5 mb-6"
          >
            <input
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
              className="w-full bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] mb-3"
              placeholder="What's your legal question?"
              data-testid="question-title-input"
            />
            <textarea
              value={newQuestion.description}
              onChange={(e) => setNewQuestion({...newQuestion, description: e.target.value})}
              className="w-full bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] min-h-[80px] mb-3"
              placeholder="Add details (optional)..."
              data-testid="question-description-input"
            />
            <div className="flex gap-3">
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                className="bg-[#0A0D29] border border-white/20 rounded-xl px-4 py-2 text-white"
              >
                {CATEGORIES.filter(c => c.value).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button onClick={handleSubmitQuestion} className="btn-primary flex-1" data-testid="submit-question-btn">
                <Send className="w-4 h-4 mr-2" /> Post Question
              </button>
            </div>
          </motion.div>
        )}

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.value ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                className="bg-[#111742] border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                data-testid={`question-card-${index}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Upvote */}
                    <button
                      onClick={() => handleUpvote(q.id)}
                      className="flex flex-col items-center gap-1 text-white/50 hover:text-[#00E676] transition-colors pt-1"
                      data-testid={`upvote-${q.id}`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="text-sm font-bold">{q.upvotes || 0}</span>
                    </button>

                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{q.title}</h3>
                      {q.description && <p className="text-sm text-white/60 mb-2">{q.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catColor(q.category)}20`, color: catColor(q.category) }}>
                          {q.category?.replace(/_/g, ' ')}
                        </span>
                        <span>{q.user_name}</span>
                        <span>{q.answers?.length || 0} answers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="text-white/40 hover:text-white"
                    >
                      {expandedId === q.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded answers */}
                {expandedId === q.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-white/10 bg-[#0A0D29]/50"
                  >
                    {q.answers?.length > 0 ? (
                      q.answers.map((a, ai) => (
                        <div key={a.id || ai} className="p-4 border-b border-white/5 last:border-b-0">
                          <p className="text-sm text-white/80">{a.text}</p>
                          <p className="text-xs text-white/40 mt-2">- {a.user_name}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-white/40 text-center">No answers yet</div>
                    )}

                    {/* Answer input */}
                    <div className="p-4 border-t border-white/10">
                      {answeringId === q.id ? (
                        <div className="flex gap-2">
                          <input
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="flex-1 bg-[#111742] border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40"
                            placeholder="Write your answer..."
                            data-testid={`answer-input-${q.id}`}
                          />
                          <button onClick={() => handleSubmitAnswer(q.id)} className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg text-sm font-semibold">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAnsweringId(q.id); setAnswerText(''); }}
                          className="text-sm text-[#FF6B00] font-semibold hover:underline"
                        >
                          Write an answer...
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No questions yet. Be the first to ask!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default CommunityPage;
