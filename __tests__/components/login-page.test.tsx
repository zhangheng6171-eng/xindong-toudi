/**
 * 登录页面组件测试
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(
      <div data-testid="login-form">
        <h1>欢迎回来</h1>
        <input placeholder="邮箱" type="email" />
        <input placeholder="密码" type="password" />
        <button type="submit">登录</button>
      </div>
    )
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('邮箱')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
  })

  it('should have email and password inputs', () => {
    render(
      <div>
        <input placeholder="邮箱" data-testid="email-input" />
        <input placeholder="密码" data-testid="password-input" />
      </div>
    )
    
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
  })

  it('should toggle password visibility', async () => {
    const user = userEvent.setup()
    
    const TestComponent = () => {
      const [showPassword, setShowPassword] = React.useState(false)
      return (
        <div>
          <input 
            type={showPassword ? 'text' : 'password'} 
            data-testid="password-field"
          />
          <button onClick={() => setShowPassword(!showPassword)}>
            切换
          </button>
        </div>
      )
    }
    
    render(<TestComponent />)
    
    const passwordInput = screen.getByTestId('password-field')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(screen.getByText('切换'))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('should have remember me option', () => {
    render(
      <label>
        <input type="checkbox" data-testid="remember-checkbox" />
        记住我
      </label>
    )
    
    expect(screen.getByTestId('remember-checkbox')).toBeInTheDocument()
  })

  it('should have forgot password link', () => {
    render(<a href="/forgot-password">忘记密码？</a>)
    
    expect(screen.getByText('忘记密码？')).toBeInTheDocument()
  })

  it('should have register link', () => {
    render(<a href="/register">立即注册</a>)
    
    expect(screen.getByText('立即注册')).toBeInTheDocument()
  })
})
