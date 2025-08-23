'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { gsap } from 'gsap'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { AIOrb } from '../AIOrb/AIOrb'
import './ChatWindow.scss'

export function ChatWrapper() {
  const [_robotState, setRobotState] = useState<'idle' | 'thinking' | 'talking' | 'excited' | 'welcome' | 'flipped'>('idle')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  // Initial robot state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('robotStateChange', { 
      detail: { state: 'idle' } 
    }))
  }, [])

  // Enhanced Robot state management with personality
  useEffect(() => {
    if (isLoading) {
      setRobotState('thinking')
      window.dispatchEvent(new CustomEvent('robotStateChange', { 
        detail: { state: 'thinking' } 
      }))
    } else if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        // Analyze response content for appropriate animation
        const content = lastMessage.content.toLowerCase()
        let responseState: typeof _robotState = 'talking'
        
        if (content.includes('!') || content.includes('wow') || content.includes('amazing')) {
          responseState = 'excited'
          console.log('🎉 Detected exciting response!')
        } else if (content.includes('welcome') || content.includes('hello') || content.includes('hi')) {
          responseState = 'welcome'
          console.log('👋 Detected greeting response!')
        } else if (content.includes('think') || content.includes('consider') || content.includes('analyze')) {
          responseState = 'thinking'
          console.log('🤔 Detected thoughtful response!')
        }
        
        setRobotState(responseState)
        window.dispatchEvent(new CustomEvent('robotStateChange', { 
          detail: { state: responseState } 
        }))
        
        // Return to idle after response animation
        const duration = responseState === 'excited' ? 4000 : 3000
        setTimeout(() => {
          setRobotState('idle')
          window.dispatchEvent(new CustomEvent('robotStateChange', { 
            detail: { state: 'idle' } 
          }))
        }, duration)
        
      } else if (lastMessage?.role === 'user') {
        // Analyze user message for reaction
        const content = lastMessage.content.toLowerCase()
        let reactionState: typeof _robotState = 'excited'
        
        if (content.includes('?')) {
          reactionState = 'thinking'
          console.log('🤔 User asked a question - thinking pose!')
        } else if (content.includes('hello') || content.includes('hi') || content.includes('hey')) {
          reactionState = 'welcome'
          console.log('👋 User said hello - welcome pose!')
        } else if (content.length > 100) {
          reactionState = 'excited'
          console.log('📝 Long message - excited to respond!')
        }
        
        setRobotState(reactionState)
        window.dispatchEvent(new CustomEvent('robotStateChange', { 
          detail: { state: reactionState } 
        }))
        
        setTimeout(() => {
          setRobotState('idle')
          window.dispatchEvent(new CustomEvent('robotStateChange', { 
            detail: { state: 'idle' } 
          }))
        }, 1500)
      }
    }
  }, [isLoading, messages])

  useEffect(() => {
    if (messagesEndRef.current) {
      // Only scroll within the messages container, not the page
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      })
    }
  }, [messages])

  useEffect(() => {
    if (chatContainerRef.current) {
      gsap.fromTo(
        chatContainerRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power4.out' },
      )
    }
  }, [])

  return (
    <div ref={chatContainerRef} className="ai-chat-container">
      {/* --- Glass Panel 1: The Header --- */}
      <div className="ai-chat-header glass">
        <span className="form-icon">
          <AIOrb />
        </span>
        <span className="form-title">What would you like to build today?</span>
      </div>

      {/* --- Glass Panel 2: The Message History --- */}
      <div className="ai-chat-messages glass">
        <div className="messages-list-inner">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="message assistant">
              <AIOrb />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- Glass Panel 3: The Input Area --- */}
      <div className="ai-chat-input-area glass">
        <form className="w-full h-full flex items-center px-4" onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleSubmit(e)
        }}>
          <textarea
            className="w-full h-full bg-transparent text-gray-800 px-4 py-3 focus:outline-none resize-none placeholder-gray-500"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your request here..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          {/* 3D Send Button Overlay */}
          <div className="send-button-overlay">
            <ChatInput
              input={input}
              _handleInputChange={handleInputChange}
              _handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  )
}