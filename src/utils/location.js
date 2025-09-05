export const detectUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use reverse geocoding to get state from coordinates
          // For demo purposes, we'll simulate this with a simple mapping
          const state = await getStateFromCoordinates(latitude, longitude)
          resolve(state)
        } catch (error) {
          reject(error)
        }
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    )
  })
}

// Simplified state detection based on coordinates
// In a real app, you'd use a proper geocoding service
const getStateFromCoordinates = async (lat, lng) => {
  // California approximate bounds
  if (lat >= 32.5 && lat <= 42 && lng >= -124.5 && lng <= -114) {
    return 'California'
  }
  
  // Texas approximate bounds
  if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
    return 'Texas'
  }
  
  // New York approximate bounds
  if (lat >= 40.5 && lat <= 45 && lng >= -79.8 && lng <= -71.8) {
    return 'New York'
  }
  
  // Florida approximate bounds
  if (lat >= 24.4 && lat <= 31 && lng >= -87.6 && lng <= -79.8) {
    return 'Florida'
  }
  
  // Default to California if location detection fails
  return 'California'
}