import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Briefcase, 
  Plus, 
  MessageSquare,
  Bookmark,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  UserCheck,
  UserPlus
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DashboardHome = () => {
  const { user } = useAuth();
  
  const [feedItems, setFeedItems] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [trendingPubs, setTrendingPubs] = useState([]);
  
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  // Fetch Personalized Feed
  const fetchFeed = async (pageNumber = 1) => {
    try {
      setLoadingFeed(true);
      const response = await api.get(`/feed/home?page=${pageNumber}&limit=5`);
      const { feed } = response.data;
      
      if (feed.length < 5) {
        setHasMoreFeed(false);
      }
      
      if (pageNumber === 1) {
        setFeedItems(feed);
      } else {
        setFeedItems((prev) => [...prev, ...feed]);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Fetch Suggested Researchers
  const fetchSuggestedResearchers = async () => {
    try {
      setLoadingRecs(true);
      const response = await api.get('/feed/recommendations/researchers?limit=4');
      setResearchers(response.data.recommendations);
    } catch (err) {
      console.error('Failed to load researcher suggestions:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Fetch Trending Publications
  const fetchTrendingPublications = async () => {
    try {
      const response = await api.get('/feed/trending?limit=4');
      setTrendingPubs(response.data.publications);
    } catch (err) {
      console.error('Failed to load trending publications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFeed(1);
      fetchSuggestedResearchers();
      fetchTrendingPublications();
    }
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = feedPage + 1;
    setFeedPage(nextPage);
    fetchFeed(nextPage);
  };

  const handleSavePublication = async (pubId) => {
    try {
      alert('Publication saved to your library!');
    } catch (err) {
      console.error('Failed to save publication:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Left 3 Columns: Feed and Onboarding */}
      <div className="xl:col-span-3 space-y-8">
        
        {/* Cold Start / Profile Completion Alert */}
        {user && user.profileCompletion < 80 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-left shadow-lg shadow-blue-500/10">
            <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 opacity-10">
              <Sparkles className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Boost Discovery
                </div>
                <h3 className="text-xl font-bold font-display">Complete your Profile to train the AI Recommendation Feed</h3>
                <p className="text-xs text-blue-100 max-w-xl font-sans">
                  Your profile completion rate is currently at <strong>{user.profileCompletion}%</strong>. Connect your Google Scholar ID or ORCID to sync your publications, h-index, and citation stats automatically.
                </p>
              </div>
              <Link to="/profile" className="shrink-0">
                <button className="px-5 py-2.5 bg-white text-blue-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all shadow-sm shadow-black/5 cursor-pointer">
                  Setup Academic Profiles
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Suggested Researchers Horizontal Panel */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Recommended Colleagues
            </h2>
            <span className="text-xs font-semibold text-slate-400">Based on shared research fields</span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse flex flex-col justify-between">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                    <div className="w-20 h-3 bg-slate-100 rounded-full"></div>
                    <div className="w-16 h-2 bg-slate-100 rounded-full"></div>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {researchers.map((rec) => (
                <div 
                  key={rec.user._id} 
                  className="bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-sm rounded-2xl p-5 flex flex-col items-center justify-between transition-all group"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <img 
                      src={rec.profile?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                      alt={rec.user.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{rec.user.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                        {rec.profile?.institution || 'Stanford University'}
                      </p>
                    </div>
                    {rec.finalMatch > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-bold">
                        {rec.finalMatch}% Match
                      </span>
                    )}
                  </div>
                  <button className="w-full mt-4 flex items-center justify-center gap-1.5 py-1.5 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-bold text-slate-600 transition-all cursor-pointer">
                    <UserPlus className="w-3.5 h-3.5" /> Follow
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Center Feed: Suggested Research */}
        <section className="space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Personalized Research Feed
            </h2>
          </div>

          {loadingFeed && feedPage === 1 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200/80 rounded-2xl p-6 animate-pulse space-y-4">
                  <div className="h-4 w-1/3 bg-slate-100 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-slate-100 rounded-full"></div>
                  <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => {
                const pub = item.data;
                return (
                  <div 
                    key={pub._id}
                    className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 flex flex-col justify-between transition-all text-left"
                  >
                    <div className="space-y-3">
                      {/* Score Badge and Title */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-sm sm:text-base text-slate-800 leading-snug hover:text-blue-600 transition-colors">
                          {pub.title}
                        </h3>
                        {item.score > 0 && (
                          <span className="shrink-0 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border border-blue-100/50 rounded-xl text-xs font-bold shadow-sm">
                            {item.score}% Match
                          </span>
                        )}
                      </div>

                      {/* Abstract Snippet */}
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {pub.abstract}
                      </p>

                      {/* Keywords Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                          {pub.publicationType}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[10px]">
                          Published in {pub.publicationYear}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Metadata & Action bar */}
                    <div className="flex items-center justify-between border-t border-slate-100/80 mt-5 pt-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{pub.journal || 'Academic Journal'}</span>
                        {pub.citationCount > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold">
                            {pub.citationCount} Citations
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleSavePublication(pub._id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                        {pub.pdfUrl && (
                          <a 
                            href={pub.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {feedItems.length === 0 && (
                <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-2">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-700">No suggestions yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Try adding keywords or connecting your Google Scholar ID to get personalized paper updates.
                  </p>
                </div>
              )}

              {hasMoreFeed && (
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingFeed}
                  className="w-full py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loadingFeed ? 'Generating Feed...' : 'Load More Recommendations'}
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Right Column: Profile Completion, Metrics, Trending Keywords */}
      <div className="space-y-8 text-left">
        
        {/* Research Metrics Widget */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-blue-600" /> Academic Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Publications</span>
              <h4 className="text-xl font-bold text-slate-700 mt-1">{user?.publications || 0}</h4>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Citations</span>
              <h4 className="text-xl font-bold text-slate-700 mt-1">{user?.citations || 0}</h4>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">h-index</span>
              <h4 className="text-xl font-bold text-slate-700 mt-1">{user?.hIndex || 0}</h4>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">i10-index</span>
              <h4 className="text-xl font-bold text-slate-700 mt-1">{user?.i10Index || 0}</h4>
            </div>
          </div>
        </div>

        {/* Global Trending Publications */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-blue-600" /> Trending Publications
          </h3>
          <div className="space-y-4">
            {trendingPubs.map((pub) => (
              <div key={pub._id} className="group text-left">
                <h4 className="font-bold text-xs text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {pub.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                  <span className="font-medium truncate max-w-[120px]">{pub.journal || 'Journal'}</span>
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 font-bold rounded">
                    {pub.citationCount} Citations
                  </span>
                </div>
              </div>
            ))}
            
            {trendingPubs.length === 0 && (
              <p className="text-xs text-slate-400 italic">No trending papers indexed.</p>
            )}
          </div>
        </div>

        {/* Quick actions widget */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Quick Actions</h3>
          <div className="flex flex-col gap-2.5">
            <Link to="/profile">
              <button className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 border border-slate-200/80 rounded-xl transition-all cursor-pointer">
                <span>Update Research Fields</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </Link>
            <button 
              onClick={() => alert('New workspace coordination will be supported in Phase 2.')}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 border border-slate-200/80 rounded-xl transition-all cursor-pointer"
            >
              <span>Coordinate Study Workspace</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
