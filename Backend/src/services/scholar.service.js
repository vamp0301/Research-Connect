import Publication from '../models/Publication.js';
import PublicationAuthor from '../models/PublicationAuthor.js';
import PublicationKeyword from '../models/PublicationKeyword.js';
import PublicationResearchArea from '../models/PublicationResearchArea.js';
import Profile from '../models/Profile.js';
import AcademicProfile from '../models/AcademicProfile.js';
import ResearchMetrics from '../models/ResearchMetrics.js';
import ResearchCollaborator from '../models/ResearchCollaborator.js';
import ResearchArea from '../models/ResearchArea.js';
import UserResearchArea from '../models/UserResearchArea.js';
import Keyword from '../models/Keyword.js';
import UserKeyword from '../models/UserKeyword.js';
import ActivityLog from '../models/ActivityLog.js';
import AppError from '../utils/AppError.js';

// Simple in-memory cache for SerpAPI responses
const serpApiCache = new Map();
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Extract Author ID from URL or input string
 */
export const extractAuthorId = (input) => {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Check if it's a URL
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const userParam = url.searchParams.get('user');
      if (userParam) {
        return userParam;
      }
    }
  } catch (err) {
    // Treat as potential plain ID
  }

  // Check if it matches Google Scholar ID format (12 characters, e.g. LsR1t3AAAAAJ)
  const idRegex = /^[a-zA-Z0-9_-]{12}$/;
  if (idRegex.test(trimmed)) {
    return trimmed;
  }

  return null;
};

/**
 * Fetch Profiles by Name (Search Fallback)
 */
export const searchAuthorByName = async (name) => {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    throw new AppError('SERP_API_KEY is not defined in environment variables.', 500);
  }

  const url = `https://serpapi.com/search.json?engine=google_scholar_profiles&mauthors=${encodeURIComponent(name)}&api_key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError(`SerpAPI returned status ${response.status}`, 502);
    }

    const data = await response.json();
    if (data.error) {
      throw new AppError(`SerpAPI Error: ${data.error}`, 400);
    }

    const profiles = data.profiles || [];
    return profiles.map((p) => ({
      name: p.name,
      authorId: p.author_id,
      affiliations: p.affiliations,
      email: p.email,
      thumbnail: p.thumbnail,
      interests: p.interests ? p.interests.map((i) => i.title) : [],
    }));
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Failed to fetch author profiles: ${error.message}`, 500);
  }
};

/**
 * Query SerpAPI with local caching
 */
const fetchAuthorDetailsFromAPI = async (authorId) => {
  const cacheKey = `scholar_${authorId}`;
  const cached = serpApiCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('⚡ Loading Scholar API payload from in-memory cache...');
    return cached.data;
  }

  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ SERP_API_KEY is missing. Falling back to Mock Scholar Data.');
    return getMockScholarData(authorId);
  }

  const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${authorId}&api_key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new AppError(`Google Scholar API returned status ${response.status}`, 502);
    }

    const data = await response.json();
    if (data.error) {
      throw new AppError(`Google Scholar API Error: ${data.error}`, 400);
    }

    // Save to cache
    serpApiCache.set(cacheKey, {
      timestamp: Date.now(),
      data,
    });

    return data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(`Google Scholar fetch failed: ${error.message}`, 500);
  }
};

/**
 * Fetch Scholar Import Preview
 */
export const getScholarImportPreview = async (input) => {
  let authorId = extractAuthorId(input);
  
  // If not a valid ID, assume it's a name and search for the author ID
  if (!authorId) {
    const matches = await searchAuthorByName(input);
    if (matches.length === 0) {
      throw new AppError(`No researcher profiles found for name: "${input}"`, 404);
    }
    // Return search matches list so user can choose which one to preview
    return { type: 'search_results', profiles: matches };
  }

  const data = await fetchAuthorDetailsFromAPI(authorId);
  
  const authorInfo = data.author || {};
  const articles = data.articles || [];
  const citationsInfo = data.cited_by || {};
  const coauthors = data.co_authors || [];

  // Parse metrics
  const citationsTable = citationsInfo.table || [];
  const citationsAll = citationsTable[0]?.citations?.all || 0;
  const citationsRecent = citationsTable[0]?.citations?.since_2021 || 0;
  const hIndexAll = citationsTable[1]?.h_index?.all || 0;
  const hIndexRecent = citationsTable[1]?.h_index?.since_2021 || 0;
  const i10IndexAll = citationsTable[2]?.i10_index?.all || 0;
  const i10IndexRecent = citationsTable[2]?.i10_index?.since_2021 || 0;

  return {
    type: 'profile_preview',
    authorId,
    profile: {
      fullName: authorInfo.name,
      affiliation: authorInfo.affiliations,
      website: authorInfo.website || '',
      profilePhoto: authorInfo.thumbnail || '',
      interests: authorInfo.interests ? authorInfo.interests.map((i) => i.title) : [],
    },
    metrics: {
      totalPublications: articles.length,
      totalCitations: citationsAll,
      citationsSinceLastYear: citationsRecent,
      hIndex: hIndexAll,
      hIndexSinceLastYear: hIndexRecent,
      i10Index: i10IndexAll,
      i10IndexSinceLastYear: i10IndexRecent,
      totalCoAuthors: coauthors.length,
    },
    publications: articles.map((art) => ({
      title: art.title,
      authors: art.authors,
      journal: art.publication || '',
      publicationYear: art.year ? parseInt(art.year, 10) : null,
      citationCount: art.cited_by?.value || 0,
      pdfUrl: art.link || '',
    })),
    coAuthors: coauthors.map((ca) => ({
      name: ca.name,
      scholarId: ca.author_id,
      scholarUrl: ca.link,
      affiliation: ca.affiliations || '',
      thumbnail: ca.thumbnail || '',
    })),
  };
};

/**
 * Save / Import Google Scholar Data
 */
export const importGoogleScholarProfile = async (userId, authorId, selectedPubTitles = null) => {
  const data = await fetchAuthorDetailsFromAPI(authorId);

  const authorInfo = data.author || {};
  const articles = data.articles || [];
  const citationsInfo = data.cited_by || {};
  const coauthors = data.co_authors || [];

  // 1. Update Profile Information
  const bioText = authorInfo.interests ? authorInfo.interests.map((i) => i.title).join(', ') : 'Researcher';
  const profile = await Profile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        bio: bioText,
        institution: authorInfo.affiliations || 'Independent Researcher',
        profilePhoto: authorInfo.thumbnail || '',
      },
    },
    { new: true, upsert: true }
  );

  // 2. Update Academic Profile Link
  await AcademicProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        googleScholar: authorId,
        personalWebsite: authorInfo.website || '',
      },
    },
    { new: true, upsert: true }
  );

  // 3. Save Research Metrics
  const citationsTable = citationsInfo.table || [];
  const citationsAll = citationsTable[0]?.citations?.all || 0;
  const citationsRecent = citationsTable[0]?.citations?.since_2021 || 0;
  const hIndexAll = citationsTable[1]?.h_index?.all || 0;
  const hIndexRecent = citationsTable[1]?.h_index?.since_2021 || 0;
  const i10IndexAll = citationsTable[2]?.i10_index?.all || 0;
  const i10IndexRecent = citationsTable[2]?.i10_index?.since_2021 || 0;

  await ResearchMetrics.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        totalPublications: articles.length,
        totalCitations: citationsAll,
        citationsSinceLastYear: citationsRecent,
        hIndex: hIndexAll,
        hIndexSinceLastYear: hIndexRecent,
        i10Index: i10IndexAll,
        i10IndexSinceLastYear: i10IndexRecent,
        totalCoAuthors: coauthors.length,
      },
    },
    { new: true, upsert: true }
  );

  // 4. Save Research Interests as ResearchAreas & Keywords
  const interests = authorInfo.interests || [];
  for (const interest of interests) {
    const normalizedName = interest.title.trim();
    const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Save Keyword
    const keywordDoc = await Keyword.findOneAndUpdate(
      { slug },
      { $setOnInsert: { keyword: normalizedName, slug } },
      { upsert: true, new: true }
    );
    await UserKeyword.findOneAndUpdate(
      { user: userId, keyword: keywordDoc._id },
      { user: userId, keyword: keywordDoc._id },
      { upsert: true }
    );

    // Save Research Area
    const areaDoc = await ResearchArea.findOneAndUpdate(
      { slug },
      { $setOnInsert: { areaName: normalizedName, slug } },
      { upsert: true, new: true }
    );
    await UserResearchArea.findOneAndUpdate(
      { user: userId, researchArea: areaDoc._id },
      { user: userId, researchArea: areaDoc._id },
      { upsert: true }
    );
  }

  // 5. Save Co-authors in ResearchCollaborator
  for (const ca of coauthors) {
    try {
      await ResearchCollaborator.findOneAndUpdate(
        { user: userId, scholarId: ca.author_id },
        {
          $set: {
            name: ca.name,
            scholarUrl: ca.link,
            affiliation: ca.affiliations || '',
          },
        },
        { upsert: true }
      );
    } catch (err) {
      console.warn('⚠️ Co-author upsert skipped:', err.message);
    }
  }

  // 6. Import Selected Articles
  console.log(`🌱 Importing ${articles.length} articles...`);
  for (const article of articles) {
    // If selective import filter is enabled, check membership
    if (selectedPubTitles && !selectedPubTitles.includes(article.title)) {
      continue;
    }

    try {
      let pub = await Publication.findOne({ title: article.title, user: userId });
      const citationCount = article.cited_by?.value || 0;
      const pubYear = article.year ? parseInt(article.year, 10) : new Date().getFullYear();

      if (!pub) {
        pub = new Publication({
          user: userId,
          title: article.title,
          abstract: `${article.title}. Published in ${article.publication || 'Academic Journal'}.`,
          publisher: article.publisher || '',
          journal: article.publication || '',
          publicationYear: pubYear,
          citationCount,
          pdfUrl: article.link || '',
          visibility: 'public',
        });
        await pub.save();

        // Create Publication Author mappings
        const authorNames = article.authors ? article.authors.split(',') : [authorInfo.name];
        for (let i = 0; i < authorNames.length; i++) {
          await PublicationAuthor.create({
            publication: pub._id,
            user: i === 0 ? userId : undefined,
            authorName: authorNames[i].trim(),
            authorOrder: i + 1,
          });
        }
      } else {
        pub.citationCount = citationCount;
        await pub.save();
      }
    } catch (err) {
      console.warn(`⚠️ Skipped article import "${article.title}":`, err.message);
    }
  }

  // Recalculate metrics
  await Profile.recalculateMetrics(userId);

  // Log activity
  await ActivityLog.create({
    user: userId,
    activity: 'google_scholar_import',
    ipAddress: '',
  });

  return { success: true };
};

/**
 * Unlink Google Scholar Profile
 */
export const unlinkGoogleScholarProfile = async (userId) => {
  await AcademicProfile.findOneAndUpdate(
    { user: userId },
    { $set: { googleScholar: '', personalWebsite: '' } }
  );

  await ResearchMetrics.findOneAndDelete({ user: userId });

  await ActivityLog.create({
    user: userId,
    activity: 'google_scholar_unlink',
  });

  return { success: true };
};

/**
 * Mock data generator if SerpAPI Key is missing
 */
function getMockScholarData(authorId) {
  return {
    author: {
      name: 'Dr. Sarah Jenkins',
      affiliations: 'Associate Professor, Stanford University',
      website: 'https://sarahjenkins.lab.stanford.edu',
      interests: [
        { title: 'Neural Networks' },
        { title: 'Natural Language Processing' },
        { title: 'Healthcare AI' }
      ],
      thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
    },
    cited_by: {
      table: [
        { citations: { all: 2458, since_2021: 1542 } },
        { h_index: { all: 28, since_2021: 22 } },
        { i10_index: { all: 35, since_2021: 30 } }
      ]
    },
    articles: [
      {
        title: 'Attention-Driven Spatial Reasoning in Healthcare Diagnostics',
        authors: 'Sarah Jenkins, John Doe',
        publication: 'Journal of Biomedical Informatics',
        year: '2026',
        cited_by: { value: 128 },
        link: 'https://res.cloudinary.com/research-connect/raw/upload/papers/attention_healthcare.pdf',
        description: 'An optimized transformer network applied to diagnostic segmentation of 3D medical scans.'
      },
      {
        title: 'Secure Federated Learning in Distributed Healthcare Frameworks',
        authors: 'Alex Rivera, Sarah Jenkins',
        publication: 'IEEE Transactions on Information Forensics and Security',
        year: '2026',
        cited_by: { value: 15 },
        link: 'https://res.cloudinary.com/research-connect/raw/upload/papers/federated_security.pdf',
        description: 'Using cryptographic models to secure multi-institutional machine learning pipelines.'
      }
    ],
    co_authors: [
      {
        name: 'Prof. Alex Rivera',
        author_id: 'alex_gs_id',
        link: 'https://scholar.google.com/citations?user=alex_gs_id',
        affiliations: 'CSAIL, MIT',
        thumbnail: ''
      }
    ]
  };
}
