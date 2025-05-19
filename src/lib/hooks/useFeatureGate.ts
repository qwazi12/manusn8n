'use client';

import { useUser } from "@clerk/nextjs";

type Feature = 'workflow_generation' | 'multi_turn_chat' | 'file_attachments';

export function useFeatureGate() {
  const { user } = useUser();
  
  const hasFeatureAccess = (feature: Feature): boolean => {
    // During development, allow all features
    return true;
  };

  return { hasFeatureAccess };
}

// function isWithinTrialPeriod(trialStart: string): boolean {
//   const trialStartDate = new Date(trialStart);
//   const now = new Date();
//   const trialDays = 7;
//   const trialEndDate = new Date(trialStartDate);
//   trialEndDate.setDate(trialEndDate.getDate() + trialDays);
//   return now <= trialEndDate;
// } 