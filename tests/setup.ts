import { beforeAll, beforeEach, afterEach, afterAll, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const handlers = [

  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.json({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'freelancer',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    )
  }),

  rest.post('/api/auth/register', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        user: {
          id: 'new-user-id',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'freelancer',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      })
    )
  }),

  rest.post('/api/auth/refresh', (req, res, ctx) => {
    return res(
      ctx.json({
        accessToken: 'new-mock-access-token',
      })
    )
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),

  rest.post('/api/timer/start', (req, res, ctx) => {
    return res(
      ctx.json({
        timerId: 'mock-timer-id',
        taskId: 'mock-task-id',
        startTime: new Date().toISOString(),
        isRunning: true,
      })
    )
  }),

  rest.post('/api/timer/stop', (req, res, ctx) => {
    return res(
      ctx.json({
        timerId: 'mock-timer-id',
        taskId: 'mock-task-id',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 120,
        description: 'Test work session',
      })
    )
  }),

  rest.get('/api/timer/current', (req, res, ctx) => {
    return res(ctx.json(null)) // No active timer by default
  }),

  rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'task-1',
          title: 'Test Task 1',
          status: 'todo',
          priority: 'medium',
          position: 0,
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          status: 'in-progress',
          priority: 'high',
          position: 0,
        },
      ])
    )
  }),

  rest.put('/api/tasks/reorder', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task 1',
            status: 'in-progress',
            position: 0,
          },
        ],
      })
    )
  }),

  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled request: ${req.method} ${req.url.toString()}`)
    return res(ctx.status(404))
  }),
]

export const server = setupServer(...handlers)

beforeAll(() => {

  server.listen({ onUnhandledRequest: 'warn' })

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  vi.stubGlobal('localStorage', localStorageMock)

  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  vi.stubGlobal('sessionStorage', sessionStorageMock)

  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

beforeEach(() => {

  const pinia = createPinia()
  setActivePinia(pinia)

  config.global = {
    plugins: [pinia],
  }

  vi.mocked(localStorage.getItem).mockClear()
  vi.mocked(localStorage.setItem).mockClear()
  vi.mocked(localStorage.removeItem).mockClear()
  vi.mocked(localStorage.clear).mockClear()

  vi.mocked(sessionStorage.getItem).mockClear()
  vi.mocked(sessionStorage.setItem).mockClear()
  vi.mocked(sessionStorage.removeItem).mockClear()
  vi.mocked(sessionStorage.clear).mockClear()
})

afterEach(() => {

  server.resetHandlers()

  vi.clearAllMocks()
})

afterAll(() => {

  server.close()
})