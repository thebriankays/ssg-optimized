'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface ChatInputProps {
  input: string
  _handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  _handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({ input, _handleInputChange, _handleSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="ai-input-container">
      {/* Invisible grid areas for 3D hover effect */}
      {Array.from({ length: 15 }, (_, i) => (
        <div key={i} className="area"></div>
      ))}
      
      <div className="container-wrap">
        <div className="card">
          <div className="background-blur-balls">
            <div className="balls">
              <span className="ball rosa"></span>
              <span className="ball violet"></span>
              <span className="ball green"></span>
              <span className="ball cyan"></span>
            </div>
          </div>
          
          <div className="content-card">
            <div className="background-blur-card">
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="btn-submit"
                onClick={(e) => {
                  e.preventDefault()
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    // Trigger form submission directly
                    form.requestSubmit()
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <i>
                    <svg viewBox="0 0 512 512">
                      <path
                        d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"
                        fill="currentColor"
                      />
                    </svg>
                  </i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}