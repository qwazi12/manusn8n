export type PlanType = 'free' | 'pro' | 'payg';

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  interval?: 'month' | 'credits';
  credits: number;
  features: string[];
  trialDays?: number;
  creditExpiry?: number; // in days
}

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    credits: 100,
    trialDays: 7,
    features: [
      'Natural language → n8n JSON workflow',
      'Step-by-step workflow guide',
      'Basic support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 17.99,
    interval: 'month',
    credits: 500,
    features: [
      'All Free features',
      'Priority AI processing',
      'Upload files/images for prompts',
      'Retain workflows',
      'Multi-turn refinement chat',
    ],
  },
  payg: {
    id: 'payg',
    name: 'Pay-As-You-Go',
    price: 5,
    interval: 'credits',
    credits: 100,
    creditExpiry: 30,
    features: [
      'No subscription required',
      'All standard generation features',
      'Pay only for what you need',
    ],
  },
}; 