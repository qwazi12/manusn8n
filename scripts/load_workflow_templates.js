#!/usr/bin/env node

/**
 * Load Real n8n Workflow Templates from N8N Trainings folder
 * This script loads the actual workflow JSON files provided by the user
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEMPLATES_DIR = path.join(__dirname, '..', 'N8N Trainings');

// Template metadata mapping
const templateMetadata = {
  'R23_YouTube_Curator_AI_Agent (1).json': {
    name: 'YouTube Curator AI Agent',
    description: 'Automatically discovers, analyzes, and curates YouTube videos with AI-powered quality scoring',
    category: 'Content Curation',
    use_cases: ['YouTube automation', 'Content discovery', 'AI curation', 'Video analysis'],
    difficulty: 'intermediate',
    estimated_time: '30 minutes'
  },
  'R28_LongForm_YouTube_Creator_Agent.json': {
    name: 'LongForm YouTube Creator Agent',
    description: 'Complete system for creating long-form YouTube content with AI assistance',
    category: 'Content Creation',
    use_cases: ['YouTube creation', 'Long-form content', 'AI writing', 'Video production'],
    difficulty: 'advanced',
    estimated_time: '45 minutes'
  },
  'R24___Faceless_POV_AI_Agent (1).json': {
    name: 'Faceless POV AI Agent',
    description: 'Creates faceless point-of-view content using AI automation',
    category: 'Content Creation',
    use_cases: ['Faceless content', 'POV videos', 'AI automation', 'Social media'],
    difficulty: 'intermediate',
    estimated_time: '25 minutes'
  },
  'R25___The_Ultimate_Publishing_Agent.json': {
    name: 'Ultimate Publishing Agent',
    description: 'Complete publishing workflow with AI-powered content distribution',
    category: 'Publishing',
    use_cases: ['Content publishing', 'Multi-platform', 'AI distribution', 'Automation'],
    difficulty: 'advanced',
    estimated_time: '60 minutes'
  },
  'R27___Infinite_AI_Leads_Agent.json': {
    name: 'Infinite AI Leads Agent',
    description: 'Automated lead generation system using AI and multiple data sources',
    category: 'Lead Generation',
    use_cases: ['Lead generation', 'AI prospecting', 'Sales automation', 'CRM integration'],
    difficulty: 'advanced',
    estimated_time: '40 minutes'
  },
  'R18 AI Music Creator Requester.json': {
    name: 'AI Music Creator Requester',
    description: 'AI-powered music creation and request handling system',
    category: 'Creative AI',
    use_cases: ['Music creation', 'AI composition', 'Audio automation', 'Creative workflows'],
    difficulty: 'intermediate',
    estimated_time: '35 minutes'
  },
  'R18 AI Music Creator Receiver.json': {
    name: 'AI Music Creator Receiver',
    description: 'Receives and processes AI music creation requests',
    category: 'Creative AI',
    use_cases: ['Music processing', 'AI audio', 'Request handling', 'File management'],
    difficulty: 'intermediate',
    estimated_time: '30 minutes'
  },
  'Samantha_AI.json': {
    name: 'Samantha AI Assistant',
    description: 'Advanced AI assistant for complex task automation and conversation',
    category: 'AI Assistant',
    use_cases: ['AI assistant', 'Task automation', 'Conversation AI', 'Personal productivity'],
    difficulty: 'advanced',
    estimated_time: '50 minutes'
  },
  'n2_Think Tool Workflow Toolkit.json': {
    name: 'Think Tool Workflow Toolkit',
    description: 'Comprehensive toolkit for building thinking and reasoning workflows',
    category: 'AI Tools',
    use_cases: ['AI reasoning', 'Decision making', 'Problem solving', 'Workflow toolkit'],
    difficulty: 'expert',
    estimated_time: '90 minutes'
  },
  'R29 Monetizable Faceless AI System by RoboNuggets.json': {
    name: 'Monetizable Faceless AI System',
    description: 'Complete system for creating monetizable faceless content with AI',
    category: 'Monetization',
    use_cases: ['Faceless monetization', 'AI content', 'Revenue generation', 'Automation'],
    difficulty: 'expert',
    estimated_time: '120 minutes'
  }
};

async function loadWorkflowTemplates() {
  console.log('🚀 Loading real n8n workflow templates from N8N Trainings folder...');
  
  try {
    // Check if templates directory exists
    if (!fs.existsSync(TEMPLATES_DIR)) {
      console.error('❌ N8N Trainings directory not found:', TEMPLATES_DIR);
      return;
    }

    // Get all JSON files
    const jsonFiles = fs.readdirSync(TEMPLATES_DIR)
      .filter(file => file.endsWith('.json'))
      .filter(file => templateMetadata[file]); // Only load files we have metadata for

    console.log(`📁 Found ${jsonFiles.length} workflow template files`);

    let loadedCount = 0;
    let errorCount = 0;

    for (const filename of jsonFiles) {
      try {
        const filePath = path.join(TEMPLATES_DIR, filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Parse and validate JSON
        const workflowJson = JSON.parse(fileContent);
        const metadata = templateMetadata[filename];
        
        // Count nodes for validation
        const nodeCount = workflowJson.nodes ? workflowJson.nodes.length : 0;
        const connectionCount = workflowJson.connections ? Object.keys(workflowJson.connections).length : 0;
        
        console.log(`📋 Processing: ${metadata.name} (${nodeCount} nodes, ${connectionCount} connections)`);
        
        if (nodeCount === 0) {
          console.warn(`⚠️  Warning: ${filename} has no nodes`);
        }

        // Check if template already exists
        const { data: existing } = await supabase
          .from('workflow_templates')
          .select('id')
          .eq('name', metadata.name)
          .single();

        let data, error;

        if (existing) {
          // Update existing template
          ({ data, error } = await supabase
            .from('workflow_templates')
            .update({
              description: metadata.description,
              category: metadata.category,
              workflow_json: workflowJson,
              node_count: nodeCount,
              complexity_level: metadata.difficulty,
              use_cases: metadata.use_cases,
              keywords: metadata.use_cases,
              integrations: ['n8n', 'AI', 'automation'],
              is_active: true,
              is_public: true,
              is_featured: true
            })
            .eq('id', existing.id));
        } else {
          // Insert new template
          ({ data, error } = await supabase
            .from('workflow_templates')
            .insert({
              name: metadata.name,
              description: metadata.description,
              category: metadata.category,
              workflow_json: workflowJson,
              node_count: nodeCount,
              complexity_level: metadata.difficulty,
              use_cases: metadata.use_cases,
              keywords: metadata.use_cases,
              integrations: ['n8n', 'AI', 'automation'],
              is_active: true,
              is_public: true,
              is_featured: true
            }));
        }

        if (error) {
          console.error(`❌ Error loading ${filename}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Loaded: ${metadata.name}`);
          loadedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Template loading complete!`);
    console.log(`✅ Successfully loaded: ${loadedCount} templates`);
    console.log(`❌ Errors: ${errorCount} templates`);
    
    if (loadedCount > 0) {
      console.log(`\n📊 Templates are now available in NodePilot with real n8n workflows!`);
    }

  } catch (error) {
    console.error('❌ Fatal error loading templates:', error);
  }
}

// Run the script
if (require.main === module) {
  loadWorkflowTemplates();
}

module.exports = { loadWorkflowTemplates };
