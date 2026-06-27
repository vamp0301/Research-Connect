import Publication from '../models/Publication.js';
import PublicationAuthor from '../models/PublicationAuthor.js';
import PublicationKeyword from '../models/PublicationKeyword.js';
import PublicationResearchArea from '../models/PublicationResearchArea.js';
import UserKeyword from '../models/UserKeyword.js';
import UserResearchArea from '../models/UserResearchArea.js';
import Follower from '../models/Follower.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

/**
 * Helper to compute matching scores for publications
 */
const getPersonalizedPublications = async (userId, page = 1, limit = 10) => {
  // 1. Get current user's keywords and research areas
  const userKeywords = await UserKeyword.find({ user: userId }).select('keyword');
  const userKeywordIds = userKeywords.map((k) => k.keyword.toString());

  const userAreas = await UserResearchArea.find({ user: userId }).select('researchArea');
  const userAreaIds = userAreas.map((a) => a.researchArea.toString());

  // 2. Get researchers followed by current user for network score
  const followings = await Follower.find({ follower: userId }).select('following');
  const followingIds = followings.map((f) => f.following.toString());

  // 3. Fetch all active publications (excluding deleted ones)
  const query = { isDeleted: { $ne: true } };
  const publications = await Publication.find(query).lean();

  if (publications.length === 0) {
    return [];
  }

  // 4. Batch query keywords, research areas, and authors for all publications to avoid N+1 queries
  const pubIds = publications.map((p) => p._id);
  
  const pubKeywords = await PublicationKeyword.find({ publication: { $in: pubIds } }).lean();
  const pubAreas = await PublicationResearchArea.find({ publication: { $in: pubIds } }).lean();
  const pubAuthors = await PublicationAuthor.find({ publication: { $in: pubIds } }).lean();

  // Create lookup maps
  const keywordMap = {};
  const areaMap = {};
  const authorMap = {};

  pubKeywords.forEach((pk) => {
    const key = pk.publication.toString();
    if (!keywordMap[key]) keywordMap[key] = [];
    keywordMap[key].push(pk.keyword.toString());
  });

  pubAreas.forEach((pa) => {
    const key = pa.publication.toString();
    if (!areaMap[key]) areaMap[key] = [];
    areaMap[key].push(pa.researchArea.toString());
  });

  pubAuthors.forEach((pauth) => {
    const key = pauth.publication.toString();
    if (!authorMap[key]) authorMap[key] = [];
    if (pauth.user) {
      authorMap[key].push(pauth.user.toString());
    }
  });

  // 5. Score each publication
  const scoredPublications = publications.map((pub) => {
    const pubIdStr = pub._id.toString();
    const pkList = keywordMap[pubIdStr] || [];
    const paList = areaMap[pubIdStr] || [];
    const pAuthorList = authorMap[pubIdStr] || [];

    // Calculate Jaccard similarity for Keywords (40% Weight)
    let keywordScore = 0;
    if (userKeywordIds.length > 0 && pkList.length > 0) {
      const intersection = pkList.filter((k) => userKeywordIds.includes(k)).length;
      const union = new Set([...pkList, ...userKeywordIds]).size;
      keywordScore = (intersection / union) * 100;
    }

    // Calculate Jaccard similarity for Research Areas (25% Weight)
    let researchAreaScore = 0;
    if (userAreaIds.length > 0 && paList.length > 0) {
      const intersection = paList.filter((a) => userAreaIds.includes(a)).length;
      const union = new Set([...paList, ...userAreaIds]).size;
      researchAreaScore = (intersection / union) * 100;
    }

    // Calculate Network Score (10% Weight)
    // Check if user follows the publisher or any co-author of the publication
    let networkScore = 0;
    const publisherIdStr = pub.user ? pub.user.toString() : '';
    const followedAuthor = pAuthorList.some((authId) => followingIds.includes(authId));
    if (followingIds.includes(publisherIdStr) || followedAuthor) {
      networkScore = 100;
    }

    // Calculate Trending Score (5% Weight)
    // Map citations to a 0-100 scale (e.g. 50 citations = 100 score)
    const citationScore = Math.min(((pub.citationCount || 0) / 50) * 100, 100);

    // Publication Similarity (20% Weight)
    // If user has written papers in the same journal or shares co-authors
    let pubSimilarityScore = 0;
    if (pub.user.toString() === userId.toString()) {
      // User's own paper - score is positive but lower priority for home feed
      pubSimilarityScore = 50;
    } else {
      // Mock publication text match / author overlap
      const sharedAuthors = pAuthorList.some((authId) => authId === userId.toString());
      if (sharedAuthors) {
        pubSimilarityScore = 100;
      }
    }

    // Weighted final recommendation score
    // 40% Keyword, 25% Research Area, 20% Publication Similarity, 10% Network, 5% Trending
    const score = parseFloat(
      (
        keywordScore * 0.40 +
        researchAreaScore * 0.25 +
        pubSimilarityScore * 0.20 +
        networkScore * 0.10 +
        citationScore * 0.05
      ).toFixed(2)
    );

    return {
      ...pub,
      score,
      matchBreakdown: {
        keywordScore,
        researchAreaScore,
        pubSimilarityScore,
        networkScore,
        citationScore
      }
    };
  });

  // 6. Sort and Paginate
  scoredPublications.sort((a, b) => b.score - a.score);
  const startIndex = (page - 1) * limit;
  const paginatedPubs = scoredPublications.slice(startIndex, startIndex + limit);

  return paginatedPubs;
};

/**
 * Get Recommended Researchers for a user
 */
const getRecommendedResearchersList = async (userId, page = 1, limit = 5) => {
  // 1. Get current user's keywords and research areas
  const userKeywords = await UserKeyword.find({ user: userId }).select('keyword');
  const userKeywordIds = userKeywords.map((k) => k.keyword.toString());

  const userAreas = await UserResearchArea.find({ user: userId }).select('researchArea');
  const userAreaIds = userAreas.map((a) => a.researchArea.toString());

  // 2. Fetch all other users with profiles
  const users = await User.find({ _id: { $ne: userId }, isDeleted: { $ne: true } }).lean();
  const profiles = await Profile.find({ user: { $ne: userId } }).lean();

  const profileMap = {};
  profiles.forEach((p) => {
    profileMap[p.user.toString()] = p;
  });

  const candidates = users.filter((u) => profileMap[u._id.toString()]);
  if (candidates.length === 0) {
    return [];
  }

  const candidateIds = candidates.map((c) => c._id);

  // Batch load candidate keywords and research areas
  const candKeywords = await UserKeyword.find({ user: { $in: candidateIds } }).lean();
  const candAreas = await UserResearchArea.find({ user: { $in: candidateIds } }).lean();

  const cKeywordMap = {};
  const cAreaMap = {};

  candKeywords.forEach((ck) => {
    const key = ck.user.toString();
    if (!cKeywordMap[key]) cKeywordMap[key] = [];
    cKeywordMap[key].push(ck.keyword.toString());
  });

  candAreas.forEach((ca) => {
    const key = ca.user.toString();
    if (!cAreaMap[key]) cAreaMap[key] = [];
    cAreaMap[key].push(ca.researchArea.toString());
  });

  // Score each candidate
  const scoredResearchers = candidates.map((cand) => {
    const candIdStr = cand._id.toString();
    const ckList = cKeywordMap[candIdStr] || [];
    const caList = cAreaMap[candIdStr] || [];

    // Keyword Overlap (50%)
    let keywordScore = 0;
    if (userKeywordIds.length > 0 && ckList.length > 0) {
      const intersection = ckList.filter((k) => userKeywordIds.includes(k)).length;
      const union = new Set([...ckList, ...userKeywordIds]).size;
      keywordScore = (intersection / union) * 100;
    }

    // Research Area Overlap (50%)
    let researchAreaScore = 0;
    if (userAreaIds.length > 0 && caList.length > 0) {
      const intersection = caList.filter((a) => userAreaIds.includes(a)).length;
      const union = new Set([...caList, ...userAreaIds]).size;
      researchAreaScore = (intersection / union) * 100;
    }

    const finalMatch = parseFloat((keywordScore * 0.50 + researchAreaScore * 0.50).toFixed(2));

    return {
      user: {
        _id: cand._id,
        fullName: cand.fullName,
        email: cand.email,
        role: cand.role,
      },
      profile: profileMap[candIdStr],
      finalMatch,
      commonKeywords: ckList.filter((k) => userKeywordIds.includes(k))
    };
  });

  // Sort by match score and return
  scoredResearchers.sort((a, b) => b.finalMatch - a.finalMatch);
  const startIndex = (page - 1) * limit;
  return scoredResearchers.slice(startIndex, startIndex + limit);
};

/**
 * Get Personalized Feed for Home Dashboard
 * GET /api/v1/feed/home
 */
export const getHomeFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const userId = req.user._id;

    // Fetch publications and format as unified feed item list
    const publications = await getPersonalizedPublications(userId, page, limit);

    // Map publications to type: 'publication' feed items
    const feed = publications.map((pub) => ({
      type: 'publication',
      data: pub,
      score: pub.score
    }));

    res.status(200).json({
      status: 'success',
      results: feed.length,
      page,
      feed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Recommended Researchers List
 * GET /api/v1/recommendations/researchers
 */
export const getRecommendedResearchers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const userId = req.user._id;

    const recommendations = await getRecommendedResearchersList(userId, page, limit);

    res.status(200).json({
      status: 'success',
      results: recommendations.length,
      recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Trending Publications
 * GET /api/v1/feed/trending
 */
export const getTrendingPublications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const skip = (page - 1) * limit;

    // Fetch publications sorted by citations count descending
    const publications = await Publication.find({ isDeleted: { $ne: true } })
      .sort({ citationCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      results: publications.length,
      publications
    });
  } catch (error) {
    next(error);
  }
};
