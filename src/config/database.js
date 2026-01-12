const { db, collections } = require('./firebase');

/**
 * Database helper functions for Firestore
 */

class Database {
  // User Operations
  static async createUser(userId, userData) {
    const userRef = db.collection(collections.USERS).doc(userId);
    await userRef.set({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return userRef.id;
  }

  static async getUser(userId) {
    const userDoc = await db.collection(collections.USERS).doc(userId).get();
    if (!userDoc.exists) return null;
    return { id: userDoc.id, ...userDoc.data() };
  }

  static async updateUser(userId, updates) {
    await db.collection(collections.USERS).doc(userId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  static async getUserByEmail(email) {
    const snapshot = await db.collection(collections.USERS)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // Scan Operations
  static async createScan(scanData) {
    const scanRef = await db.collection(collections.SCANS).add({
      ...scanData,
      createdAt: new Date()
    });
    return scanRef.id;
  }

  static async getUserScans(userId, limit = 10) {
    const snapshot = await db.collection(collections.SCANS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getScan(scanId) {
    const scanDoc = await db.collection(collections.SCANS).doc(scanId).get();
    if (!scanDoc.exists) return null;
    return { id: scanDoc.id, ...scanDoc.data() };
  }

  // Progress Operations
  static async saveProgress(userId, progressData) {
    const progressRef = await db.collection(collections.PROGRESS).add({
      userId,
      ...progressData,
      createdAt: new Date()
    });
    return progressRef.id;
  }

  static async getUserProgress(userId, weeks = 12) {
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - (weeks * 7));

    const snapshot = await db.collection(collections.PROGRESS)
      .where('userId', '==', userId)
      .where('createdAt', '>=', weeksAgo)
      .orderBy('createdAt', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Product Operations
  static async getProducts(filters = {}) {
    let query = db.collection(collections.PRODUCTS);

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }
    if (filters.skinType) {
      query = query.where('suitableFor', 'array-contains', filters.skinType);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createProduct(productData) {
    const productRef = await db.collection(collections.PRODUCTS).add({
      ...productData,
      createdAt: new Date()
    });
    return productRef.id;
  }

  // Recommendation Operations
  static async saveRecommendations(userId, scanId, recommendations) {
    const recRef = await db.collection(collections.RECOMMENDATIONS).add({
      userId,
      scanId,
      recommendations,
      createdAt: new Date()
    });
    return recRef.id;
  }

  static async getRecommendations(userId, scanId) {
    const snapshot = await db.collection(collections.RECOMMENDATIONS)
      .where('userId', '==', userId)
      .where('scanId', '==', scanId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // Subscription Operations
  static async createSubscription(subscriptionData) {
    const subRef = await db.collection(collections.SUBSCRIPTIONS).add({
      ...subscriptionData,
      createdAt: new Date()
    });
    return subRef.id;
  }

  static async getUserSubscription(userId) {
    const snapshot = await db.collection(collections.SUBSCRIPTIONS)
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async updateSubscription(subscriptionId, updates) {
    await db.collection(collections.SUBSCRIPTIONS).doc(subscriptionId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // Leaderboard Operations
  static async getLeaderboard(limit = 100) {
    const snapshot = await db.collection(collections.USERS)
      .where('showOnLeaderboard', '==', true)
      .orderBy('glowScore', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      userId: doc.id,
      displayName: doc.data().displayName,
      glowScore: doc.data().glowScore,
      streak: doc.data().streak,
      photoUrl: doc.data().photoUrl,
      tier: doc.data().tier
    }));
  }

  static async updateLeaderboardEntry(userId, data) {
    await db.collection(collections.USERS).doc(userId).update({
      glowScore: data.glowScore,
      streak: data.streak,
      lastScanDate: new Date(),
      updatedAt: new Date()
    });
  }

  // Feature Flags
  static async getFeatureFlag(flagName) {
    const flagDoc = await db.collection(collections.FEATURE_FLAGS).doc(flagName).get();
    if (!flagDoc.exists) return { enabled: false };
    return flagDoc.data();
  }

  static async setFeatureFlag(flagName, enabled, config = {}) {
    await db.collection(collections.FEATURE_FLAGS).doc(flagName).set({
      enabled,
      config,
      updatedAt: new Date()
    }, { merge: true });
  }

  // Legal Consents
  static async saveConsent(userId, consentData) {
    const consentRef = await db.collection(collections.LEGAL_CONSENTS).add({
      userId,
      ...consentData,
      timestamp: new Date()
    });
    return consentRef.id;
  }

  // Affiliate Tracking
  static async trackAffiliateClick(userId, productId, platform) {
    const clickRef = await db.collection(collections.AFFILIATE_CLICKS).add({
      userId,
      productId,
      platform,
      timestamp: new Date()
    });
    return clickRef.id;
  }

  static async getAffiliateStats(startDate, endDate) {
    const snapshot = await db.collection(collections.AFFILIATE_CLICKS)
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();
    
    return {
      totalClicks: snapshot.size,
      clicks: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  }
}

module.exports = Database;
