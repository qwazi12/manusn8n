import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('node_patterns')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    // Check if optimization data is loaded
    const { data: patterns } = await supabase
      .from('node_patterns')
      .select('id')
      .eq('is_featured', true)
      .limit(1);

    const { data: tips } = await supabase
      .from('workflow_tips')
      .select('id')
      .eq('is_active', true)
      .limit(1);

    const optimizationReady = patterns && patterns.length > 0 && tips && tips.length > 0;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      optimization_data: optimizationReady ? 'loaded' : 'missing',
      version: '2.0.0-optimized',
      features: {
        fast_generation: true,
        node_patterns: patterns?.length > 0,
        workflow_tips: tips?.length > 0
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: 'disconnected',
        optimization_data: 'unknown'
      },
      { status: 503 }
    );
  }
}
