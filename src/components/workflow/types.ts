// src/components/workflow/types.ts
export interface WorkflowNode {
  id: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  name?: string;
}

export interface WorkflowConnection {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  description?: string;
  required?: boolean;
  options?: any[];
}

export interface NodeType {
  type: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  color?: string;
  parameters: NodeParameter[];
  inputs: string[];
  outputs: string[];
}
