"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

interface TrialStatusData {
  trial_status: 'active' | 'expired' | 'credits_exhausted' | 'grace_period';
  can_use_service: boolean;
  upgrade_required: boolean;
  message: string;
  details: {
    credits_remaining: number;
    days_remaining: number;
    days_used: number;
    trial_end_date: string;
    plan: string;
    trial_expired: boolean;
    credits_exhausted: boolean;
  };
}

interface TrialStatusProps {
  onTrialExpired?: () => void;
}

export function TrialStatus({ onTrialExpired }: TrialStatusProps) {
  const [trialData, setTrialData] = useState<TrialStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const { has } = useAuth();

  const hasProPlan = has({ plan: 'pro' });
  const hasPaygPlan = has({ plan: 'payg' });

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/user-credits');
      if (response.ok) {
        const data = await response.json();
        // Convert to expected format
        const trialData = {
          trial_status: data.trial_status.show_blocking_modal ? 'expired' :
                       data.trial_status.show_grace_warning ? 'grace_period' : 'active',
          can_use_service: !data.trial_status.show_blocking_modal,
          upgrade_required: data.trial_status.show_blocking_modal,
          message: data.trial_status.show_blocking_modal ?
            'Your free trial has ended. Please upgrade to continue.' :
            data.trial_status.show_grace_warning ?
            `Trial ending soon! ${data.trial_status.days_remaining} days and ${data.credits} credits remaining.` :
            'Trial active',
          details: {
            credits_remaining: data.credits,
            days_remaining: data.trial_status.days_remaining,
            trial_expired: data.trial_status.trial_expired,
            credits_exhausted: data.trial_status.credits_exhausted
          }
        };
        setTrialData(trialData);

        // Notify parent if trial expired
        if (trialData.upgrade_required && onTrialExpired) {
          onTrialExpired();
        }
      }
    } catch (error) {
      console.error('Error fetching trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!trialData || hasProPlan || hasPaygPlan) {
    return null; // Don't show for paid users
  }

  const { trial_status, upgrade_required, message, details } = trialData;

  // Trial expired - show upgrade modal
  if (upgrade_required) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <CardTitle className="text-xl text-red-600">Trial Expired</CardTitle>
            <CardDescription className="text-gray-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Credits remaining:</span>
                <span className="font-medium">{details.credits_remaining}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Days remaining:</span>
                <span className="font-medium">{details.days_remaining}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trial used:</span>
                <span className="font-medium">{details.days_used} days</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/pricing">
                  🚀 Upgrade to Pro - $17.99/month
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">
                  💰 Buy Credits - Pay As You Go
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              Choose the plan that works best for you. Pro includes 500 credits/month, 
              while Pay-As-You-Go lets you buy credits as needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grace period - show popup warning only
  if (trial_status === 'grace_period') {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <Alert className="border-yellow-200 bg-yellow-50 shadow-lg">
          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <AlertDescription className="text-yellow-800">
            <div>
              <strong>Trial ending soon!</strong>
              <p className="text-sm mt-1">{message}</p>
              <Button asChild size="sm" className="mt-2 w-full">
                <Link href="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Don't show anything for active trial
  return null;
}
