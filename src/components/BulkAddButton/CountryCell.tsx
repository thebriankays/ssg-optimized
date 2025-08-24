import React from 'react'
import { type DefaultCellComponentProps } from 'payload'

/**
 * A custom cell component that displays the country name from the countryRelation field.
 */
const CountryCell: React.FC<DefaultCellComponentProps> = ({ rowData }) => {
  // Try multiple sources for country name
  let countryName = ''
  
  // Priority 1: countryRelation field (populated relationship)
  if (rowData?.countryRelation && typeof rowData.countryRelation === 'object') {
    countryName = rowData.countryRelation.name || ''
  }
  // Priority 2: country field (virtual field)
  else if (rowData?.country) {
    countryName = rowData.country
  }
  // Priority 3: countryData.label
  else if (rowData?.countryData?.label) {
    countryName = rowData.countryData.label
  }
  // Priority 4: locationData.country
  else if (rowData?.locationData?.country) {
    countryName = rowData.locationData.country
  }
  
  if (!countryName) {
    return <span style={{ fontSize: '12px', color: '#666' }}>&lt;No Country&gt;</span>
  }
  
  return <span>{countryName}</span>
}

export default CountryCell