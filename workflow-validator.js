#!/usr/bin/env node

/**
 * NodePilot Workflow Validator
 * Validates n8n workflow JSON for common import issues
 */

const fs = require('fs');
const path = require('path');

function validateWorkflow(workflowJson) {
  const issues = [];
  const warnings = [];
  
  try {
    const workflow = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson;
    
    // 1. Check basic structure
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      issues.push("Missing or invalid 'nodes' array");
      return { valid: false, issues, warnings };
    }
    
    // 2. Validate each node
    workflow.nodes.forEach((node, index) => {
      const nodePrefix = `Node ${index + 1} (${node.name || 'unnamed'})`;
      
      // Required fields
      if (!node.id) issues.push(`${nodePrefix}: Missing 'id' field`);
      if (!node.name) issues.push(`${nodePrefix}: Missing 'name' field`);
      if (!node.type) issues.push(`${nodePrefix}: Missing 'type' field`);
      if (!node.typeVersion) warnings.push(`${nodePrefix}: Missing 'typeVersion' field`);
      if (!node.position) warnings.push(`${nodePrefix}: Missing 'position' field`);
      
      // Check for common problematic node types
      const problematicTypes = [
        '@n8n/n8n-nodes-langchain.agent',
        '@n8n/n8n-nodes-langchain.chatTrigger',
        '@n8n/n8n-nodes-langchain.lmChatOpenAi'
      ];
      
      if (problematicTypes.includes(node.type)) {
        warnings.push(`${nodePrefix}: Uses LangChain node - ensure you have @n8n/n8n-nodes-langchain package installed`);
      }
      
      // Check typeVersion compatibility
      if (node.typeVersion && node.typeVersion > 3) {
        warnings.push(`${nodePrefix}: High typeVersion (${node.typeVersion}) - may not be compatible with older n8n versions`);
      }
      
      // Check parameters
      if (node.parameters) {
        // Look for common problematic parameters
        if (node.parameters.options && typeof node.parameters.options !== 'object') {
          issues.push(`${nodePrefix}: Invalid 'options' parameter format`);
        }
        
        // Check for undefined/null values that should be strings
        Object.keys(node.parameters).forEach(key => {
          const value = node.parameters[key];
          if (value === undefined || value === null) {
            warnings.push(`${nodePrefix}: Parameter '${key}' is null/undefined`);
          }
        });
      }
    });
    
    // 3. Validate connections
    if (workflow.connections) {
      const nodeNames = workflow.nodes.map(n => n.name);
      const nodeIds = workflow.nodes.map(n => n.id);

      Object.keys(workflow.connections).forEach(sourceKey => {
        // Check if source exists (can be name or ID)
        if (!nodeNames.includes(sourceKey) && !nodeIds.includes(sourceKey)) {
          issues.push(`Connection references non-existent source node: ${sourceKey}`);
        }

        const connections = workflow.connections[sourceKey];
        if (connections.main && Array.isArray(connections.main)) {
          connections.main.forEach((targetList, outputIndex) => {
            if (Array.isArray(targetList)) {
              targetList.forEach(target => {
                // Check if target exists (can be name or ID)
                if (target.node && !nodeNames.includes(target.node) && !nodeIds.includes(target.node)) {
                  issues.push(`Connection references non-existent target node: ${target.node}`);
                }
              });
            }
          });
        }
      });
    }
    
    // 4. Check for common n8n compatibility issues
    const hasManualTrigger = workflow.nodes.some(n => n.type === 'n8n-nodes-base.manualTrigger');
    const hasOtherTriggers = workflow.nodes.some(n => 
      n.type.includes('Trigger') && n.type !== 'n8n-nodes-base.manualTrigger'
    );
    
    if (!hasManualTrigger && !hasOtherTriggers) {
      warnings.push("No trigger node found - workflow may not execute");
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings,
      nodeCount: workflow.nodes.length,
      summary: issues.length === 0 ? 'Workflow appears valid' : `${issues.length} critical issues found`
    };
    
  } catch (error) {
    return {
      valid: false,
      issues: [`JSON parsing error: ${error.message}`],
      warnings: [],
      summary: 'Invalid JSON format'
    };
  }
}

function fixCommonIssues(workflowJson) {
  try {
    const workflow = typeof workflowJson === 'string' ? JSON.parse(workflowJson) : workflowJson;
    
    // Fix 1: Ensure all nodes have required fields
    workflow.nodes = workflow.nodes.map((node, index) => {
      const fixed = { ...node };
      
      // Add missing typeVersion
      if (!fixed.typeVersion) {
        fixed.typeVersion = 1; // Safe default
      }
      
      // Add missing position
      if (!fixed.position) {
        fixed.position = [index * 200, 0]; // Simple positioning
      }
      
      // Fix null/undefined parameters
      if (fixed.parameters) {
        Object.keys(fixed.parameters).forEach(key => {
          if (fixed.parameters[key] === null || fixed.parameters[key] === undefined) {
            delete fixed.parameters[key];
          }
        });
      }
      
      // Ensure parameters object exists
      if (!fixed.parameters) {
        fixed.parameters = {};
      }
      
      return fixed;
    });
    
    // Fix 2: Ensure connections exist
    if (!workflow.connections) {
      workflow.connections = {};
    }
    
    return JSON.stringify(workflow, null, 2);
    
  } catch (error) {
    throw new Error(`Cannot fix workflow: ${error.message}`);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
NodePilot Workflow Validator

Usage:
  node workflow-validator.js <workflow.json>     # Validate workflow file
  node workflow-validator.js --fix <workflow.json>  # Fix and output corrected workflow

Examples:
  node workflow-validator.js my-workflow.json
  node workflow-validator.js --fix my-workflow.json > fixed-workflow.json
    `);
    process.exit(1);
  }
  
  const shouldFix = args[0] === '--fix';
  const filePath = shouldFix ? args[1] : args[0];
  
  if (!filePath || !fs.existsSync(filePath)) {
    console.error('Error: Workflow file not found');
    process.exit(1);
  }
  
  try {
    const workflowContent = fs.readFileSync(filePath, 'utf8');
    
    if (shouldFix) {
      const fixed = fixCommonIssues(workflowContent);
      console.log(fixed);
    } else {
      const result = validateWorkflow(workflowContent);
      
      console.log(`\n🔍 Workflow Validation Results:`);
      console.log(`Status: ${result.valid ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`Summary: ${result.summary}`);
      
      if (result.issues.length > 0) {
        console.log(`\n❌ Critical Issues (${result.issues.length}):`);
        result.issues.forEach(issue => console.log(`  • ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`\n⚠️  Warnings (${result.warnings.length}):`);
        result.warnings.forEach(warning => console.log(`  • ${warning}`));
      }
      
      if (!result.valid) {
        console.log(`\n💡 To attempt automatic fixes, run:`);
        console.log(`   node workflow-validator.js --fix ${filePath} > fixed-workflow.json`);
      }
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { validateWorkflow, fixCommonIssues };
