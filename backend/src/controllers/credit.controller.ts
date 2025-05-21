// src/controllers/credit.controller.ts
import { Request, Response } from 'express';
import { creditService } from '../services/credit/creditService';
import { logger } from '../utils/logger';

class CreditController {
  /**
   * Get user credit information
   */
  async getUserCredits(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const creditInfo = await creditService.getUserCredits(userId);
      return res.status(200).json(creditInfo);
    } catch (error) {
      logger.error('Error fetching user credits:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get credit transaction history
   */
  async getCreditHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const history = await creditService.getCreditHistory(userId);
      return res.status(200).json({ history });
    } catch (error) {
      logger.error('Error fetching credit history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Purchase credits
   */
  async purchaseCredits(req: Request, res: Response) {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid credit amount' });
      }

      // PLACEHOLDER: Integrate with payment processor
      // INTEGRATION: Replace with actual payment processing logic
      
      // For now, we'll simulate a successful payment
      const metadata = {
        paymentMethod,
        transactionId: `mock-${Date.now()}`,
        timestamp: new Date().toISOString()
      };

      const updatedCredits = await creditService.addCreditsFromPurchase(
        userId,
        amount,
        metadata
      );

      return res.status(200).json({
        success: true,
        message: 'Credits purchased successfully',
        credits: updatedCredits.credits
      });
    } catch (error) {
      logger.error('Error purchasing credits:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const creditController = new CreditController();
