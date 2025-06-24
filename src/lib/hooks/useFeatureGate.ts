'use client';

import { useUser } from "@clerk/nextjs";

export type Feature = 'workflow_generation' | 'multi_turn_chat_pro' | 'file_attachments';

export function useFeatureGate() {
  const { user } = useUser();
  
  // Get the user's plan from metadata
  const userPlan = user?.publicMetadata?.plan as string || 'free';
  
  // Define feature access based on plans
  const featureAccess: Record<string, Feature[]> = {
    free: ['workflow_generation'],
    pro: ['workflow_generation', 'multi_turn_chat_pro', 'file_attachments'],
    payg: ['workflow_generation', 'file_attachments']
  };

  const hasFeatureAccess = (feature: Feature): boolean => {
    // During development, allow all features
    return true;
    
    // If no user, no access
    if (!user) return false;
    
    // Get allowed features for user's plan
    const allowedFeatures = featureAccess[userPlan] || [];
    
    // Check if feature is allowed
    return allowedFeatures.includes(feature);
  };

  return {
    hasFeatureAccess,
    userPlan
  };
}

// function isWithinTrialPeriod(trialStart: string): boolean {
//   const trialStartDate = new Date(trialStart);
//   const now = new Date();
//   const trialDays = 7;
//   const trialEndDate = new Date(trialStartDate);
//   trialEndDate.setDate(trialEndDate.getDate() + trialDays);
//   return now <= trialEndDate;
// } 