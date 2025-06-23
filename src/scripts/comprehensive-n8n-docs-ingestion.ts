#!/usr/bin/env tsx
/**
 * Comprehensive n8n Documentation Ingestion Script
 * 
 * This script pulls 100% of the n8n documentation from the official repository
 * and stores it in Supabase with proper categorization and embeddings.
 * 
 * Usage: npx tsx src/scripts/comprehensive-n8n-docs-ingestion.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const REPO_URL = 'https://github.com/n8n-io/n8n-docs.git';
const TEMP_DIR = './temp-n8n-docs';
const DOCS_DIR = path.join(TEMP_DIR, 'docs');

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface DocumentChunk {
  title: string;
  content: string;
  category: string;
  subcategory: string;
  file_path: string;
  source_url: string;
  tokens: number;
  snippet_type: 'explanation' | 'code' | 'reference' | 'example' | 'guide';
  keywords: string[];
  section_header?: string;
  embedding?: number[];
}

class N8nDocsIngestion {
  private processedCount = 0;
  private totalFiles = 0;
  private errors: string[] = [];

  async run(): Promise<void> {
    console.log('🚀 Starting comprehensive n8n documentation ingestion...');
    
    try {
      // Step 1: Clone repository
      await this.cloneRepository();
      
      // Step 2: Clear existing documentation
      await this.clearExistingDocs();
      
      // Step 3: Scan and process all files
      const files = await this.scanDocumentationFiles();
      this.totalFiles = files.length;
      
      console.log(`📁 Found ${this.totalFiles} documentation files to process`);
      
      // Step 4: Process files in batches
      await this.processFilesInBatches(files, 5);
      
      // Step 5: Cleanup
      await this.cleanup();
      
      console.log('✅ Documentation ingestion completed successfully!');
      console.log(`📊 Processed: ${this.processedCount}/${this.totalFiles} files`);
      
      if (this.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${this.errors.length}`);
        this.errors.forEach(error => console.log(`   - ${error}`));
      }
      
    } catch (error) {
      console.error('❌ Fatal error during ingestion:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  private async cloneRepository(): Promise<void> {
    console.log('📥 Cloning n8n documentation repository...');
    
    // Remove existing temp directory
    try {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    // Clone repository
    execSync(`git clone --depth 1 ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
    console.log('✅ Repository cloned successfully');
  }

  private async clearExistingDocs(): Promise<void> {
    console.log('🗑️  Clearing existing documentation...');
    
    const { error } = await supabase
      .from('n8n_documentation')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) {
      console.error('Error clearing existing docs:', error);
      throw error;
    }
    
    console.log('✅ Existing documentation cleared');
  }

  private async scanDocumentationFiles(): Promise<string[]> {
    console.log('🔍 Scanning documentation files...');
    
    const files: string[] = [];
    
    async function scanDirectory(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Skip certain directories
            if (!entry.name.startsWith('.') && 
                !entry.name.startsWith('_') && 
                entry.name !== 'node_modules') {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan directory ${dir}:`, error);
      }
    }
    
    await scanDirectory(DOCS_DIR);
    return files;
  }

  private async processFilesInBatches(files: string[], batchSize: number): Promise<void> {
    console.log(`⚙️  Processing files in batches of ${batchSize}...`);
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(files.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} files)`);
      
      await Promise.all(
        batch.map(file => this.processFile(file).catch(error => {
          this.errors.push(`${file}: ${error.message}`);
          console.error(`❌ Error processing ${file}:`, error.message);
        }))
      );
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async processFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativePath = path.relative(DOCS_DIR, filePath);
      
      // Parse frontmatter and content
      const { data: frontmatter, content: markdownContent } = matter(content);
      
      // Determine category and subcategory from file path
      const pathParts = relativePath.split(path.sep);
      const category = this.determineCategory(pathParts);
      const subcategory = this.determineSubcategory(pathParts);
      
      // Split content into logical chunks
      const chunks = await this.splitIntoChunks(markdownContent, {
        title: frontmatter.title || this.extractTitleFromPath(relativePath),
        category,
        subcategory,
        file_path: relativePath,
        source_url: `https://github.com/n8n-io/n8n-docs/blob/main/docs/${relativePath}`,
      });
      
      // Process each chunk
      for (const chunk of chunks) {
        await this.processChunk(chunk);
      }
      
      this.processedCount++;
      
      if (this.processedCount % 10 === 0) {
        console.log(`📈 Progress: ${this.processedCount}/${this.totalFiles} files processed`);
      }
      
    } catch (error) {
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  private determineCategory(pathParts: string[]): string {
    const firstPart = pathParts[0]?.toLowerCase() || 'general';
    
    const categoryMap: Record<string, string> = {
      'integrations': 'integrations',
      'code': 'code',
      'workflows': 'workflows',
      'api': 'api',
      'hosting': 'hosting',
      'advanced-ai': 'ai',
      'flow-logic': 'flow-logic',
      'credentials': 'credentials',
      'data': 'data',
      'try-it-out': 'getting-started',
      'courses': 'learning',
      'help-community': 'community',
      'manage-cloud': 'cloud',
      'privacy-security': 'security',
      'source-control-environments': 'source-control',
      'user-management': 'user-management',
      'embed': 'embedding',
    };
    
    return categoryMap[firstPart] || 'general';
  }

  private determineSubcategory(pathParts: string[]): string {
    if (pathParts.length > 1) {
      return pathParts[1].toLowerCase().replace(/\.md$/, '');
    }
    return pathParts[0]?.toLowerCase().replace(/\.md$/, '') || 'general';
  }

  private extractTitleFromPath(filePath: string): string {
    const fileName = path.basename(filePath, '.md');
    return fileName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async splitIntoChunks(content: string, metadata: Partial<DocumentChunk>): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];
    
    // Convert markdown to HTML for better parsing
    const html = marked(content);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract sections based on headers
    const sections = this.extractSections(document);
    
    if (sections.length === 0) {
      // No sections found, treat entire content as one chunk
      chunks.push(await this.createChunk(content, metadata));
    } else {
      // Process each section
      for (const section of sections) {
        if (section.content.trim().length > 50) { // Only process substantial content
          chunks.push(await this.createChunk(section.content, {
            ...metadata,
            section_header: section.header,
          }));
        }
      }
    }
    
    return chunks;
  }

  private extractSections(document: Document): Array<{ header: string; content: string }> {
    const sections: Array<{ header: string; content: string }> = [];
    const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headers.forEach((header, index) => {
      const headerText = header.textContent || '';
      let content = '';
      
      // Collect content until next header of same or higher level
      let currentElement = header.nextElementSibling;
      const headerLevel = parseInt(header.tagName.charAt(1));
      
      while (currentElement) {
        if (currentElement.tagName.match(/^H[1-6]$/)) {
          const currentLevel = parseInt(currentElement.tagName.charAt(1));
          if (currentLevel <= headerLevel) {
            break;
          }
        }
        
        content += currentElement.textContent || '';
        currentElement = currentElement.nextElementSibling;
      }
      
      if (content.trim()) {
        sections.push({
          header: headerText,
          content: content.trim(),
        });
      }
    });
    
    return sections;
  }

  private async createChunk(content: string, metadata: Partial<DocumentChunk>): Promise<DocumentChunk> {
    const cleanContent = this.cleanContent(content);
    const tokens = this.estimateTokens(cleanContent);
    const keywords = this.extractKeywords(cleanContent);
    const snippetType = this.determineSnippetType(cleanContent);
    
    // Generate embedding
    const embedding = await this.generateEmbedding(cleanContent);
    
    return {
      title: metadata.title || 'Untitled',
      content: cleanContent,
      category: metadata.category || 'general',
      subcategory: metadata.subcategory || 'general',
      file_path: metadata.file_path || '',
      source_url: metadata.source_url || '',
      tokens,
      snippet_type: snippetType,
      keywords,
      section_header: metadata.section_header,
      embedding,
    };
  }

  private cleanContent(content: string): string {
    return content
      .replace(/```[\s\S]*?```/g, (match) => match) // Preserve code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code backticks but keep content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Convert images to alt text
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic formatting
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  private estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private determineSnippetType(content: string): DocumentChunk['snippet_type'] {
    if (content.includes('```') || content.includes('function') || content.includes('const ')) {
      return 'code';
    } else if (content.includes('example') || content.includes('Example')) {
      return 'example';
    } else if (content.includes('guide') || content.includes('tutorial') || content.includes('step')) {
      return 'guide';
    } else if (content.includes('parameter') || content.includes('option') || content.includes('field')) {
      return 'reference';
    } else {
      return 'explanation';
    }
  }

  private async generateEmbedding(content: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content.slice(0, 8000), // Limit to avoid token limits
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.warn('Failed to generate embedding:', error.message);
      return [];
    }
  }

  private async processChunk(chunk: DocumentChunk): Promise<void> {
    try {
      const { error } = await supabase
        .from('n8n_documentation')
        .insert([{
          title: chunk.title,
          content: chunk.content,
          category: chunk.category,
          subcategory: chunk.subcategory,
          file_path: chunk.file_path,
          source_url: chunk.source_url,
          tokens: chunk.tokens,
          snippet_type: chunk.snippet_type,
          keywords: chunk.keywords,
          section_header: chunk.section_header,
          embedding: chunk.embedding,
        }]);
      
      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to store chunk: ${error.message}`);
    }
  }

  private async cleanup(): Promise<void> {
    try {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
      console.log('🧹 Cleanup completed');
    } catch (error) {
      console.warn('Warning: Cleanup failed:', error.message);
    }
  }
}

// Run the ingestion
if (require.main === module) {
  const ingestion = new N8nDocsIngestion();
  ingestion.run().catch(console.error);
}

export { N8nDocsIngestion };
