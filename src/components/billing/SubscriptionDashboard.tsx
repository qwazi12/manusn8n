"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, CreditCard, Download, ExternalLink, Settings } from 'lucide-react';

interface SubscriptionData {
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  credits: number;
  payment_history: Array<{
    id: string;
    amount_cents: number;
    currency: string;
    status: string;
    description: string;
    created_at: string;
  }>;
}

export function SubscriptionDashboard() {
  const { user } = useUser();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
    }
  };

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'trialing': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-gray-500';
      case 'incomplete': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>Manage your NodePilot subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No subscription data found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Subscription
                <Badge className={`text-white ${getStatusColor(subscriptionData.status)}`}>
                  {subscriptionData.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscriptionData.plan} Plan • {subscriptionData.credits} credits remaining
              </CardDescription>
            </div>
            <Button onClick={handleManageSubscription} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Plan Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan:</span>
                    <span className="font-medium">{subscriptionData.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className={`${getStatusColor(subscriptionData.status)} text-white`}>
                      {subscriptionData.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="font-medium">{subscriptionData.credits}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Billing Information</h4>
                <div className="space-y-2 text-sm">
                  {subscriptionData.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next billing:</span>
                      <span className="font-medium">
                        {formatDate(subscriptionData.current_period_end)}
                      </span>
                    </div>
                  )}
                  {subscriptionData.cancel_at_period_end && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancellation:</span>
                      <span className="font-medium text-yellow-600">
                        Ends {formatDate(subscriptionData.current_period_end)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Your recent transactions and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionData.payment_history && subscriptionData.payment_history.length > 0 ? (
            <div className="space-y-4">
              {subscriptionData.payment_history.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      payment.status === 'succeeded' ? 'bg-green-500' : 
                      payment.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(payment.amount_cents, payment.currency)}
                    </p>
                    <Badge 
                      variant={payment.status === 'succeeded' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No payment history available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your account and billing preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={handleManageSubscription} className="h-auto p-4">
              <div className="text-center">
                <Settings className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Manage Subscription</div>
                <div className="text-xs text-muted-foreground">Update payment method, cancel subscription</div>
              </div>
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/pricing'} className="h-auto p-4">
              <div className="text-center">
                <ExternalLink className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Upgrade Plan</div>
                <div className="text-xs text-muted-foreground">View available plans and features</div>
              </div>
            </Button>
            
            <Button variant="outline" onClick={() => window.open('mailto:nodepilotdev@gmail.com')} className="h-auto p-4">
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Contact Support</div>
                <div className="text-xs text-muted-foreground">Get help with your subscription</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
