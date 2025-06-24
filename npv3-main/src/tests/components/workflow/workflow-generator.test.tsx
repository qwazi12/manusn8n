import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkflowGenerator } from '@/components/workflow/workflow-generator'

describe('WorkflowGenerator', () => {
  it('renders the component', () => {
    render(<WorkflowGenerator onGenerate={async () => {}} />)
    expect(screen.getByPlaceholderText(/describe your workflow/i)).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const mockGenerate = jest.fn()
    render(<WorkflowGenerator onGenerate={mockGenerate} />)

    const textarea = screen.getByPlaceholderText(/describe your workflow/i)
    const button = screen.getByText(/generate workflow/i)

    fireEvent.change(textarea, { target: { value: 'test workflow' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith('test workflow')
    })
  })

  it('shows loading state', () => {
    render(<WorkflowGenerator onGenerate={async () => {}} isLoading />)
    expect(screen.getByText(/generating/i)).toBeInTheDocument()
  })

  it('shows error message', () => {
    const error = 'Test error message'
    render(<WorkflowGenerator onGenerate={async () => {}} error={error} />)
    expect(screen.getByText(error)).toBeInTheDocument()
  })
}) 