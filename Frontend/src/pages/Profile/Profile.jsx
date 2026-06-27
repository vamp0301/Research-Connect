import React, { useState, useEffect } from 'react';
import { 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  BookOpen, 
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  BookMarked,
  Share2,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useScholarImport } from '../../hooks/auth.hooks';
import api from '../../services/api';
import ScholarImportWizard from '../../features/profile/ScholarImportWizard.jsx';

const ProfilePage = () => {
  const { user } = useAuth();
  const { importProfile, loading: importLoading, error: importError } = useScholarImport();

  const [profileData, setProfileData] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('About');
  const [scholarIdInput, setScholarIdInput] = useState('');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const tabs = ['About', 'Education', 'Experience', 'Research Interests', 'Publications', 'Projects', 'Achievements'];

  // Fetch real profile details and publications on mount
  const fetchProfileDetails = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfileData(response.data.profile);
      setPublications(response.data.publications || []);
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [user]); // Re-fetch whenever context user changes

  const handleScholarImport = async (e) => {
    e.preventDefault();
    if (!scholarIdInput.trim()) return;
    
    let authorId = scholarIdInput.trim();
    if (authorId.includes('user=')) {
      authorId = authorId.split('user=')[1].split('&')[0];
    } else if (authorId.includes('author/')) {
      authorId = authorId.split('author/')[1].split('?')[0];
    }

    const result = await importProfile(authorId);
    if (result.success) {
      setImportSuccess(true);
      setScholarIdInput('');
      fetchProfileDetails(); // Force reload local state
      setTimeout(() => setImportSuccess(false), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading profile details...</p>
      </div>
    );
  }

  // Fallbacks mapping to Google Scholar mock data or real profiles
  const fullName = profileData?.user?.fullName || 'Dr. Arjun Sharma';
  const designation = profileData?.designation || 'Associate Professor';
  const department = profileData?.department || 'Department of Computer Science & Engineering';
  const institution = profileData?.institution || 'Indian Institute of Technology, Delhi';
  const locationText = profileData?.city && profileData?.country 
    ? `${profileData.city}, ${profileData.country}` 
    : (profileData?.country && profileData.country !== 'Not Specified' ? profileData.country : 'New Delhi, India');
  
  const bioText = profileData?.bio || 'I am an Associate Professor specializing in Machine Learning, Deep Learning, and Natural Language Processing. My research focuses on developing intelligent systems that solve real-world problems. I have published extensively in top-tier journals and conferences and actively collaborate on interdisciplinary research projects.';
  const emailText = profileData?.user?.email || 'arjun.sharma@iitd.ac.in';
  
  return (
    <div className="flex flex-col gap-8">
      {/* Google Scholar Sync Banner Card */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-200/30 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div className="space-y-1.5">
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /> Google Scholar Integration
          </h4>
          <p className="text-xs text-slate-500 max-w-xl">
            {profileData?.academicProfile?.googleScholar 
              ? `Connected with Scholar ID: ${profileData.academicProfile.googleScholar}. Keep publications, citations, and co-authors sync-locked.`
              : 'Auto-populate your academic metrics, citations index, co-authors network, and papers directly from your Google Scholar profile.'}
          </p>
        </div>
        
        {profileData?.academicProfile?.googleScholar ? (
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  await api.put('/profile/google-scholar/sync');
                  await fetchProfileDetails();
                  alert('Sync completed successfully!');
                } catch (err) {
                  alert(err.response?.data?.message || 'Sync failed.');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-blue-500/10"
            >
              <RefreshCw className="w-4 h-4" /> Sync Latest
            </button>
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to unlink your Google Scholar profile?')) {
                  setLoading(true);
                  try {
                    await api.delete('/profile/google-scholar/unlink');
                    await fetchProfileDetails();
                    alert('Google Scholar profile unlinked.');
                  } catch (err) {
                    alert(err.response?.data?.message || 'Unlink failed.');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Unlink Account
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowImportPanel(!showImportPanel)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-sm shadow-blue-500/10"
          >
            <RefreshCw className="w-4 h-4" /> Link Profile Now
          </button>
        )}
      </div>

      {/* Interactive Scholar Import Input Panel */}
      {showImportPanel && !profileData?.academicProfile?.googleScholar && (
        <ScholarImportWizard 
          onImportComplete={async () => {
            setShowImportPanel(false);
            setLoading(true);
            await fetchProfileDetails();
            alert('Import completed successfully!');
          }}
          onCancel={() => setShowImportPanel(false)}
        />
      )}

      {/* Main Profile Header Banner */}
      <div className="glass-card rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm relative">
        {/* Cover Photo */}
        <div className="h-52 bg-slate-100 relative overflow-hidden">
          <img 
            src={profileData?.coverPhoto || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200'}
            alt="Cover Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Details Container */}
        <div className="px-8 pb-8 pt-0 flex flex-col md:flex-row items-start gap-6 text-left relative -mt-16 z-10">
          {/* Profile Photo */}
          <div className="relative shrink-0">
            <img 
              src={profileData?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
              alt={fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
            />
          </div>

          {/* User Text Info */}
          <div className="flex-1 pt-16 md:pt-20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                  {fullName}
                  <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50/50" />
                </h2>
                <p className="text-sm font-semibold text-blue-600 mt-2">{designation}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-500/5">
                  Edit Profile
                </button>
                <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-colors cursor-pointer">
                  Share Profile
                </button>
              </div>
            </div>

            {/* Department Details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {department}</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> {institution}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {locationText}</span>
            </div>

            {/* Academic Social Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 bg-lime-50 text-lime-700 border border-lime-200/50 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                ORCID
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/50 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                Google Scholar
              </span>
              <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200/50 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                Scopus
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                ResearchGate
              </span>
              <span className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200/50 rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                LinkedIn
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="border-t border-slate-100 px-8 flex overflow-x-auto gap-6 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Changes dynamically based on activeTab) */}
        <div className="lg:col-span-2 flex flex-col gap-8 text-left">
          
          {activeTab === 'About' && (
            <>
              {/* About Section */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-display">About Me</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-sans">{bioText}</p>
                <a href="#" className="text-xs font-bold text-blue-600 hover:underline inline-block">Read more</a>
              </div>

              {/* Academic & Professional Information Details */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900 font-display">Academic & Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Full Name</span>
                      <span className="font-semibold text-slate-800">{fullName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Date of Birth</span>
                      <span className="font-semibold text-slate-800">15 March 1985</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Designation</span>
                      <span className="font-semibold text-slate-800">{designation}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Department</span>
                      <span className="font-semibold text-slate-800">{department.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Institution</span>
                      <span className="font-semibold text-slate-800">{institution}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">ORCID ID</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        0000-0002-1234-5678 <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Google Scholar</span>
                      <span className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        {profileData?.academicProfile?.googleScholar || 'View Profile'} <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Scopus ID</span>
                      <span className="font-semibold text-slate-800">57219908847</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">LinkedIn</span>
                      <span className="font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer">
                        View Profile <ExternalLink className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">GitHub</span>
                      <span className="font-semibold text-slate-800 hover:underline flex items-center gap-1 cursor-pointer">
                        github.com/arjunsharma
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</span>
                      <span className="font-semibold text-slate-800 truncate">{emailText}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                      <span className="font-semibold text-slate-800">+91 98765 43210</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Website</span>
                      <span className="font-semibold text-blue-600 hover:underline truncate cursor-pointer">
                        https://arjunsharma.in
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Publications' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 font-display">Publications ({publications.length})</h3>
                <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Publication
                </button>
              </div>

              {publications.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500 font-medium">No publications found.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try syncing your Google Scholar profile at the top of the dashboard to auto-populate your publications.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-slate-100">
                  {publications.map((pub, idx) => (
                    <div key={pub._id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-3 text-left group`}>
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {pub.title}
                        </h4>
                        
                        {/* Citations Badge */}
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-xl text-[10px] font-bold shrink-0">
                          {pub.citationCount} citations
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-sans">
                        {pub.abstract}
                      </p>

                      {/* Co-authors list */}
                      {pub.authors && pub.authors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400 font-sans">
                          <span className="font-semibold text-slate-500">Authors:</span>
                          {pub.authors.map((author, index) => {
                            // Highlight the current user in bold
                            const isCurrentUser = author.user === user?.user?._id || author.authorName.toLowerCase().includes(fullName.toLowerCase());
                            return (
                              <span key={author._id}>
                                <span className={`${isCurrentUser ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                                  {author.authorName}
                                </span>
                                {index < pub.authors.length - 1 && ', '}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Paper details footer */}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-medium font-sans">
                        {pub.journal && (
                          <span className="italic">{pub.journal}</span>
                        )}
                        <span>Year: {pub.publicationYear}</span>
                        {pub.doi && (
                          <span className="hover:text-blue-600 cursor-pointer flex items-center gap-0.5">
                            DOI: {pub.doi} <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                        {pub.pdfUrl && (
                          <a 
                            href={pub.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            View PDF <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Education' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 font-display">Education</h3>
              <div className="space-y-6 relative pl-4 border-l-2 border-slate-100">
                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">Ph.D. in Computer Science</h4>
                      <p className="text-xs text-slate-500 mt-1">{institution}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2011 - 2016</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">M.Tech. in Computer Science</h4>
                      <p className="text-xs text-slate-500 mt-1">Indian Institute of Technology, Delhi</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2009 - 2011</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">B.Tech. in Computer Science</h4>
                      <p className="text-xs text-slate-500 mt-1">Delhi Technological University</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2005 - 2009</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Experience' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900 font-display">Experience</h3>
              <div className="space-y-6 relative pl-4 border-l-2 border-slate-100">
                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">{designation}</h4>
                      <p className="text-xs text-slate-500 mt-1">{institution}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2016 - Present</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">Assistant Professor</h4>
                      <p className="text-xs text-slate-500 mt-1">IIT Delhi</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2013 - 2016</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></div>
                  <div className="flex justify-between gap-4 flex-col sm:flex-row">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm font-sans">Research Scientist</h4>
                      <p className="text-xs text-slate-500 mt-1">TCS Research, Bangalore</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 shrink-0">2011 - 2013</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'About' && activeTab !== 'Publications' && activeTab !== 'Education' && activeTab !== 'Experience' && (
            <div className="glass-card rounded-3xl p-8 bg-white border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-display">{activeTab}</h3>
              <p className="text-sm text-slate-500 font-sans">
                This section contains verified data from your institutional records. Click Edit Profile to add new {activeTab.toLowerCase()}.
              </p>
            </div>
          )}
        </div>

        {/* Right Column (Metrics & Metadata Summary) */}
        <div className="flex flex-col gap-8 text-left">
          
          {/* Research Metrics Dashboard Card */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Research Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Publications</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">{profileData?.publications || publications.length}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Citations</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">{profileData?.citations || 0}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">h-index</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">{profileData?.hIndex || 0}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">i10-index</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">{profileData?.i10Index || 0}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4 text-sky-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Experience</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">{profileData?.experience || 10}+ Yrs</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <div className="flex items-center gap-2 text-slate-400">
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Areas</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-2">
                  {profileData?.researchAreas?.length || 7}
                </p>
              </div>
            </div>
          </div>

          {/* Research Areas */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Research Areas</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.researchAreas && profileData.researchAreas.length > 0 ? (
                profileData.researchAreas.map((area) => (
                  <span key={area._id} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100/50 rounded-xl text-xs font-medium transition-colors">
                    {area.researchArea?.areaName}
                  </span>
                ))
              ) : (
                ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Data Mining', 'AI Ethics', 'Healthcare AI'].map((area) => (
                  <span key={area} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100/50 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                    {area}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Top Keywords */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.keywords && profileData.keywords.length > 0 ? (
                profileData.keywords.map((kw) => (
                  <span key={kw._id} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold">
                    {kw.keyword?.keyword}
                  </span>
                ))
              ) : (
                ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Mining', 'AI', 'Text Classification', 'Neural Networks'].map((kw) => (
                  <span key={kw} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Profile Completeness Card */}
          <div className="glass-card rounded-3xl p-6 bg-white border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Profile Completeness</h3>
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#E2E8F0"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#2563EB"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - (profileData?.profileCompletion || 92) / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-extrabold text-slate-800">{profileData?.profileCompletion || 92}%</span>
              </div>

              <div className="text-left space-y-1">
                <p className="text-xs font-bold text-slate-800">Excellent! Profile almost complete.</p>
                <p className="text-[10px] text-slate-400">Complete remaining sections to boost network visibility by 4x.</p>
              </div>
            </div>

            {/* Items Checklist */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Basic Information</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Education History</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Professional Experience</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Research Interests</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Publications Uploaded</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Profile Photo & Cover</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
