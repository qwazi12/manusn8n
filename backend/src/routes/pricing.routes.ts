// src/routes/pricing.routes.ts
import { Router } from 'express';
import { creditService } from '../services/credit/creditService';
import { authMiddleware } from '../middleware/authMiddleware';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /pricing/plans
 * Get all available pricing plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = creditService.getPricingPlans();
    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    logger.error('Error fetching pricing plans', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing plans'
    });
  }
});

/**
 * POST /pricing/initialize-trial
 * Initialize free trial for new user
 */
router.post('/initialize-trial', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userCredits = await creditService.initializeNewUser(userId);
    
    res.status(200).json({
      success: true,
      message: 'Free trial initialized successfully',
      credits: userCredits
    });
  } catch (error) {
    logger.error('Error initializing trial', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize trial'
    });
  }
});

/**
 * POST /pricing/upgrade-to-pro
 * Upgrade user to Pro plan
 */
router.post('/upgrade-to-pro', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { subscriptionId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required'
      });
    }

    const userCredits = await creditService.upgradeToProPlan(userId, subscriptionId);
    
    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to Pro plan',
      credits: userCredits
    });
  } catch (error) {
    logger.error('Error upgrading to pro', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade to Pro plan'
    });
  }
});

/**
 * POST /pricing/purchase-payg
 * Purchase Pay-As-You-Go credits
 */
router.post('/purchase-payg', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { purchaseId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!purchaseId) {
      return res.status(400).json({
        success: false,
        error: 'Purchase ID is required'
      });
    }

    const userCredits = await creditService.purchasePaygCredits(userId, purchaseId);
    
    res.status(200).json({
      success: true,
      message: 'PAYG credits purchased successfully',
      credits: userCredits
    });
  } catch (error) {
    logger.error('Error purchasing PAYG credits', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Failed to purchase PAYG credits'
    });
  }
});

/**
 * GET /pricing/user-status
 * Get user's current plan and credit status
 */
router.get('/user-status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const userCredits = await creditService.getUserCredits(userId);
    const needsUpgrade = await creditService.needsUpgrade(userId);
    
    res.status(200).json({
      success: true,
      credits: userCredits,
      needsUpgrade
    });
  } catch (error) {
    logger.error('Error fetching user status', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user status'
    });
  }
});

export default router; 