'use client'

import React from 'react'
import { type DefaultCellComponentProps } from 'payload'

/**
 * A custom cell component that displays languages from the languagesRelation field.
 */
const LanguagesCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  // Try multiple sources for languages
  let languages: string[] = []
  
  // Priority 1: languagesRelation field (populated relationship)
  if (rowData?.languagesRelation && Array.isArray(rowData.languagesRelation)) {
    languages = rowData.languagesRelation
      .map(lang => {
        if (typeof lang === 'object' && lang.name) {
          return lang.name
        }
        return null
      })
      .filter(Boolean) as string[]
  }
  // Priority 2: countryData.language (legacy single language)
  else if (rowData?.countryData?.language?.label) {
    languages = [rowData.countryData.language.label]
  }
  // Priority 3: Try from countryRelation
  else if (rowData?.countryRelation && typeof rowData.countryRelation === 'object' && rowData.countryRelation.languages) {
    languages = rowData.countryRelation.languages
      .map((lang: any) => {
        if (typeof lang === 'object' && lang.name) {
          return lang.name
        }
        return null
      })
      .filter(Boolean) as string[]
  }
  
  if (languages.length === 0) {
    return <span style={{ fontSize: '12px', color: '#666' }}>&lt;No Languages&gt;</span>
  }
  
  return <span>{languages.join(', ')}</span>
}

export default LanguagesCell