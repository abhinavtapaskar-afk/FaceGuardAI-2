const express = require('express');
const router = express.Router();
const { SUBSCRIPTION_PLANS, USER_TIERS } = require('../../config/constants');
const { authenticate } = require('../../middleware/auth');
const Database = require('../../config/database');

/**
 * Get subscription plans
 */
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      plans: Object.values(SUBSCRIPTION_PLANS),
      freeTier: {
        name: 'Free',
        price: 0,
        features: [
          '1 scan per week',
          'Basic progress graphs',
          'Limited leaderboard access',
          'Simple share cards',
          'Basic product recommendations'
        ]
      }
    }
  });
});

/**
 * Get user's current subscription
 */
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const subscription = await Database.getUserSubscription(userId);

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          tier: USER_TIERS.FREE,
          active: false,
          message: 'No active subscription'
        }
      });
    }

    res.json({
      success: true,
      data: {
        tier: USER_TIERS.PREMIUM,
        active: true,
        subscription: {
          id: subscription.id,
          plan: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status
        }
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscription'
    });
  }
});

/**
 * Create subscription (Razorpay integration placeholder)
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.userId;

    // Validate plan
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    // TODO: Integrate with Razorpay
    // For now, return order details
    res.json({
      success: true,
      message: 'Razorpay integration pending',
      data: {
        plan,
        amount: plan.price,
        currency: 'INR',
        // razorpayOrderId: 'order_xxx',
        // razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
});

/**
 * Verify payment and activate subscription
 */
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = req.body;
    const userId = req.userId;

    // TODO: Verify Razorpay signature
    // For now, just create subscription record

    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan ID'
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscriptionData = {
      userId,
      planId: plan.id,
      status: 'active',
      startDate,
      endDate,
      amount: plan.price,
      currency: 'INR',
      razorpayOrderId,
      razorpayPaymentId
    };

    const subscriptionId = await Database.createSubscription(subscriptionData);

    // Update user tier
    await Database.updateUser(userId, { tier: USER_TIERS.PREMIUM });

    res.json({
      success: true,
      message: 'Subscription activated successfully!',
      data: {
        subscriptionId,
        tier: USER_TIERS.PREMIUM,
        endDate
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

/**
 * Cancel subscription
 */
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const subscription = await Database.getUserSubscription(userId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    await Database.updateSubscription(subscription.id, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    // Note: User keeps premium until end date
    res.json({
      success: true,
      message: 'Subscription cancelled. You will have access until the end of your billing period.',
      data: {
        endDate: subscription.endDate
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

module.exports = router;
