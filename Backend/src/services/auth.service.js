import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import RefreshToken from '../models/RefreshToken.js';
import Session from '../models/Session.js';
import ActivityLog from '../models/ActivityLog.js';
import AcademicProfile from '../models/AcademicProfile.js';
import sendEmail from '../utils/sendEmail.js';
import AppError from '../utils/AppError.js';
import * as scholarService from './scholar.service.js';

/**
 * Sign JWT Token Helper
 */
const signToken = (id, role, secret, expiresIn) => {
  return jwt.sign({ id, role }, secret, { expiresIn });
};

/**
 * Issue Access and Refresh Tokens
 */
export const issueTokens = async (user, sessionData = {}) => {
  const accessToken = signToken(
    user._id,
    user.role,
    process.env.JWT_SECRET || 'research_connect_default_access_secret_key_2026',
    process.env.JWT_EXPIRE || '15m'
  );

  const refreshToken = signToken(
    user._id,
    user.role,
    process.env.JWT_REFRESH_SECRET || 'research_connect_default_refresh_secret_key_2026',
    process.env.JWT_REFRESH_EXPIRE || '7d'
  );

  // Save the refresh token in database (expires after 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
  });

  // Create or Update Session
  await Session.create({
    user: user._id,
    refreshToken,
    userAgent: sessionData.userAgent || '',
    ipAddress: sessionData.ipAddress || '',
    device: sessionData.device || '',
    browser: sessionData.browser || '',
    lastActive: new Date(),
  });

  // Log activity
  await ActivityLog.create({
    user: user._id,
    activity: 'login',
    ipAddress: sessionData.ipAddress || '',
    browser: sessionData.browser || '',
    device: sessionData.device || '',
  });

  return { accessToken, refreshToken };
};

/**
 * Sign up a new researcher
 */
export const registerUser = async (userData, sessionData = {}) => {
  const { 
    fullName, 
    email, 
    password, 
    role,
    // Onboarding multi-step fields
    researcherType,
    institution,
    department,
    designation,
    country,
    state,
    city,
    bio,
    googleScholarId,
    orcidId,
    linkedinUrl,
    scopusId,
    researchGateUrl
  } = userData;

  // 1. Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email address already registered.', 409);
  }

  // 2. Create user (hashes password in pre-save)
  const newUser = await User.create({
    fullName,
    email,
    password,
    role: role || 'researcher',
    status: 'active',
  });

  // 3. Create researcher Profile
  const profile = await Profile.create({
    user: newUser._id,
    researcherType: researcherType || 'academic',
    institution: institution || 'Independent Researcher',
    department: department || 'Not Specified',
    designation: designation || 'Researcher',
    country: country || 'Not Specified',
    state: state || '',
    city: city || '',
    bio: bio || '',
  });

  // Create connected Academic Profile
  await AcademicProfile.create({
    user: newUser._id,
    googleScholar: googleScholarId || '',
    orcid: orcidId || '',
    linkedin: linkedinUrl || '',
    scopus: scopusId || '',
    researchGate: researchGateUrl || '',
  });

  // 4. Auto-trigger Google Scholar import if provided
  if (googleScholarId) {
    try {
      console.log(`🔍 [SCHOLAR IMPORT] Syncing Scholar ID ${googleScholarId} on signup...`);
      await scholarService.importScholarProfile(newUser._id, googleScholarId);
    } catch (err) {
      console.error('⚠️ Scholar auto-import failed during signup. Users can sync later.', err.message);
    }
  }

  // 5. Generate email verification token
  const cryptoToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(cryptoToken).digest('hex');

  await EmailVerificationToken.create({
    user: newUser._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // 6. Send verification email
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${cryptoToken}`;

  const message = `Welcome to ResearchConnect, ${fullName}!\n\nPlease verify your email by clicking the link: ${verifyUrl}\n\nThis link is valid for 24 hours.`;
  const html = `
    <h3>Welcome to ResearchConnect, ${fullName}!</h3>
    <p>Please verify your email address to activate your researcher profile.</p>
    <a href="${verifyUrl}" style="padding: 10px 20px; background: #007bff; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
    <p>Or paste this URL in your browser: <br/> <a href="${verifyUrl}">${verifyUrl}</a></p>
  `;

  await sendEmail({
    email: newUser.email,
    subject: 'Welcome to ResearchConnect - Verify Email Address',
    message,
    html,
  });

  // 7. Issue initial JWT tokens
  const tokens = await issueTokens(newUser, sessionData);

  return { user: newUser, ...tokens };
};

/**
 * Log in researcher
 */
export const loginUser = async (email, password, sessionData = {}) => {
  // 1. Find user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password.', 401);
  }

  // 2. Check if user is blocked or deleted
  if (user.status !== 'active') {
    throw new AppError('Your account has been deactivated or blocked.', 403);
  }

  // 3. Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // 4. Issue tokens
  const tokens = await issueTokens(user, sessionData);

  return { user, ...tokens };
};

/**
 * Email Verification
 */
export const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 1. Find token
  const tokenDoc = await EmailVerificationToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new AppError('Token is invalid or has expired.', 400);
  }

  // 2. Activate user
  const user = await User.findById(tokenDoc.user);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.emailVerified = true;
  await user.save({ validateBeforeSave: false });

  // 3. Delete token
  await EmailVerificationToken.findByIdAndDelete(tokenDoc._id);

  return user;
};

/**
 * Forgot Password Request
 */
export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('No user found with that email address.', 404);
  }

  // 1. Generate crypto token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // 2. Save token
  await PasswordResetToken.create({
    user: user._id,
    token: hashedToken,
    expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
  });

  // 3. Send email
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const message = `Forgot your password? Reset it here: ${resetUrl}\n\nIf you did not make this request, please ignore this email.`;
  const html = `
    <h3>Reset Your Password</h3>
    <p>We received a request to reset your ResearchConnect password.</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background: #dc3545; color: #fff; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p>Or paste this link in your browser: <br/> <a href="${resetUrl}">${resetUrl}</a></p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'ResearchConnect Password Reset Link',
    message,
    html,
  });
};

/**
 * Reset Password
 */
export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 1. Find token
  const tokenDoc = await PasswordResetToken.findOne({
    token: hashedToken,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new AppError('Token is invalid or has expired.', 400);
  }

  // 2. Find user & update password
  const user = await User.findById(tokenDoc.user);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.password = newPassword;
  await user.save(); // pre-save hashes it

  // 3. Delete token & revoke previous JWT sessions
  await PasswordResetToken.findByIdAndDelete(tokenDoc._id);
  await RefreshToken.deleteMany({ user: user._id });
  await Session.deleteMany({ user: user._id });

  return user;
};

/**
 * Rotate Refresh Token
 */
export const refreshUserSession = async (oldRefreshToken, sessionData = {}) => {
  try {
    // 1. Verify token
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET || 'research_connect_default_refresh_secret_key_2026');

    // 2. Find refresh token in database
    const tokenDoc = await RefreshToken.findOne({
      token: oldRefreshToken,
      user: decoded.id,
      isBlacklisted: false,
    });

    if (!tokenDoc) {
      // Possible token reuse attack - blacklist all tokens for the user
      await RefreshToken.updateMany({ user: decoded.id }, { isBlacklisted: true });
      await Session.deleteMany({ user: decoded.id });
      throw new AppError('Compromised refresh session. Logging out of all devices.', 401);
    }

    // 3. Find user
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      throw new AppError('User is no longer active.', 401);
    }

    // 4. Blacklist old token (rotation)
    tokenDoc.isBlacklisted = true;
    await tokenDoc.save();

    // 5. Delete old session
    await Session.findOneAndDelete({ refreshToken: oldRefreshToken });

    // 6. Issue new tokens
    return await issueTokens(user, sessionData);
  } catch (err) {
    throw new AppError('Session expired. Please log in again.', 401);
  }
};

/**
 * Logout User
 */
export const logoutUser = async (refreshToken) => {
  await RefreshToken.findOneAndDelete({ token: refreshToken });
  await Session.findOneAndDelete({ refreshToken });
};
