#!/usr/bin/env tsx
/**
 * Test script for comprehensive n8n documentation
 * 
 * This script tests the ingested documentation by:
 * 1. Performing vector similarity searches
 * 2. Testing full-text search
 * 3. Verifying different categories
 * 4. Testing the AI's ability to find relevant docs
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

class DocumentationTester {
  async run(): Promise<void> {
    console.log('🧪 Testing comprehensive n8n documentation...');
    console.log('=' .repeat(60));
    
    try {
      // Test 1: Basic statistics
      await this.testBasicStats();
      
      // Test 2: Vector similarity search
      await this.testVectorSearch();
      
      // Test 3: Full-text search
      await this.testFullTextSearch();
      
      // Test 4: Category coverage
      await this.testCategoryCoverage();
      
      // Test 5: AI workflow generation context
      await this.testWorkflowContext();
      
      console.log('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Testing failed:', error);
    }
  }

  private async testBasicStats(): Promise<void> {
    console.log('\n📊 Test 1: Basic Statistics');
    console.log('-'.repeat(40));
    
    const { data, error } = await supabase
      .from('n8n_documentation')
      .select('category, subcategory, snippet_type, tokens')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Stats query failed: ${error.message}`);
    }
    
    const stats = {
      total: data?.length || 0,
      categories: new Set(data?.map(d => d.category)).size,
      subcategories: new Set(data?.map(d => d.subcategory)).size,
      totalTokens: data?.reduce((sum, d) => sum + (d.tokens || 0), 0) || 0,
      snippetTypes: data?.reduce((acc, d) => {
        acc[d.snippet_type] = (acc[d.snippet_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}
    };
    
    console.log(`📈 Total Documents: ${stats.total}`);
    console.log(`📁 Categories: ${stats.categories}`);
    console.log(`📂 Subcategories: ${stats.subcategories}`);
    console.log(`🔢 Total Tokens: ${stats.totalTokens.toLocaleString()}`);
    console.log(`📋 Snippet Types:`, stats.snippetTypes);
    
    if (stats.total < 100) {
      console.warn('⚠️  Warning: Low document count. Expected 500+ documents for full coverage.');
    } else {
      console.log('✅ Good document coverage detected');
    }
  }

  private async testVectorSearch(): Promise<void> {
    console.log('\n🔍 Test 2: Vector Similarity Search');
    console.log('-'.repeat(40));
    
    const testQueries = [
      'How to make HTTP requests in n8n',
      'Schedule trigger configuration',
      'JavaScript code node examples',
      'Webhook authentication setup'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔎 Query: "${query}"`);
      
      try {
        // Generate embedding for the query
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query,
        });
        
        const queryEmbedding = response.data[0].embedding;
        
        // Search for similar documents
        const { data, error } = await supabase.rpc('search_n8n_documentation', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 3
        });
        
        if (error) {
          console.error(`   ❌ Search failed: ${error.message}`);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`   ✅ Found ${data.length} relevant documents:`);
          data.forEach((doc: any, index: number) => {
            console.log(`   ${index + 1}. ${doc.title} (${doc.category}/${doc.subcategory}) - ${(doc.similarity * 100).toFixed(1)}% match`);
          });
        } else {
          console.log('   ⚠️  No relevant documents found');
        }
        
      } catch (error) {
        console.error(`   ❌ Vector search failed: ${error.message}`);
      }
    }
  }

  private async testFullTextSearch(): Promise<void> {
    console.log('\n📝 Test 3: Full-Text Search');
    console.log('-'.repeat(40));
    
    const testQueries = [
      'HTTP Request node',
      'expressions syntax',
      'workflow automation',
      'API authentication'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔎 Query: "${query}"`);
      
      try {
        const { data, error } = await supabase.rpc('search_n8n_documentation_text', {
          search_query: query,
          match_count: 3
        });
        
        if (error) {
          console.error(`   ❌ Search failed: ${error.message}`);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`   ✅ Found ${data.length} relevant documents:`);
          data.forEach((doc: any, index: number) => {
            console.log(`   ${index + 1}. ${doc.title} (${doc.category}) - Rank: ${doc.rank.toFixed(3)}`);
          });
        } else {
          console.log('   ⚠️  No relevant documents found');
        }
        
      } catch (error) {
        console.error(`   ❌ Full-text search failed: ${error.message}`);
      }
    }
  }

  private async testCategoryCoverage(): Promise<void> {
    console.log('\n📂 Test 4: Category Coverage');
    console.log('-'.repeat(40));
    
    const expectedCategories = [
      'integrations',
      'code',
      'workflows',
      'api',
      'hosting',
      'ai',
      'flow-logic',
      'credentials',
      'data',
      'getting-started'
    ];
    
    const { data, error } = await supabase
      .from('n8n_documentation')
      .select('category, count(*)')
      .group('category');
    
    if (error) {
      console.error(`❌ Category query failed: ${error.message}`);
      return;
    }
    
    const foundCategories = new Set(data?.map(d => d.category) || []);
    
    console.log('📋 Found Categories:');
    data?.forEach(cat => {
      console.log(`   📁 ${cat.category}: ${cat.count} documents`);
    });
    
    console.log('\n🎯 Coverage Analysis:');
    expectedCategories.forEach(category => {
      if (foundCategories.has(category)) {
        console.log(`   ✅ ${category}`);
      } else {
        console.log(`   ❌ ${category} (missing)`);
      }
    });
    
    const coveragePercent = (foundCategories.size / expectedCategories.length) * 100;
    console.log(`\n📊 Coverage: ${coveragePercent.toFixed(1)}% (${foundCategories.size}/${expectedCategories.length})`);
  }

  private async testWorkflowContext(): Promise<void> {
    console.log('\n🤖 Test 5: AI Workflow Generation Context');
    console.log('-'.repeat(40));
    
    const workflowScenarios = [
      'Create a workflow that sends Slack notifications when new emails arrive',
      'Build an automation that processes CSV files and saves data to Airtable',
      'Set up a webhook that triggers when GitHub issues are created',
      'Create a scheduled workflow that backs up database data daily'
    ];
    
    for (const scenario of workflowScenarios) {
      console.log(`\n🎯 Scenario: "${scenario}"`);
      
      try {
        // Generate embedding for the scenario
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: scenario,
        });
        
        const queryEmbedding = response.data[0].embedding;
        
        // Find relevant documentation
        const { data, error } = await supabase.rpc('search_n8n_documentation', {
          query_embedding: queryEmbedding,
          match_threshold: 0.6,
          match_count: 5
        });
        
        if (error) {
          console.error(`   ❌ Context search failed: ${error.message}`);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`   ✅ Found ${data.length} relevant context documents:`);
          
          const categories = new Set(data.map((doc: any) => doc.category));
          const snippetTypes = new Set(data.map((doc: any) => doc.snippet_type));
          
          console.log(`   📁 Categories: ${Array.from(categories).join(', ')}`);
          console.log(`   📋 Types: ${Array.from(snippetTypes).join(', ')}`);
          
          // Show top 2 most relevant
          data.slice(0, 2).forEach((doc: any, index: number) => {
            console.log(`   ${index + 1}. ${doc.title} (${(doc.similarity * 100).toFixed(1)}% match)`);
          });
        } else {
          console.log('   ⚠️  No relevant context found - AI may struggle with this scenario');
        }
        
      } catch (error) {
        console.error(`   ❌ Context search failed: ${error.message}`);
      }
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new DocumentationTester();
  tester.run().catch(console.error);
}

export { DocumentationTester };
