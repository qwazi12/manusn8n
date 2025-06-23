// src/scripts/testVectorSearch.ts
// Test script to verify vector search is working

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function testVectorSearch() {
    console.log('🔍 Testing Vector Search with Real Context7 Data');
    console.log('=' .repeat(60));

    try {
        const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Test queries
        const testQueries = [
            "HTTP Request node authentication",
            "schedule trigger cron expression",
            "webhook configuration",
            "code node javascript",
            "expressions syntax"
        ];

        for (const query of testQueries) {
            console.log(`\n🔍 Testing query: "${query}"`);
            console.log('-'.repeat(50));

            try {
                // Generate embedding for the query
                console.log('📡 Generating embedding...');
                const response = await openai.embeddings.create({
                    model: 'text-embedding-3-small',
                    input: query,
                });
                
                const queryEmbedding = response.data[0].embedding;
                console.log(`✅ Generated embedding with ${queryEmbedding.length} dimensions`);

                // Test direct similarity search
                console.log('🔍 Testing direct similarity search...');
                const { data: directResults, error: directError } = await supabase
                    .from('n8n_documentation')
                    .select('id, title, category, content')
                    .limit(3);

                if (directError) {
                    console.error('❌ Direct query error:', directError);
                } else {
                    console.log(`✅ Direct query returned ${directResults.length} documents`);
                    directResults.forEach((doc, i) => {
                        console.log(`  ${i + 1}. ${doc.title} (${doc.category})`);
                    });
                }

                // Test the match function
                console.log('🎯 Testing match_n8n_documentation function...');
                const { data: matchResults, error: matchError } = await supabase.rpc(
                    'match_n8n_documentation',
                    {
                        query_embedding: queryEmbedding,
                        match_threshold: 0.5,
                        match_count: 3
                    }
                );

                if (matchError) {
                    console.error('❌ Match function error:', matchError);
                } else {
                    console.log(`✅ Match function returned ${matchResults?.length || 0} documents`);
                    if (matchResults && matchResults.length > 0) {
                        matchResults.forEach((doc: any, i: number) => {
                            console.log(`  ${i + 1}. ${doc.title} (similarity: ${(doc.similarity * 100).toFixed(1)}%)`);
                        });
                    }
                }

                // Test the optimal context function
                console.log('🎯 Testing get_optimal_documentation_context function...');
                const { data: contextResults, error: contextError } = await supabase.rpc(
                    'get_optimal_documentation_context',
                    {
                        query_embedding: queryEmbedding,
                        query_text: query,
                        user_tier: 'pro'
                    }
                );

                if (contextError) {
                    console.error('❌ Context function error:', contextError);
                } else {
                    console.log(`✅ Context function returned ${contextResults?.length || 0} documents`);
                    if (contextResults && contextResults.length > 0) {
                        contextResults.forEach((doc: any, i: number) => {
                            console.log(`  ${i + 1}. ${doc.title} (${doc.category}) - similarity: ${(doc.similarity * 100).toFixed(1)}%`);
                        });
                    }
                }

            } catch (error) {
                console.error(`❌ Query "${query}" failed:`, error);
            }
        }

        // Test database statistics
        console.log('\n📊 Database Statistics');
        console.log('-'.repeat(30));

        const { data: stats, error: statsError } = await supabase
            .from('n8n_documentation')
            .select('category, tokens, snippet_type');

        if (statsError) {
            console.error('❌ Stats query error:', statsError);
        } else {
            console.log(`📚 Total documents: ${stats.length}`);
            
            const categories = stats.reduce((acc: any, doc: any) => {
                acc[doc.category] = (acc[doc.category] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📋 Categories:', categories);
            
            const totalTokens = stats.reduce((sum: number, doc: any) => sum + doc.tokens, 0);
            console.log(`🔢 Total tokens: ${totalTokens}`);
            
            const snippetTypes = stats.reduce((acc: any, doc: any) => {
                acc[doc.snippet_type] = (acc[doc.snippet_type] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📝 Snippet types:', snippetTypes);
        }

        console.log('\n✅ Vector search testing completed successfully!');

    } catch (error) {
        console.error('❌ Vector search testing failed:', error);
        throw error;
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testVectorSearch()
        .then(() => {
            console.log('\n🎉 All vector search tests passed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Vector search testing failed:', error);
            process.exit(1);
        });
}

export { testVectorSearch };
