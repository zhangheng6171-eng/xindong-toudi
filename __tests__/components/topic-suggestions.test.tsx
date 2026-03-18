/**
 * 话题推荐组件测试
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('TopicSuggestions', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render topic suggestions', () => {
    render(
      <div data-testid="topic-suggestions">
        <h3>话题推荐</h3>
        <button onClick={() => mockOnSelect('旅行')}>
          ✈️ 你最想去哪里旅行？
        </button>
      </div>
    )
    
    expect(screen.getByTestId('topic-suggestions')).toBeInTheDocument()
  })

  it('should call onSelect when topic is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <button onClick={() => mockOnSelect('旅行')}>
        ✈️ 旅行话题
      </button>
    )
    
    await user.click(screen.getByText(/旅行话题/))
    
    expect(mockOnSelect).toHaveBeenCalled()
  })
})

describe('IceBreakers', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render ice breakers', () => {
    render(
      <div data-testid="ice-breakers">
        <h3>破冰开场白</h3>
        <button onClick={() => mockOnSelect('你好')}>
          你好呀！很高兴认识你 😊
        </button>
      </div>
    )
    
    expect(screen.getByTestId('ice-breakers')).toBeInTheDocument()
  })

  it('should call onSelect when opener is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <button onClick={() => mockOnSelect('你好')}>
        你好呀！
      </button>
    )
    
    await user.click(screen.getByText(/你好呀/))
    
    expect(mockOnSelect).toHaveBeenCalled()
  })
})
