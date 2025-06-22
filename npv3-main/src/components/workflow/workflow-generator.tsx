'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'

interface WorkflowGeneratorProps {
  onGenerate: (prompt: string) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function WorkflowGenerator({
  onGenerate,
  isLoading = false,
  error
}: WorkflowGeneratorProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    await onGenerate(prompt.trim())
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your workflow in natural language..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[200px]"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Workflow'}
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
} 