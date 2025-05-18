import { useState, useEffect } from 'react';
import { PlanType, PRICING_PLANS } from '@/types/pricing';

export function usePricing() {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free');
  const [remainingCredits, setRemainingCredits] = useState<number>(0);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize credits based on plan
    const plan = PRICING_PLANS[selectedPlan];
    setRemainingCredits(plan.credits);

    // Set trial end date for free plan
    if (plan.trialDays) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.trialDays);
      setTrialEndsAt(endDate);
    } else {
      setTrialEndsAt(null);
    }
  }, [selectedPlan]);

  const changePlan = (planType: PlanType) => {
    setSelectedPlan(planType);
  };

  const useCredits = (amount: number = 1) => {
    setRemainingCredits((prev) => Math.max(0, prev - amount));
  };

  const addCredits = (amount: number) => {
    setRemainingCredits((prev) => prev + amount);
  };

  const getCurrentPlan = () => PRICING_PLANS[selectedPlan];

  const getTrialStatus = () => {
    if (!trialEndsAt) return null;
    
    const now = new Date();
    const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isActive: daysLeft > 0,
      daysLeft,
      endsAt: trialEndsAt,
    };
  };

  return {
    selectedPlan,
    remainingCredits,
    trialEndsAt,
    changePlan,
    useCredits,
    addCredits,
    getCurrentPlan,
    getTrialStatus,
  };
} 