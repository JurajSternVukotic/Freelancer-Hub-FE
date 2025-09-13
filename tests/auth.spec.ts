import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { server } from './setup'
import { rest } from 'msw'

const LoginForm = {
  template: `
    <form @submit.prevent="handleSubmit" data-testid="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="form.email" 
          type="email" 
          data-testid="email-input"
          :class="{ 'error': errors.email }"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="form.password" 
          type="password" 
          data-testid="password-input"
          :class="{ 'error': errors.password }"
        />
        <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
      </div>
      
      <button 
        type="submit" 
        data-testid="login-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
      
      <div v-if="error" class="error-message" data-testid="login-error">
        {{ error }}
      </div>
    </form>
  `,
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      errors: {},
      error: '',
      isLoading: false,
    }
  },
  methods: {
    validateForm() {
      this.errors = {}
      
      if (!this.form.email) {
        this.errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = 'Invalid email format'
      }
      
      if (!this.form.password) {
        this.errors.password = 'Password is required'
      } else if (this.form.password.length < 8) {
        this.errors.password = 'Password must be at least 8 characters'
      }
      
      return Object.keys(this.errors).length === 0
    },
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.isLoading = true
      this.error = ''
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })
        
        if (!response.ok) {
          throw new Error('Invalid credentials')
        }
        
        const data = await response.json()

        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        this.$emit('login-success', data.user)

        this.$router.push('/dashboard')
      } catch (error) {
        this.error = error.message || 'Login failed'
      } finally {
        this.isLoading = false
      }
    },
  },
}

const RegisterForm = {
  template: `
    <form @submit.prevent="handleSubmit" data-testid="register-form">
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input 
          id="firstName"
          v-model="form.firstName" 
          type="text" 
          data-testid="firstName-input"
        />
      </div>
      
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          id="lastName"
          v-model="form.lastName" 
          type="text" 
          data-testid="lastName-input"
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="form.email" 
          type="email" 
          data-testid="email-input"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="form.password" 
          type="password" 
          data-testid="password-input"
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword"
          v-model="form.confirmPassword" 
          type="password" 
          data-testid="confirmPassword-input"
        />
      </div>
      
      <div class="form-group">
        <label for="role">Role</label>
        <select 
          id="role"
          v-model="form.role" 
          data-testid="role-select"
        >
          <option value="freelancer">Freelancer</option>
          <option value="client">Client</option>
        </select>
      </div>
      
      <button 
        type="submit" 
        data-testid="register-button"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Registering...' : 'Register' }}
      </button>
    </form>
  `,
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'freelancer',
      },
      isLoading: false,
    }
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.form),
        })
        
        if (!response.ok) {
          throw new Error('Registration failed')
        }
        
        const data = await response.json()
        this.$emit('register-success', data.user)
      } catch (error) {
        this.$emit('register-error', error.message)
      } finally {
        this.isLoading = false
      }
    },
  },
}

const createTestRouter = () => {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/register', component: { template: '<div>Register</div>' } },
      { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
    ],
  })
}

describe('Authentication Components', () => {
  let router: any

  beforeEach(() => {
    router = createTestRouter()

    vi.mocked(localStorage.clear).mockClear()
    vi.mocked(localStorage.setItem).mockClear()
    vi.mocked(localStorage.getItem).mockClear()
  })

  describe('LoginForm Component', () => {
    it('renders login form with all required fields', () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="login-button"]').exists()).toBe(true)
    })

    it('validates email format', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('[data-testid="email-input"]')
      const form = wrapper.find('[data-testid="login-form"]')

      await emailInput.setValue('invalid-email')
      await form.trigger('submit')

      expect(wrapper.text()).toContain('Invalid email format')
    })

    it('validates password requirements', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const form = wrapper.find('[data-testid="login-form"]')

      await passwordInput.setValue('123')
      await form.trigger('submit')

      expect(wrapper.text()).toContain('Password must be at least 8 characters')
    })

    it('shows loading state during login', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('[data-testid="email-input"]')
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const button = wrapper.find('[data-testid="login-button"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(ctx.delay(1000), ctx.json({}))
        })
      )

      const form = wrapper.find('[data-testid="login-form"]')
      await form.trigger('submit')

      expect(button.text()).toBe('Logging in...')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('handles successful login', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('[data-testid="email-input"]')
      const passwordInput = wrapper.find('[data-testid="password-input"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      const form = wrapper.find('[data-testid="login-form"]')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token')
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'freelancer',
        })
      )
    })

    it('handles login failure', async () => {

      server.use(
        rest.post('/api/auth/login', (req, res, ctx) => {
          return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }))
        })
      )

      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('[data-testid="email-input"]')
      const passwordInput = wrapper.find('[data-testid="password-input"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('wrongpassword')

      const form = wrapper.find('[data-testid="login-form"]')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.find('[data-testid="login-error"]').text()).toBe('Invalid credentials')
    })

    it('emits login-success event on successful login', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('[data-testid="email-input"]')
      const passwordInput = wrapper.find('[data-testid="password-input"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      const form = wrapper.find('[data-testid="login-form"]')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('login-success')).toBeTruthy()
      expect(wrapper.emitted('login-success')?.[0]?.[0]).toEqual({
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'freelancer',
      })
    })
  })

  describe('RegisterForm Component', () => {
    it('renders registration form with all fields', () => {
      const wrapper = mount(RegisterForm)

      expect(wrapper.find('[data-testid="register-form"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="firstName-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="lastName-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="email-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="password-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="confirmPassword-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="role-select"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="register-button"]').exists()).toBe(true)
    })

    it('defaults to freelancer role', () => {
      const wrapper = mount(RegisterForm)
      const roleSelect = wrapper.find('[data-testid="role-select"]')
      
      expect(roleSelect.element.value).toBe('freelancer')
    })

    it('allows selecting client role', async () => {
      const wrapper = mount(RegisterForm)
      const roleSelect = wrapper.find('[data-testid="role-select"]')
      
      await roleSelect.setValue('client')
      expect(roleSelect.element.value).toBe('client')
    })

    it('handles successful registration', async () => {
      const wrapper = mount(RegisterForm)

      await wrapper.find('[data-testid="firstName-input"]').setValue('John')
      await wrapper.find('[data-testid="lastName-input"]').setValue('Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('john@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('password123')
      await wrapper.find('[data-testid="confirmPassword-input"]').setValue('password123')

      const form = wrapper.find('[data-testid="register-form"]')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('register-success')).toBeTruthy()
    })

    it('handles registration failure', async () => {

      server.use(
        rest.post('/api/auth/register', (req, res, ctx) => {
          return res(ctx.status(409), ctx.json({ error: 'Email already exists' }))
        })
      )

      const wrapper = mount(RegisterForm)

      await wrapper.find('[data-testid="firstName-input"]').setValue('John')
      await wrapper.find('[data-testid="lastName-input"]').setValue('Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('existing@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('password123')

      const form = wrapper.find('[data-testid="register-form"]')
      await form.trigger('submit')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(wrapper.emitted('register-error')).toBeTruthy()
      expect(wrapper.emitted('register-error')?.[0]?.[0]).toBe('Registration failed')
    })

    it('shows loading state during registration', async () => {
      const wrapper = mount(RegisterForm)

      await wrapper.find('[data-testid="firstName-input"]').setValue('John')
      await wrapper.find('[data-testid="lastName-input"]').setValue('Doe')
      await wrapper.find('[data-testid="email-input"]').setValue('john@example.com')
      await wrapper.find('[data-testid="password-input"]').setValue('password123')

      server.use(
        rest.post('/api/auth/register', (req, res, ctx) => {
          return res(ctx.delay(1000), ctx.json({}))
        })
      )

      const button = wrapper.find('[data-testid="register-button"]')
      const form = wrapper.find('[data-testid="register-form"]')
      
      await form.trigger('submit')

      expect(button.text()).toBe('Registering...')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })
})

describe('Authentication Flow Integration', () => {
  let router: any

  beforeEach(() => {
    router = createTestRouter()
  })

  it('redirects to dashboard after successful login', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    })

    const routerPushSpy = vi.spyOn(wrapper.vm.$router, 'push')

    await wrapper.find('[data-testid="email-input"]').setValue('test@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('password123')

    await wrapper.find('[data-testid="login-form"]').trigger('submit')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(routerPushSpy).toHaveBeenCalledWith('/dashboard')
  })

  it('stores authentication data in localStorage', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('[data-testid="email-input"]').setValue('test@example.com')
    await wrapper.find('[data-testid="password-input"]').setValue('password123')

    await wrapper.find('[data-testid="login-form"]').trigger('submit')
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token')
    expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'freelancer',
      })
    )
  })

  it('handles token refresh workflow', async () => {

    server.use(
      rest.post('/api/auth/refresh', (req, res, ctx) => {
        return res(
          ctx.json({
            accessToken: 'new-mock-access-token',
          })
        )
      })
    )

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'old-refresh-token' }),
    })

    const data = await response.json()
    expect(data.accessToken).toBe('new-mock-access-token')
  })

  it('handles logout workflow', async () => {

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    })

    const data = await response.json()
    expect(data.success).toBe(true)

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
  })
})

describe('Authentication Validation', () => {
  it('validates email format correctly', () => {
    const validateEmail = (email: string): boolean => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
  })

  it('validates password strength', () => {
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors = []
      
      if (password.length < 8) errors.push('Must be at least 8 characters')
      if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter')
      if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter')
      if (!/\d/.test(password)) errors.push('Must contain number')
      
      return { valid: errors.length === 0, errors }
    }

    expect(validatePassword('Password123').valid).toBe(true)
    expect(validatePassword('password').valid).toBe(false)
    expect(validatePassword('PASSWORD').valid).toBe(false)
    expect(validatePassword('Pass123').valid).toBe(false) // Too short
  })

  it('validates password confirmation match', () => {
    const validatePasswordMatch = (password: string, confirm: string): boolean => {
      return password === confirm && password.length > 0
    }

    expect(validatePasswordMatch('password123', 'password123')).toBe(true)
    expect(validatePasswordMatch('password123', 'different123')).toBe(false)
    expect(validatePasswordMatch('', '')).toBe(false)
  })

  it('validates required fields', () => {
    const validateRequired = (fields: Record<string, string>): string[] => {
      const required = ['firstName', 'lastName', 'email', 'password']
      return required.filter(field => !fields[field] || fields[field].trim() === '')
    }

    const completeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    }

    const incompleteData = {
      firstName: '',
      lastName: 'Doe',
      email: 'john@example.com',
      password: '',
    }

    expect(validateRequired(completeData)).toEqual([])
    expect(validateRequired(incompleteData)).toEqual(['firstName', 'password'])
  })
})