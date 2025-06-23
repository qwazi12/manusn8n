// src/scripts/testRagSystem.ts
import { Context7IntegrationService } from '../services/context7IntegrationService';
import { EnhancedNodePilotAiService } from '../services/enhancedNodePilotAiService';
import { DocumentationIngestionService } from '../services/documentationIngestionService';

async function testRagSystem() {
    console.log('🚀 Testing NodePilot RAG System with Context7 Integration');
    console.log('=' .repeat(60));

    try {
        // Initialize services
        const context7Service = new Context7IntegrationService();
        const aiService = new EnhancedNodePilotAiService();
        const ingestionService = new DocumentationIngestionService();

        // Step 1: Test Context7 Integration
        console.log('\n📚 Step 1: Testing Context7 Documentation Fetch');
        console.log('-'.repeat(50));
        
        const context7Stats = await context7Service.getContext7Stats();
        console.log('Context7 Stats:', context7Stats);

        // Step 2: Test Documentation Ingestion
        console.log('\n🔄 Step 2: Testing Documentation Ingestion');
        console.log('-'.repeat(50));
        
        const ingestionResult = await context7Service.ingestContext7Documentation();
        console.log('Ingestion Result:', ingestionResult);

        // Step 3: Test Documentation Statistics
        console.log('\n📊 Step 3: Testing Documentation Statistics');
        console.log('-'.repeat(50));
        
        const docStats = await ingestionService.getDocumentationStats();
        console.log('Documentation Stats:', docStats);

        // Step 4: Test Enhanced AI Workflow Generation
        console.log('\n🤖 Step 4: Testing Enhanced AI Workflow Generation');
        console.log('-'.repeat(50));
        
        const testRequests = [
            {
                description: "Create a workflow that fetches data from an API every hour and sends an email notification",
                userId: "test-user-id",
                userTier: "pro" as const,
                preferences: {
                    includeComments: true,
                    complexityLevel: "medium" as const,
                    maxTokens: 4000
                }
            },
            {
                description: "Build an automation that processes webhook data and stores it in a database",
                userId: "test-user-id",
                userTier: "starter" as const,
                preferences: {
                    includeComments: false,
                    complexityLevel: "simple" as const,
                    maxTokens: 3000
                }
            },
            {
                description: "How do I configure authentication for the HTTP Request node?",
                userId: "test-user-id",
                userTier: "starter" as const
            }
        ];

        for (let i = 0; i < testRequests.length; i++) {
            const request = testRequests[i];
            console.log(`\nTest Request ${i + 1}:`);
            console.log(`Description: "${request.description}"`);
            console.log(`User Tier: ${request.userTier}`);
            
            try {
                const result = await aiService.generateWorkflowWithContext(request);
                
                console.log('✅ Generation Result:');
                console.log(`  - Type: ${result.workflow.type || 'workflow'}`);
                console.log(`  - Documentation Used: ${result.documentationUsed.length} documents`);
                console.log(`  - Generation Time: ${result.generationTime}ms`);
                console.log(`  - Confidence Score: ${result.confidence}`);
                console.log(`  - Total Tokens Used: ${result.totalTokensUsed}`);
                
                if (result.documentationUsed.length > 0) {
                    console.log('  - Documentation Sources:');
                    result.documentationUsed.forEach((doc, index) => {
                        console.log(`    ${index + 1}. ${doc.title} (${doc.category}) - Similarity: ${doc.similarity.toFixed(3)}`);
                    });
                }
                
                if (result.workflow.type === 'conversation') {
                    console.log(`  - Response: ${result.workflow.response?.substring(0, 100)}...`);
                } else {
                    console.log(`  - Workflow Nodes: ${result.workflow.nodes?.length || 0}`);
                    console.log(`  - Workflow Name: ${result.workflow.name || 'Unnamed'}`);
                }
                
            } catch (error) {
                console.error(`❌ Test Request ${i + 1} Failed:`, error);
            }
            
            console.log('-'.repeat(30));
        }

        // Step 5: Test Documentation Search
        console.log('\n🔍 Step 5: Testing Documentation Search');
        console.log('-'.repeat(50));
        
        const searchQueries = [
            "HTTP Request node authentication",
            "schedule trigger cron expression",
            "webhook configuration",
            "code node javascript"
        ];

        for (const query of searchQueries) {
            console.log(`\nSearching for: "${query}"`);
            
            try {
                // Generate embedding for search
                const embedding = await aiService['generateEmbedding'](query);
                
                // Search documentation
                const docs = await aiService['retrieveOptimalDocumentation'](
                    embedding,
                    query,
                    'pro',
                    3
                );
                
                console.log(`Found ${docs.length} relevant documents:`);
                docs.forEach((doc, index) => {
                    console.log(`  ${index + 1}. ${doc.title} (${doc.category}) - Similarity: ${doc.similarity.toFixed(3)}`);
                });
                
            } catch (error) {
                console.error(`❌ Search failed for "${query}":`, error);
            }
        }

        // Step 6: Performance Summary
        console.log('\n📈 Step 6: Performance Summary');
        console.log('-'.repeat(50));
        
        const finalStats = await ingestionService.getDocumentationStats();
        console.log('Final Documentation Statistics:');
        console.log(`  - Total Documents: ${finalStats.totalDocuments}`);
        console.log(`  - Total Tokens: ${finalStats.totalTokens}`);
        console.log(`  - Categories: ${Object.keys(finalStats.categoryCounts).join(', ')}`);
        console.log(`  - Last Update: ${finalStats.lastUpdate}`);
        
        console.log('\n✅ RAG System Test Completed Successfully!');
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('\n❌ RAG System Test Failed:', error);
        console.log('=' .repeat(60));
        throw error;
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testRagSystem()
        .then(() => {
            console.log('\n🎉 All tests completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test suite failed:', error);
            process.exit(1);
        });
}

export { testRagSystem };
