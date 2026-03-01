/**
 * Interaction tests for the NameCell component inside LayoutPage.
 *
 * NameCell is not exported, so we render the full LayoutPage with the
 * TanStack Query client set up and the API functions mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LayoutPage from '../LayoutPage'

// Mock the API module so no real fetch calls happen
vi.mock('../../api/widgets', () => ({
  fetchInstances: vi.fn(),
  fetchTypes: vi.fn(),
  patchWidgetName: vi.fn(),
  patchWidgetColor: vi.fn(),
}))

import * as widgetsApi from '../../api/widgets'

const WIDGET = {
  id: 'test-widget-1',
  widget_type: 'clock',
  name: 'My Clock',
  config: {},
  grid_x: 0,
  grid_y: 0,
  grid_w: 2,
  grid_h: 2,
  background_color: null,
}

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  vi.mocked(widgetsApi.fetchInstances).mockResolvedValue([WIDGET])
  vi.mocked(widgetsApi.fetchTypes).mockResolvedValue(['clock'])
  vi.mocked(widgetsApi.patchWidgetName).mockResolvedValue(undefined)
  vi.mocked(widgetsApi.patchWidgetColor).mockResolvedValue(undefined)

  const user = userEvent.setup()

  render(
    <QueryClientProvider client={qc}>
      <LayoutPage />
    </QueryClientProvider>
  )

  return { user, qc }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NameCell — display', () => {
  it('shows the widget name as a button', async () => {
    setup()
    await waitFor(() => expect(screen.getByText('My Clock')).toBeInTheDocument())
    expect(screen.getByTitle('Click to edit name')).toBeInTheDocument()
  })

  it('shows "unnamed" placeholder when name is empty', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vi.mocked(widgetsApi.fetchInstances).mockResolvedValue([{ ...WIDGET, name: '' }])
    vi.mocked(widgetsApi.fetchTypes).mockResolvedValue([])
    render(<QueryClientProvider client={qc}><LayoutPage /></QueryClientProvider>)
    await waitFor(() => expect(screen.getByText('unnamed')).toBeInTheDocument())
  })
})

describe('NameCell — editing', () => {
  it('click shows an input with the current name', async () => {
    const { user } = setup()
    await waitFor(() => screen.getByTitle('Click to edit name'))

    await user.click(screen.getByTitle('Click to edit name'))

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect((input as HTMLInputElement).value).toBe('My Clock')
  })

  it('Enter commits the new name', async () => {
    const { user } = setup()
    await waitFor(() => screen.getByTitle('Click to edit name'))

    await user.click(screen.getByTitle('Click to edit name'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'New Name{Enter}')

    expect(widgetsApi.patchWidgetName).toHaveBeenCalledWith('test-widget-1', 'New Name')
  })

  it('Escape cancels without calling patchWidgetName', async () => {
    const { user } = setup()
    await waitFor(() => screen.getByTitle('Click to edit name'))

    await user.click(screen.getByTitle('Click to edit name'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Aborted{Escape}')

    expect(widgetsApi.patchWidgetName).not.toHaveBeenCalled()
    // Button is back
    expect(screen.getByTitle('Click to edit name')).toBeInTheDocument()
  })

  it('blur commits the name', async () => {
    const { user } = setup()
    await waitFor(() => screen.getByTitle('Click to edit name'))

    await user.click(screen.getByTitle('Click to edit name'))
    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'Blurred Name')
    await user.tab() // triggers blur

    expect(widgetsApi.patchWidgetName).toHaveBeenCalledWith('test-widget-1', 'Blurred Name')
  })

  it('does not call patchWidgetName when name is unchanged', async () => {
    const { user } = setup()
    await waitFor(() => screen.getByTitle('Click to edit name'))

    await user.click(screen.getByTitle('Click to edit name'))
    await user.keyboard('{Enter}') // commit without changing

    expect(widgetsApi.patchWidgetName).not.toHaveBeenCalled()
  })
})
