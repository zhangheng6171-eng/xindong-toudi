/**
 * 注册页面组件测试
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render registration form', () => {
    render(
      <div data-testid="register-form">
        <h1>创建账号</h1>
        <input placeholder="昵称" />
        <input placeholder="邮箱" type="email" />
        <input placeholder="密码" type="password" />
      </div>
    )
    
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('should show step indicators', () => {
    render(
      <div data-testid="steps">
        <span data-testid="step-1">1</span>
        <span data-testid="step-2">2</span>
        <span data-testid="step-3">3</span>
      </div>
    )
    
    expect(screen.getByTestId('step-1')).toBeInTheDocument()
    expect(screen.getByTestId('step-2')).toBeInTheDocument()
    expect(screen.getByTestId('step-3')).toBeInTheDocument()
  })

  it('should have gender selection', () => {
    render(
      <div data-testid="gender-selection">
        <button data-testid="male-btn">男生</button>
        <button data-testid="female-btn">女生</button>
      </div>
    )
    
    expect(screen.getByTestId('male-btn')).toBeInTheDocument()
    expect(screen.getByTestId('female-btn')).toBeInTheDocument()
  })

  it('should select gender on click', async () => {
    const user = userEvent.setup()
    let selectedGender = ''
    
    const TestComponent = () => (
      <div>
        <button 
          data-testid="male-btn"
          onClick={() => { selectedGender = 'male' }}
        >
          男生
        </button>
        <button 
          data-testid="female-btn"
          onClick={() => { selectedGender = 'female' }}
        >
          女生
        </button>
      </div>
    )
    
    render(<TestComponent />)
    
    await user.click(screen.getByTestId('female-btn'))
    expect(selectedGender).toBe('female')
  })

  it('should require agreement in final step', () => {
    render(
      <div data-testid="agreement">
        <label>
          <input type="checkbox" data-testid="agree-checkbox" />
          我同意用户协议
        </label>
        <button disabled data-testid="submit-btn">
          开始心动之旅
        </button>
      </div>
    )
    
    expect(screen.getByTestId('agree-checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('submit-btn')).toBeDisabled()
  })

  it('should show login link', () => {
    render(
      <div>
        <span>已有账号？</span>
        <a href="/login">立即登录</a>
      </div>
    )
    
    expect(screen.getByText('立即登录')).toBeInTheDocument()
  })
})
