// src/components/templates/TemplateLibrary.tsx
import React, { useState, useEffect } from 'react';
import { NodeTemplate, TemplateCategory } from '../../lib/api/templateApi';

interface TemplateLibraryProps {
  templates: NodeTemplate[];
  categories: TemplateCategory[];
  onSelectTemplate: (template: NodeTemplate) => void;
  onCreateTemplate?: (template: Omit<NodeTemplate, 'id'>) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  categories,
  onSelectTemplate,
  onCreateTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTemplates, setFilteredTemplates] = useState<NodeTemplate[]>(templates);

  // Filter templates when category or search query changes
  useEffect(() => {
    let filtered = templates;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) || 
        template.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div className="template-library" style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    }}>
      <div className="library-header" style={{
        padding: '20px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Node Templates</h3>
        
        <div className="search-bar" style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div className="category-tabs" style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          paddingBottom: '5px'
        }}>
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '8px 12px',
              backgroundColor: selectedCategory === 'all' ? '#3498db' : '#f0f0f0',
              color: selectedCategory === 'all' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Templates
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'active' : ''}
              onClick={() => setSelectedCategory(category.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedCategory === category.id ? '#3498db' : '#f0f0f0',
                color: selectedCategory === category.id ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="templates-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px',
        padding: '20px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {filteredTemplates.length === 0 ? (
          <div className="empty-state" style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '30px 0',
            color: '#95a5a6'
          }}>
            <p>No templates found</p>
            {searchQuery && (
              <p style={{ fontSize: '14px' }}>
                Try a different search term or category
              </p>
            )}
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => onSelectTemplate(template)}
              style={{
                padding: '15px',
                backgroundColor: '#f9f9f9',
                borderRadius: '6px',
                border: '1px solid #eee',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <div className="template-name" style={{ 
                fontWeight: 'bold',
                marginBottom: '8px',
                fontSize: '16px'
              }}>
                {template.name}
              </div>
              
              <div className="template-description" style={{ 
                fontSize: '14px',
                color: '#666',
                marginBottom: '12px',
                height: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {template.description}
              </div>
              
              <div className="template-meta" style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#95a5a6'
              }}>
                <div className="template-type">
                  {template.nodeType.split('.').pop()}
                </div>
                
                {template.isDefault && (
                  <div className="template-badge" style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    Default
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Create new template card */}
        {onCreateTemplate && (
          <div
            className="create-template-card"
            onClick={() => {
              // Show template creation modal or form
              // This is a placeholder for the actual implementation
              alert('Template creation not implemented yet');
            }}
            style={{
              padding: '15px',
              backgroundColor: '#f0f8ff',
              borderRadius: '6px',
              border: '1px dashed #3498db',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '150px'
            }}
          >
            <div style={{ 
              fontSize: '24px',
              marginBottom: '10px',
              color: '#3498db'
            }}>
              +
            </div>
            <div style={{ 
              fontWeight: 'bold',
              color: '#3498db'
            }}>
              Create New Template
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
