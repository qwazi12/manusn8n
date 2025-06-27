'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  node_count: number;
  complexity_level: string;
  use_cases: string[];
  integrations: string[];
  keywords: string[];
  is_featured: boolean;
  workflow_json: any;
}

const complexityColors = {
  simple: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const categoryIcons = {
  'AI & Automation': '🤖',
  'Content Creation': '📝',
  'Business Automation': '💼',
  'Data Processing': '📊',
  'Communication': '💬',
  'E-commerce': '🛒'
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedComplexity]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(template => template.complexity_level === selectedComplexity);
    }

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      // Ensure we have valid workflow JSON
      if (!template.workflow_json) {
        alert('This template does not have workflow data available.');
        return;
      }

      // Copy workflow JSON to clipboard
      const workflowJson = JSON.stringify(template.workflow_json, null, 2);
      await navigator.clipboard.writeText(workflowJson);

      // Show success message with instructions
      alert(`✅ ${template.name} workflow JSON copied to clipboard!\n\n📋 To use this workflow:\n1. Open n8n\n2. Click "Import from clipboard"\n3. Paste the workflow\n4. Configure your credentials\n\nWorkflow size: ${Math.round(workflowJson.length / 1024)}KB`);

      console.log('📋 Template copied:', {
        name: template.name,
        size: workflowJson.length,
        nodeCount: template.node_count
      });
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);

      // Fallback: try to download as file
      try {
        const blob = new Blob([JSON.stringify(template.workflow_json, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(`📥 ${template.name} workflow downloaded as JSON file!\n\nTo use: Import this file in n8n.`);
      } catch (downloadError) {
        console.error('❌ Download fallback failed:', downloadError);
        alert('❌ Error copying workflow. Please try refreshing the page.');
      }
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-32 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="max-w-6xl mx-auto mt-32 px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quick Start Templates</h1>
            <p className="text-xl text-gray-600">Production-ready n8n workflows to jumpstart your automation</p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {categoryIcons[category as keyof typeof categoryIcons]} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {categoryIcons[template.category as keyof typeof categoryIcons] || '⚡'}
                        </span>
                        {template.is_featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                      <CardDescription className="text-sm line-clamp-3">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={complexityColors[template.complexity_level as keyof typeof complexityColors]}
                      >
                        {template.complexity_level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.node_count} nodes
                      </Badge>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Use Cases:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.use_cases.slice(0, 3).map((useCase, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                        {template.use_cases.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.use_cases.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Integrations */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Integrations:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.integrations.slice(0, 3).map((integration, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                        {template.integrations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.integrations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                      variant="default"
                    >
                      📋 Copy Workflow JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTemplates.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or browse all templates.</p>
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
