'use client'

import React from 'react'
import type { Message } from 'ai/react'
import { marked } from 'marked' // Using 'marked' to parse markdown in responses

export function ChatMessage({ message }: { message: Message }) {
  const content = message.role === 'assistant' ? marked.parse(message.content) : message.content

  return (
    <div className={`message ${message.role}`}>
      <div className="message-content">
        {message.role === 'assistant' ? (
          <div dangerouslySetInnerHTML={{ __html: content as string }} />
        ) : (
          <div>{content}</div>
        )}
      </div>
    </div>
  )
}