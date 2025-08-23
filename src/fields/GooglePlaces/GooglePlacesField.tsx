/* -------------------------------------------------------------------------- */
/* GooglePlacesField – Payload custom field                                   */
/* -------------------------------------------------------------------------- */

'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  Autocomplete,
} from '@react-google-maps/api'
import { useField, useAllFormFields } from '@payloadcms/ui'
import { useDebounce }                from '@/utilities/useDebounce'
import regionToContinentMap           from '@/utilities/continentMap'
import { getByCountryName }           from '@/lib/countries/countriesUtils'
import Image                          from 'next/image'
import { useGoogleMapsLoader, loadGoogleMaps } from '@/lib/google-maps/loader'

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ExtendedPlacePhoto extends google.maps.places.PlacePhoto {
  photo_reference: string
  html_attributions: string[]
}

interface ExtendedPlaceReview {
  author_name: string
  rating: number
  text: string
  language?: string
  profile_photo_url?: string
  relative_time_description?: string
  time?: number
}

interface ExtendedPlaceResult
  extends Omit<google.maps.places.PlaceResult, 'photos' | 'reviews'> {
  photos?: ExtendedPlacePhoto[]
  reviews?: ExtendedPlaceReview[]
}

type Coordinates = { lat: number; lng: number }

export type LocationDataValue = {
  address?: string
  coordinates?: Coordinates | null
  placeID?: string
  country?: string
  continent?: string
  city?: string
  isGoodForChildren?: boolean | null
  isGoodForGroups?: boolean | null
  priceLevel?: number | null
  rating?: number | null
  user_ratings_total?: number | null
  reviews?: ExtendedPlaceReview[] | null
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
    html_attributions: string[]
  }>
  mediaGallery?: string[]
  tempCountryData?: {
    countryName?: string
    countryCode?: string
    currencyCode?: string
    languageCode?: string
    region?: string
  }
}

type Props = {
  path: string
  label?: string
  required?: boolean
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function GooglePlacesField({
  path,
  label = 'Location',
  required = false,
}: Props) {
  /* ---------- form/context hooks -------------------------------- */
  const { value, setValue } = useField<LocationDataValue>({ path })
  const [input, setInput]   = useState<string>(value?.address ?? '')
  useDebounce(input, 200)

  const [_allFields, dispatch] = useAllFormFields()

  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null)

  /* ---------- Google loader ------------------------------------- */
  const { isLoaded } = useGoogleMapsLoader()
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  // Load Google Maps if not already loaded
  useEffect(() => {
    if (!isLoaded && !mapsLoaded) {
      loadGoogleMaps()
        .then(() => setMapsLoaded(true))
        .catch((err) => setLoadError(err))
    } else if (isLoaded) {
      setMapsLoaded(true)
    }
  }, [isLoaded, mapsLoaded])

  /* ---------- small logger (toggle with VERBOSE) ---------------- */
  const log = useCallback((msg: string, data?: unknown) => {
    const VERBOSE = false
    if (VERBOSE) console.log(`[GooglePlacesField] ${msg}`, data)
  }, [])

  /* ---------- helper: upload photo through Next proxy ----------- */
  const uploadImageFromPhotoReference = useCallback(
    async (photoRef: string): Promise<string> => {
      try {
        const res = await fetch(
          `/next/downloadGoogleImage?photo_reference=${encodeURIComponent(
            photoRef,
          )}&maxwidth=800&maxheight=600`,
        )
        const json = await res.json()
        return json.success && json.id ? (json.id as string) : ''
      } catch (err) {
        console.error('upload image error', err)
        return ''
      }
    },
    [],
  )

  /* ---------- onPlaceChanged ------------------------------------ */
  const onPlaceChanged = useCallback(async () => {
    if (!autocomplete) return
    const place = autocomplete.getPlace() as ExtendedPlaceResult
    log('Place selected', place)

    if (!place.geometry?.location) return
    
    // Define event types for payload field updates
    interface PayloadFieldUpdateEventDetail {
      path: string;
      value: LocationDataValue;
    }
    
    // Dispatch a custom event to notify BulkAddModal that a place has been selected
    const dispatchCustomUpdateEvent = (value: LocationDataValue) => {
      try {
        const updateEvent = new CustomEvent<PayloadFieldUpdateEventDetail>('payload-field-update', {
          detail: { path: 'locationData', value },
          // Prevent event from bubbling up or triggering other handlers
          bubbles: false,
          cancelable: true
        });
        window.dispatchEvent(updateEvent);
        console.log('Dispatched payload-field-update event with value:', value);
      } catch (e) {
        console.error('Error dispatching custom event:', e instanceof Error ? e.message : String(e));
      }
    };

    /* derive stereo fields --------------------------------------- */
    const countryComp = place.address_components?.find(c =>
      c.types.includes('country'),
    )
    const countryName = countryComp?.long_name ?? ''
    const staticData  = getByCountryName(countryName)
    const continent   =
      staticData ? regionToContinentMap[staticData.code] || staticData.region : ''

    const cityComp = place.address_components?.find(c =>
      ['locality',
       'administrative_area_level_3',
       'administrative_area_level_2'].some(t => c.types.includes(t)),
    )
    const city = cityComp ? cityComp.long_name : place.name ?? ''

    /* main value -------------------------------------------------- */
    const nextVal: LocationDataValue = {
      address : place.formatted_address ?? '',
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      placeID : place.place_id ?? '',
      country : staticData ? staticData.label : countryName,
      continent,
      city,
      priceLevel        : place.price_level ?? null,
      rating            : place.rating ?? null,
      user_ratings_total: place.user_ratings_total ?? null,
      reviews           : place.reviews ?? null,
      photos            : place.photos?.map(p => ({
        photo_reference : 'photo_reference' in p ? String(p.photo_reference) : '',
        height : p.height,
        width  : p.width,
        html_attributions: p.html_attributions,
      })),
      // Store temporary country data for hook processing
      tempCountryData: staticData ? {
        countryName: staticData.label,
        countryCode: staticData.code,
        currencyCode: staticData.currency?.code,
        languageCode: staticData.language?.code || undefined,
        region: staticData.region,
      } : undefined,
    }

    setValue(nextVal)
    
    // Dispatch custom event to notify BulkAddModal
    dispatchCustomUpdateEvent(nextVal)

    /* mirror to flat fields -------------------------------------- */
    dispatch({ type:'UPDATE', path:'continent', value: continent })
    dispatch({ type:'UPDATE', path:'city', value: city })

    // Note: The actual relationship creation will be handled by the beforeChange hook
    // We just store the temporary data here

    /* set title nicely */
    const titleVal =
      city && (staticData ? staticData.label : countryName)
        ? `${city}, ${staticData ? staticData.label : countryName}`
        : ''
    dispatch({ type:'UPDATE', path:'title', value: titleVal })

    /* optional media upload -------------------------------------- */
    if (nextVal.photos?.length) {
      const ids = await Promise.all(
        nextVal.photos.map(ph =>
          ph.photo_reference
            ? uploadImageFromPhotoReference(ph.photo_reference)
            : '',
        ),
      )
      const ok = ids.filter(Boolean)
      if (ok.length) {
        setValue((v: LocationDataValue) => ({ ...v, mediaGallery: ok }))
        dispatch({ type:'UPDATE', path:'mediaGallery', value: ok })
      }
    }

    setInput(place.formatted_address ?? '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autocomplete, uploadImageFromPhotoReference])

  /* ---------- Reset handler for field -------------------------------- */
  useEffect(() => {
    // Define a more specific type for reset field event
    interface ResetFieldEvent extends Event {
      detail?: {
        path: string;
      };
    }

    const handleResetField = (e: ResetFieldEvent) => {
      if (e.detail?.path === path) {
        log('Received reset field event for path:', path);
        setInput('');
        setValue(undefined);
      }
    };
    
    window.addEventListener('payload-reset-field', handleResetField as EventListener);
    
    return () => {
      window.removeEventListener('payload-reset-field', handleResetField as EventListener);
    };
  }, [path, setValue, log]);
  
  /* ---------- build autocomplete JSX ---------------------------- */
  const acInput = useMemo(
    () => {
      // Only render Autocomplete if Google Maps is truly loaded
      if (!mapsLoaded || typeof window === 'undefined' || !window.google?.maps?.places) {
        return (
          <input
            id={path}
            className="google-places-field__input"
            placeholder="Search for a location (loading...)"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled
            data-location-field="true"
          />
        )
      }
      
      return (
        <Autocomplete
          onLoad={setAutocomplete}
          onPlaceChanged={onPlaceChanged}
          options={{
            types: ['(cities)'],
            fields: [
              'formatted_address',
              'geometry',
              'place_id',
              'address_components',
              'name',
              'photos',
              'price_level',
              'rating',
              'user_ratings_total',
              'reviews',
            ],
          }}
        >
          <input
            id={path}
            className="google-places-field__input"
            placeholder="Search for a location"
            value={input}
            onChange={e => setInput(e.target.value)}
            data-location-field="true"
          />
        </Autocomplete>
      )
    },
    [input, onPlaceChanged, path, mapsLoaded],
  )

  if (loadError) return <div>Failed to load Google Maps API</div>

  /* ---------- JSX ------------------------------------------------ */
  return (
    <div className="google-places-field">
      <label htmlFor={path} className="google-places-field__label">
        {label}
        {required && ' *'}
      </label>

      {acInput}

      {value && (
        <div className="google-places-field__details">
          {value.address && <div><strong>Address:</strong> {value.address}</div>}
          {value.coordinates && (
            <div>
              <strong>Coordinates:</strong>{' '}
              {typeof value.coordinates.lat === 'number'
                ? value.coordinates.lat.toFixed(6)
                : '—'}
              ,{' '}
              {typeof value.coordinates.lng === 'number'
                ? value.coordinates.lng.toFixed(6)
                : '—'}
            </div>
          )}
          {value.country   && <div><strong>Country:</strong>   {value.country}</div>}
          {value.continent && <div><strong>Continent:</strong> {value.continent}</div>}
          {value.city      && <div><strong>City:</strong>      {value.city}</div>}
          {value.rating !== null && (
            <div><strong>Rating:</strong> {value.rating}</div>
          )}
          {value.user_ratings_total !== null && (
            <div><strong>User ratings:</strong> {value.user_ratings_total}</div>
          )}
          {value.mediaGallery?.length ? (
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              {value.mediaGallery.map(id => (
                <div key={id} style={{ position:'relative', width:150, height:150 }}>
                  <Image
                    src={`/api/media/${id}?thumbnail=true`}
                    alt="uploaded"
                    fill
                    style={{ objectFit:'cover' }}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}