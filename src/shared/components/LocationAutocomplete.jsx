import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyChjFXyiis_jicX6u-zKHVxqqMY0GtLPKc'

let scriptLoadingPromise = null
function loadGoogleMapsScript() {
  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve(window.google.maps)
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-maps-js-sdk')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google.maps))
      existingScript.addEventListener('error', (e) => reject(e))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-js-sdk'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps)
      } else {
        reject(new Error('Google Maps SDK loaded but window.google.maps missing'))
      }
    }
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export default function LocationAutocomplete({
  label,
  required = false,
  placeholder = 'Search location...',
  value = '',
  onChange,
  onSelectLocation,
  containerClassName = ''
}) {
  const [query, setQuery] = useState(typeof value === 'string' ? value : value?.address || '')
  const [predictions, setPredictions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const autocompleteServiceRef = useRef(null)
  const geocoderRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof value === 'string') {
      setQuery(value)
    } else if (value && typeof value === 'object' && value.address) {
      setQuery(value.address)
    }
  }, [value])

  useEffect(() => {
    loadGoogleMapsScript()
      .then((maps) => {
        if (maps.places && !autocompleteServiceRef.current) {
          autocompleteServiceRef.current = new maps.places.AutocompleteService()
        }
        if (!geocoderRef.current) {
          geocoderRef.current = new maps.Geocoder()
        }
      })
      .catch((err) => {
        console.warn('Google Maps JS SDK load failed:', err)
      })
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    onChange?.(val)

    if (!val.trim()) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    if (autocompleteServiceRef.current) {
      setLoading(true)
      autocompleteServiceRef.current.getPlacePredictions(
        { input: val },
        (results, status) => {
          setLoading(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results)
            setShowDropdown(true)
          } else {
            setPredictions([])
            setShowDropdown(false)
          }
        }
      )
    }
  }

  const selectPrediction = (pred) => {
    setQuery(pred.description)
    setShowDropdown(false)

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ placeId: pred.place_id }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const res = results[0]
          const lat = res.geometry.location.lat()
          const lng = res.geometry.location.lng()
          const locationObj = {
            address: res.formatted_address || pred.description,
            latitude: lat,
            longitude: lng
          }
          onSelectLocation?.(locationObj)
        } else {
          fallbackGeocode(pred.description)
        }
      })
    } else {
      fallbackGeocode(pred.description)
    }
  }

  const fallbackGeocode = async (addressText) => {
    if (!addressText || !addressText.trim()) return

    if (geocoderRef.current) {
      geocoderRef.current.geocode({ address: addressText }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const res = results[0]
          const lat = res.geometry.location.lat()
          const lng = res.geometry.location.lng()
          onSelectLocation?.({
            address: res.formatted_address || addressText,
            latitude: lat,
            longitude: lng
          })
        } else {
          fetchGeocodeRest(addressText)
        }
      })
    } else {
      fetchGeocodeRest(addressText)
    }
  }

  const fetchGeocodeRest = async (addressText) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=${GOOGLE_MAPS_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.status === 'OK' && data.results && data.results[0]) {
        const first = data.results[0]
        const lat = first.geometry.location.lat
        const lng = first.geometry.location.lng
        onSelectLocation?.({
          address: first.formatted_address || addressText,
          latitude: lat,
          longitude: lng
        })
      } else {
        onSelectLocation?.({
          address: addressText,
          latitude: 0,
          longitude: 0
        })
      }
    } catch (err) {
      console.warn('Geocode REST API failed:', err)
      onSelectLocation?.({
        address: addressText,
        latitude: 0,
        longitude: 0
      })
    }
  }

  const handleBlur = () => {
    if (query.trim() && (!value || typeof value !== 'object' || value.address !== query)) {
      fallbackGeocode(query)
    }
  }

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
          required={required}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle/50 border border-border-subtle rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-taxi-500 focus:ring-1 focus:ring-taxi-500 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted animate-pulse">
            Loading...
          </div>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface-card border border-border-subtle rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border-subtle/50 backdrop-blur-md">
          {predictions.map((pred) => (
            <li
              key={pred.place_id}
              onClick={() => selectPrediction(pred)}
              className="px-4 py-3 text-xs text-text-primary hover:bg-taxi-500/10 hover:text-taxi-500 cursor-pointer transition-colors flex items-start gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">{pred.structured_formatting?.main_text || pred.description}</div>
                <div className="text-[11px] text-text-muted">{pred.structured_formatting?.secondary_text || ''}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
