"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditController = void 0;
const creditService_1 = require("../services/credit/creditService");
const logger_1 = require("../utils/logger");
class CreditController {
    /**
     * Get user credit information
     */
    async getUserCredits(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const creditInfo = await creditService_1.creditService.getUserCredits(userId);
            return res.status(200).json(creditInfo);
        }
        catch (error) {
            logger_1.logger.error('Error fetching user credits:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Get credit transaction history
     */
    async getCreditHistory(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const history = await creditService_1.creditService.getCreditHistory(userId);
            return res.status(200).json({ history });
        }
        catch (error) {
            logger_1.logger.error('Error fetching credit history:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * Purchase credits
     */
    async purchaseCredits(req, res) {
        var _a;
        try {
            const { amount, paymentMethod, paymentDetails } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
            const updatedCredits = await creditService_1.creditService.addCreditsFromPurchase(userId, amount, metadata);
            return res.status(200).json({
                success: true,
                message: 'Credits purchased successfully',
                credits: updatedCredits.credits
            });
        }
        catch (error) {
            logger_1.logger.error('Error purchasing credits:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.creditController = new CreditController();
