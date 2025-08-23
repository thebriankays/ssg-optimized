'use client'

import React from 'react'
import './AIOrb.scss'

export function AIOrb() {
  return (
    <div className="ai-orb">
      <div className="ai-orb__main-container">
        <div className="ai-orb__inner-container">
          <div className="ai-orb__dot ai-orb__dot--4"></div>
          <div className="ai-orb__dot ai-orb__dot--1"></div>
          <div className="ai-orb__dot ai-orb__dot--2"></div>
          <div className="ai-orb__dot ai-orb__dot--3"></div>
          <div className="ai-orb__rings">
            <div className="ai-orb__rings"></div>
          </div>
        </div>
        <div className="ai-orb__glass-overlay"></div>
      </div>
    </div>
  )
}