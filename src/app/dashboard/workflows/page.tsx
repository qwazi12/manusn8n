"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const mockWorkflows = [
  {
    id: "1",
    name: "Automate Marketing Campaigns",
    description: "Multi-channel marketing automation for your business.",
    status: "Active",
    createdAt: "2024-06-01",
  },
  {
    id: "2",
    name: "AI-Powered Lead Scoring",
    description: "Prioritize sales leads using AI.",
    status: "Draft",
    createdAt: "2024-06-02",
  },
  {
    id: "3",
    name: "Social Media Scheduler",
    description: "Automate your social media posts.",
    status: "Active",
    createdAt: "2024-06-03",
  },
];

export default function WorkflowsDashboard() {
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const handleDelete = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <>
      <SignedIn>
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">My Workflows</h1>
            <Button asChild variant="default" size="sm" className="gap-2 bg-salmon-500 hover:bg-salmon-600">
              <Link href="/dashboard/create">
                <Plus className="w-4 h-4" />
                Create Workflow
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="bg-[#181818] border border-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription className="text-gray-400">{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Created: {workflow.createdAt}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        workflow.status === 'Active'
                          ? 'bg-green-700 text-green-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {workflow.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/workflows/${workflow.id}`}>
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/dashboard/workflows/${workflow.id}/edit`}>
                        <Pencil className="w-4 h-4" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {workflows.length === 0 && (
            <div className="text-center text-gray-400 mt-12">No workflows found. Click "Create Workflow" to get started.</div>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
} 