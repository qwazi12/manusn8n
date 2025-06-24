import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const complexity = searchParams.get('complexity');
    const featured = searchParams.get('featured');

    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (complexity && complexity !== 'all') {
      query = query.eq('complexity_level', complexity);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: templates || [],
      count: templates?.length || 0
    });

  } catch (error) {
    console.error('Error in templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      workflow_json,
      node_count,
      complexity_level = 'intermediate',
      use_cases = [],
      integrations = [],
      keywords = [],
      is_featured = false
    } = body;

    // Validate required fields
    if (!name || !description || !category || !workflow_json) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, workflow_json' },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabase
      .from('workflow_templates')
      .insert({
        name,
        description,
        category,
        workflow_json,
        node_count,
        complexity_level,
        use_cases,
        integrations,
        keywords,
        is_featured,
        is_public: true,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      template,
      message: 'Template created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in templates POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
