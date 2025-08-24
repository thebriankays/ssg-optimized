'use client'
import React from 'react'
import { Button } from '@payloadcms/ui'

/**
 * Simple BulkAddButton for now - can be enhanced later
 * This prevents the import error and provides basic functionality
 */
const BulkAddButton = () => {
  const handleClick = () => {
    console.log('BulkAddButton: Feature not yet implemented in new architecture')
    // TODO: Implement bulk add functionality
  }

  return (
    <Button size="small" buttonStyle="primary" onClick={handleClick}>
      Bulk Add Destinations
    </Button>
  )
}

export default BulkAddButton