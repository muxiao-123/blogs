import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './theme'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

describe('ThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  it('initializes with default theme', () => {
    const store = useThemeStore()
    expect(store.theme).toBeDefined()
  })

  it('toggles theme', () => {
    const store = useThemeStore()
    const initialTheme = store.theme

    store.toggleTheme()
    expect(store.theme).not.toBe(initialTheme)
  })

  it('sets theme directly', () => {
    const store = useThemeStore()

    store.setTheme('light')
    expect(store.theme).toBe('light')

    store.setTheme('dark')
    expect(store.theme).toBe('dark')
  })

  it('saves theme to localStorage', () => {
    const store = useThemeStore()

    store.setTheme('light')
    expect(localStorageMock.getItem('theme')).toBe('light')
  })
})
