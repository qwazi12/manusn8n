#!/usr/bin/env node

/**
 * Script to parse n8n_Tips_and_Tricks.txt and load optimization tips into Supabase
 * This will help NodePilot generate better, error-free workflows
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse the tips and tricks file into structured data
function parseTipsFile(filePath) {
  console.log('Reading tips and tricks file...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const tips = [];
  
  // Split by section headers (lines with dashes)
  const sections = content.split(/─{20,}/);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const title = lines[0].trim();
    if (!title || title.includes('CHEAT SHEET') || title.includes('END OF')) continue;
    
    // Extract category and content
    let category = 'General';
    let nodeTypes = [];
    
    // Determine category from title
    if (title.includes('CHAT TRIGGER')) {
      category = 'Chat Triggers';
      nodeTypes = ['@n8n/n8n-nodes-langchain.chatTrigger'];
    } else if (title.includes('STICKY NOTE')) {
      category = 'Documentation';
      nodeTypes = ['n8n-nodes-base.stickyNote'];
    } else if (title.includes('AI AGENT')) {
      category = 'AI Agents';
      nodeTypes = ['@n8n/n8n-nodes-langchain.agent'];
    } else if (title.includes('MEMORY BUFFER')) {
      category = 'Memory Management';
      nodeTypes = ['@n8n/n8n-nodes-langchain.memoryBufferWindow'];
    } else if (title.includes('INTEGRATION TOOLS')) {
      category = 'Integrations';
      nodeTypes = ['n8n-nodes-base.httpRequest', 'n8n-nodes-base.googleSheets'];
    } else if (title.includes('PROPERTY VALUE ISSUES')) {
      category = 'JSON Validation';
      nodeTypes = ['*']; // Applies to all nodes
    }
    
    // Extract key tips from the section
    const content_text = lines.slice(1).join('\n');
    
    // Split into individual tips
    const tipBlocks = content_text.split(/•|\n\n/);
    
    for (const block of tipBlocks) {
      const tip = block.trim();
      if (tip.length < 20) continue; // Skip very short tips
      
      // Extract tip title (first line or sentence)
      const tipLines = tip.split('\n');
      const tipTitle = tipLines[0].replace(/[•\-\*]/g, '').trim();
      
      if (!tipTitle) continue;
      
      // Determine difficulty level
      let difficulty = 'beginner';
      if (tip.includes('advanced') || tip.includes('complex') || tip.includes('nuance')) {
        difficulty = 'advanced';
      } else if (tip.includes('integration') || tip.includes('dynamic') || tip.includes('expression')) {
        difficulty = 'intermediate';
      }
      
      tips.push({
        category: category,
        tip_title: tipTitle.substring(0, 200), // Limit title length
        tip_content: tip.substring(0, 1000), // Limit content length
        node_types: nodeTypes,
        difficulty_level: difficulty,
        is_active: true
      });
    }
  }
  
  // Add some essential performance tips
  const performanceTips = [
    {
      category: 'Performance',
      tip_title: 'Use HTTP Request for API calls instead of specialized nodes when possible',
      tip_content: 'HTTP Request nodes are more flexible and often faster than specialized API nodes. Use them for custom integrations and when you need full control over the request.',
      node_types: ['n8n-nodes-base.httpRequest'],
      difficulty_level: 'intermediate',
      is_active: true
    },
    {
      category: 'Performance',
      tip_title: 'Limit AI Agent system message length for faster processing',
      tip_content: 'Keep system messages concise and focused. Long system messages slow down AI processing. Use bullet points and clear structure.',
      node_types: ['@n8n/n8n-nodes-langchain.agent'],
      difficulty_level: 'intermediate',
      is_active: true
    },
    {
      category: 'Error Prevention',
      tip_title: 'Always validate JSON structure before generating workflows',
      tip_content: 'Use double quotes, avoid trailing commas, ensure proper data types. Numbers and booleans should not be quoted.',
      node_types: ['*'],
      difficulty_level: 'beginner',
      is_active: true
    },
    {
      category: 'Optimization',
      tip_title: 'Use Schedule Triggers for time-based automation',
      tip_content: 'Schedule Triggers are more reliable than polling. Use cron expressions for complex scheduling needs.',
      node_types: ['n8n-nodes-base.scheduleTrigger'],
      difficulty_level: 'beginner',
      is_active: true
    }
  ];
  
  tips.push(...performanceTips);
  
  console.log(`Parsed ${tips.length} workflow tips`);
  return tips;
}

// Load tips into Supabase
async function loadTips(tips) {
  console.log('Loading workflow tips into Supabase...');
  
  // Clear existing tips first
  await supabase.from('workflow_tips').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const batchSize = 50;
  let loaded = 0;
  
  for (let i = 0; i < tips.length; i += batchSize) {
    const batch = tips.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('workflow_tips')
      .insert(batch);
    
    if (error) {
      console.error('Error loading tips batch:', error);
      continue;
    }
    
    loaded += batch.length;
    console.log(`Loaded ${loaded}/${tips.length} workflow tips`);
  }
  
  console.log('✅ Workflow tips loaded successfully!');
}

// Main execution
async function main() {
  try {
    const filePath = './N8N Trainings/n8n_Tips_and_Tricks (1).txt';
    
    if (!fs.existsSync(filePath)) {
      console.error('Tips file not found:', filePath);
      process.exit(1);
    }
    
    const tips = parseTipsFile(filePath);
    await loadTips(tips);
    
    console.log('🚀 NodePilot optimization tips loaded!');
    console.log('Workflow quality should now be significantly improved.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseTipsFile, loadTips };
