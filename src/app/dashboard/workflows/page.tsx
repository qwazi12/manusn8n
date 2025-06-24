"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Link from "next/link";

interface Workflow {
  id: string;
  title: string;
  description: string;
  prompt: string;
  workflow_json: any;
  status: string;
  credits_used: number;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_date: string;
  created_time: string;
  relative_time: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows);
      } else {
        setError('Failed to fetch workflows');
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const copyWorkflowJSON = (workflow: any) => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    alert('Workflow JSON copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SignedIn>
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Workflows</h1>
              <p className="text-muted-foreground">View and manage your automation workflows</p>
            </div>
            <Button asChild>
              <Link href="/dashboard">Create New Workflow</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={fetchWorkflows}>Try Again</Button>
              </CardContent>
            </Card>
          ) : workflows.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No workflows yet</CardTitle>
                <CardDescription>
                  Your generated workflows will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by creating a new workflow from the dashboard.
                </p>
                <Button asChild>
                  <Link href="/dashboard">Create Your First Workflow</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{workflow.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p><strong>Prompt:</strong> {workflow.prompt.substring(0, 100)}...</p>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{workflow.relative_time}</span>
                        <span>{workflow.credits_used} credit{workflow.credits_used !== 1 ? 's' : ''}</span>
                      </div>

                      {workflow.tags && workflow.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {workflow.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {workflow.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{workflow.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyWorkflowJSON(workflow.workflow_json)}
                          className="flex-1"
                        >
                          📋 Copy JSON
                        </Button>
                        {workflow.is_public && (
                          <Badge variant="secondary" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {workflows.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              Showing {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}