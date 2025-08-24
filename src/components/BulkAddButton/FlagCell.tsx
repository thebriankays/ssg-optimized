import React from 'react'
import Image from 'next/image'
import { type DefaultCellComponentProps } from 'payload'

/**
 * A custom cell component that displays a country flag.
 * Uses SVG flags from the /flags directory.
 */
const FlagCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  // Flag resolution logic - check all possible sources
  let flagPath = null

  // Priority 1: flagSvg field (should contain the filename like 'ke.svg')
  if (rowData?.flagSvg) {
    // If it's already a full path, use it; otherwise prepend /flags/
    flagPath = rowData.flagSvg.startsWith('/') ? rowData.flagSvg : `/flags/${rowData.flagSvg}`
  }
  // Priority 2: countryRelation.flag (from populated relationship)
  else if (rowData?.countryRelation && typeof rowData.countryRelation === 'object' && rowData.countryRelation.flag) {
    flagPath = rowData.countryRelation.flag.startsWith('/') ? rowData.countryRelation.flag : `/flags/${rowData.countryRelation.flag}`
  }
  // Priority 3: countryData.flag
  else if (rowData?.countryData?.flag) {
    flagPath = rowData.countryData.flag.startsWith('/') ? rowData.countryData.flag : `/flags/${rowData.countryData.flag}`
  }
  // Priority 4: countryData.code
  else if (rowData?.countryData?.code) {
    flagPath = `/flags/${rowData.countryData.code.toLowerCase()}.svg`
  }
  // Priority 5: Try to infer from title as last resort
  else if (rowData?.title) {
    const titleLower = rowData.title.toLowerCase()
    const countryPatterns: Record<string, string> = {
      'jamaica': 'jm',
      'bahamas': 'bs',
      'barbados': 'bb',
      'mexico': 'mx',
      'costa rica': 'cr',
      'france': 'fr',
      'italy': 'it',
      'spain': 'es',
      'japan': 'jp',
      'thailand': 'th',
      'greece': 'gr',
      'turkey': 'tr',
      'egypt': 'eg',
      'kenya': 'ke',
      'south africa': 'za',
      'nairobi': 'ke' // City to country mapping
    }
    
    for (const [pattern, code] of Object.entries(countryPatterns)) {
      if (titleLower.includes(pattern)) {
        flagPath = `/flags/${code}.svg`
        break
      }
    }
  }
  
  if (!flagPath) {
    return <span style={{ fontSize: '12px', color: '#666' }}>No flag</span>
  }
  
  return (
    <div
      style={{
        position: 'relative',
        width: '40px',
        height: '30px',
        overflow: 'hidden',
        borderRadius: '2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
      className="flag-cell-container"
    >
      <Image
        src={flagPath}
        alt={`Flag of ${rowData?.countryData?.label || rowData?.country || rowData?.title || 'country'}`}
        fill
        style={{
          objectFit: 'cover',
        }}
        className="flag-cell-image"
      />
    </div>
  )
}

export default FlagCell