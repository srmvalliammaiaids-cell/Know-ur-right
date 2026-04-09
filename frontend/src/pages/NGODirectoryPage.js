import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Globe, Search, Filter, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal'
];

const SPECIALIZATIONS = [
  { value: 'legal_aid', label: 'Legal Aid' },
  { value: 'women_rights', label: "Women's Rights" },
  { value: 'consumer_rights', label: 'Consumer Rights' },
  { value: 'sc_st_rights', label: 'SC/ST Rights' },
  { value: 'children', label: 'Child Rights' },
  { value: 'human_rights', label: 'Human Rights' },
  { value: 'employment', label: 'Employment' },
  { value: 'family_law', label: 'Family Law' },
  { value: 'domestic_violence', label: 'Domestic Violence' },
];

const specColors = {
  legal_aid: '#FF6B00', women_rights: '#D500F9', consumer_rights: '#00E676',
  sc_st_rights: '#FF4081', children: '#00BCD4', human_rights: '#FF9800',
  employment: '#2196F3', family_law: '#9C27B0', domestic_violence: '#F44336',
  free_legal_help: '#4CAF50', trafficking: '#E91E63', product_safety: '#FFC107',
  juvenile_justice: '#00ACC1',
};

const NGODirectoryPage = () => {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadNGOs();
  }, [stateFilter, specFilter]);

  const loadNGOs = async () => {
    setLoading(true);
    try {
      const data = await api.getNGOs(stateFilter || null, null, specFilter || null);
      setNgos(data.ngos || []);
    } catch (error) {
      toast.error('Failed to load NGOs');
    } finally {
      setLoading(false);
    }
  };

  const filtered = searchText
    ? ngos.filter(n => n.name?.toLowerCase().includes(searchText.toLowerCase()) || n.description?.toLowerCase().includes(searchText.toLowerCase()))
    : ngos;

  return (
    <div className="min-h-screen bg-[#0A0D29] text-white pb-24" data-testid="ngo-directory-page">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <button onClick={() => navigate('/home')} className="text-white/60 hover:text-white mb-4 text-sm font-medium">
          &larr; Back to Home
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-8 h-8 text-[#00E676]" />
            <h1 className="text-2xl sm:text-3xl font-bold">NGO Directory</h1>
          </div>
          <p className="text-white/60 mb-6">Find legal aid organizations near you</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full min-h-[48px] bg-[#111742] border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-all"
              placeholder="Search NGOs..."
              data-testid="ngo-search-input"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="flex-1 min-h-[44px] bg-[#111742] border border-white/20 rounded-xl px-4 py-2 text-white focus:border-[#FF6B00] transition-all"
              data-testid="state-filter"
            >
              <option value="">All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="flex-1 min-h-[44px] bg-[#111742] border border-white/20 rounded-xl px-4 py-2 text-white focus:border-[#FF6B00] transition-all"
              data-testid="spec-filter"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-white/50 mb-4">{filtered.length} organizations found</p>

        {/* NGO Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/60">Loading NGOs...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((ngo, index) => (
              <motion.div
                key={ngo.id || index}
                className="bg-[#111742] border border-white/10 rounded-xl p-5 hover:border-[#00E676]/30 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`ngo-card-${index}`}
              >
                <h3 className="text-lg font-bold text-white mb-2">{ngo.name}</h3>
                <p className="text-sm text-white/60 mb-3">{ngo.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {ngo.specializations?.map((spec, i) => (
                    <span key={i} className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${specColors[spec] || '#555'}20`, color: specColors[spec] || '#aaa' }}>
                      {spec.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-white/60">
                    <MapPin className="w-4 h-4" /> {ngo.district}, {ngo.state}
                  </div>
                  {ngo.phone && (
                    <a href={`tel:${ngo.phone}`} className="flex items-center gap-1 text-[#00E676] hover:underline">
                      <Phone className="w-4 h-4" /> {ngo.phone}
                    </a>
                  )}
                  {ngo.website && (
                    <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#FF6B00] hover:underline">
                      <ExternalLink className="w-4 h-4" /> Website
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No NGOs found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default NGODirectoryPage;
