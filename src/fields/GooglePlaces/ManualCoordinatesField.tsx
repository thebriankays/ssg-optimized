'use client'
import React, { useState, useEffect } from 'react'
import { useField, useAllFormFields } from '@payloadcms/ui'
import { Coordinates } from './coordinates-helper'

type ManualCoordinatesFieldProps = {
  path: string
  label?: string
  required?: boolean
}

const ManualCoordinatesField: React.FC<ManualCoordinatesFieldProps> = ({
  path,
  label = 'Manual Coordinates',
  required = false,
}) => {
  // Get field values and functions
  const { value, setValue } = useField<Coordinates>({ path })
  const [latValue, setLatValue] = useState<string>('')
  const [lngValue, setLngValue] = useState<string>('')
  const [_fields, dispatchFields] = useAllFormFields()

  // Initialize values from existing coordinates
  useEffect(() => {
    if (value) {
      setLatValue(value.lat !== null ? String(value.lat) : '')
      setLngValue(value.lng !== null ? String(value.lng) : '')
    }
  }, [value])

  // Update coordinates when inputs change
  const updateCoordinates = () => {
    const lat = latValue ? parseFloat(latValue) : null
    const lng = lngValue ? parseFloat(lngValue) : null
    
    const coordinates = { lat, lng }
    
    // Update the field
    setValue(coordinates)
    
    // Also dispatch to update form state
    dispatchFields({ type: 'UPDATE', path: path, value: coordinates })
    dispatchFields({ type: 'UPDATE', path: `${path}.lat`, value: lat })
    dispatchFields({ type: 'UPDATE', path: `${path}.lng`, value: lng })
    
    // Update parent locationData for convenience
    const locationDataPath = path.split('.').slice(0, -1).join('.')
    if (locationDataPath) {
      dispatchFields({ type: 'UPDATE', path: `${locationDataPath}.coordinates`, value: coordinates })
    }
    
    // Also update at root level for the globe component
    dispatchFields({ type: 'UPDATE', path: 'locationData.coordinates', value: coordinates })
    dispatchFields({ type: 'UPDATE', path: 'locationData.coordinates.lat', value: lat })
    dispatchFields({ type: 'UPDATE', path: 'locationData.coordinates.lng', value: lng })
    
    console.log('Manual coordinates updated:', coordinates)
  }

  return (
    <div className="manual-coordinates-field">
      <label className="manual-coordinates-field__label">
        {label}
        {required ? ' *' : ''}
      </label>
      
      <div className="manual-coordinates-field__content" style={{ display: 'flex', gap: '10px' }}>
        <div>
          <label htmlFor={`${path}-lat`}>Latitude</label>
          <input
            id={`${path}-lat`}
            type="number"
            step="any"
            placeholder="Enter latitude (e.g. 18.4711)"
            value={latValue}
            onChange={(e) => setLatValue(e.target.value)}
            onBlur={updateCoordinates}
            style={{ width: '100%' }}
          />
        </div>
        
        <div>
          <label htmlFor={`${path}-lng`}>Longitude</label>
          <input
            id={`${path}-lng`}
            type="number"
            step="any"
            placeholder="Enter longitude (e.g. -77.9187)"
            value={lngValue}
            onChange={(e) => setLngValue(e.target.value)}
            onBlur={updateCoordinates}
            style={{ width: '100%' }}
          />
        </div>
      </div>
      
      {value && value.lat !== null && value.lng !== null && (
        <div className="manual-coordinates-field__preview">
          Current coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}
      
      <div className="manual-coordinates-field__hint" style={{ marginTop: '8px', fontSize: '0.875rem', color: '#666' }}>
        <p>Common coordinates:</p>
        <ul>
          <li>Montego Bay, Jamaica: 18.4711, -77.9187</li>
          <li>Jaco, Costa Rica: 9.6156, -84.6287</li>
          <li>Madrid, Spain: 40.4168, -3.7038</li>
        </ul>
      </div>
    </div>
  )
}

export default ManualCoordinatesField