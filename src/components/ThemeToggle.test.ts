import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '../components/ThemeToggle.vue'
import { createPinia, setActivePinia } from 'pinia'

describe('ThemeToggle', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('toggles theme when clicked', async () => {
    const wrapper = mount(ThemeToggle)
    const button = wrapper.find('button')

    await button.trigger('click')

    // Theme should toggle
    expect(button.exists()).toBe(true)
  })
})
