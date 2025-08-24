import React from 'react'
import { Button } from '@payloadcms/ui'

/**
 * Placeholder SeedExperienceTypesButton component
 * TODO: Implement experience types seeding functionality
 */
const SeedExperienceTypesButton: React.FC = () => {
  const handleClick = () => {
    console.log('SeedExperienceTypesButton: Feature not yet implemented in new architecture')
    // TODO: Implement seeding functionality
  }

  return (
    <Button size="small" buttonStyle="secondary" onClick={handleClick}>
      Seed Experience Types
    </Button>
  )
}

export default SeedExperienceTypesButton