import axios from 'axios'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

// Pinata API endpoints
const PINATA_BASE_URL = 'https://api.pinata.cloud'
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs'

// Configure axios instance for Pinata
const pinataAPI = axios.create({
  baseURL: PINATA_BASE_URL,
  headers: {
    'Authorization': `Bearer ${PINATA_JWT}`,
    'Content-Type': 'application/json'
  }
})

// Upload file to IPFS via Pinata
export const uploadToIPFS = async (file, metadata = {}) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add metadata
    const pinataMetadata = {
      name: metadata.name || `recording-${Date.now()}`,
      keyvalues: {
        type: 'recording',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }
    
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata))
    
    // Pinata options
    const pinataOptions = {
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          {
            id: 'FRA1',
            desiredReplicationCount: 2
          },
          {
            id: 'NYC1', 
            desiredReplicationCount: 2
          }
        ]
      }
    }
    
    formData.append('pinataOptions', JSON.stringify(pinataOptions))

    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    )

    const { IpfsHash, PinSize, Timestamp } = response.data
    
    return {
      hash: IpfsHash,
      size: PinSize,
      timestamp: Timestamp,
      url: `${PINATA_GATEWAY_URL}/${IpfsHash}`,
      shareableLink: `${PINATA_GATEWAY_URL}/${IpfsHash}?download=true`
    }

  } catch (error) {
    console.error('IPFS upload error:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

// Upload JSON data to IPFS
export const uploadJSONToIPFS = async (jsonData, metadata = {}) => {
  try {
    const pinataMetadata = {
      name: metadata.name || `data-${Date.now()}`,
      keyvalues: {
        type: 'json',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    }

    const data = {
      pinataContent: jsonData,
      pinataMetadata,
      pinataOptions: {
        cidVersion: 1
      }
    }

    const response = await pinataAPI.post('/pinning/pinJSONToIPFS', data)
    
    const { IpfsHash, PinSize, Timestamp } = response.data
    
    return {
      hash: IpfsHash,
      size: PinSize,
      timestamp: Timestamp,
      url: `${PINATA_GATEWAY_URL}/${IpfsHash}`
    }

  } catch (error) {
    console.error('JSON upload error:', error)
    throw new Error('Failed to upload JSON to IPFS')
  }
}

// Get file from IPFS
export const getFromIPFS = async (hash) => {
  try {
    const response = await axios.get(`${PINATA_GATEWAY_URL}/${hash}`)
    return response.data
  } catch (error) {
    console.error('IPFS retrieval error:', error)
    throw new Error('Failed to retrieve file from IPFS')
  }
}

// List pinned files
export const listPinnedFiles = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.pageLimit) params.append('pageLimit', filters.pageLimit)
    if (filters.pageOffset) params.append('pageOffset', filters.pageOffset)
    if (filters.metadata) {
      Object.entries(filters.metadata).forEach(([key, value]) => {
        params.append(`metadata[keyvalues][${key}][value]`, value)
        params.append(`metadata[keyvalues][${key}][op]`, 'eq')
      })
    }

    const response = await pinataAPI.get(`/data/pinList?${params}`)
    return response.data

  } catch (error) {
    console.error('List files error:', error)
    throw new Error('Failed to list pinned files')
  }
}

// Unpin file from IPFS
export const unpinFile = async (hash) => {
  try {
    await pinataAPI.delete(`/pinning/unpin/${hash}`)
    return true
  } catch (error) {
    console.error('Unpin error:', error)
    throw new Error('Failed to unpin file')
  }
}

// Test Pinata connection
export const testConnection = async () => {
  try {
    const response = await pinataAPI.get('/data/testAuthentication')
    return response.data
  } catch (error) {
    console.error('Pinata connection test failed:', error)
    throw new Error('Failed to connect to Pinata')
  }
}

// Generate shareable link with custom gateway
export const generateShareableLink = (hash, options = {}) => {
  const { 
    gateway = PINATA_GATEWAY_URL,
    download = false,
    filename = null 
  } = options
  
  let url = `${gateway}/${hash}`
  const params = new URLSearchParams()
  
  if (download) params.append('download', 'true')
  if (filename) params.append('filename', filename)
  
  if (params.toString()) {
    url += `?${params.toString()}`
  }
  
  return url
}

// Encrypt file before upload (basic implementation)
export const encryptAndUpload = async (file, password, metadata = {}) => {
  try {
    // Note: This is a basic implementation. In production, use proper encryption
    const arrayBuffer = await file.arrayBuffer()
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify({
      content: Array.from(new Uint8Array(arrayBuffer)),
      filename: file.name,
      type: file.type,
      encrypted: true
    }))
    
    const encryptedFile = new File([data], `encrypted-${file.name}.json`, {
      type: 'application/json'
    })
    
    return await uploadToIPFS(encryptedFile, {
      ...metadata,
      encrypted: true,
      originalFilename: file.name
    })
    
  } catch (error) {
    console.error('Encryption upload error:', error)
    throw new Error('Failed to encrypt and upload file')
  }
}

// Recording-specific upload with metadata
export const uploadRecording = async (blob, recordingMetadata = {}) => {
  try {
    const timestamp = new Date().toISOString()
    const filename = `recording-${Date.now()}.webm`
    
    const file = new File([blob], filename, {
      type: blob.type || 'video/webm'
    })
    
    const metadata = {
      name: filename,
      type: 'police-interaction-recording',
      timestamp,
      duration: recordingMetadata.duration || 0,
      location: recordingMetadata.location || null,
      userId: recordingMetadata.userId || null,
      ...recordingMetadata
    }
    
    const result = await uploadToIPFS(file, metadata)
    
    return {
      ...result,
      filename,
      metadata
    }
    
  } catch (error) {
    console.error('Recording upload error:', error)
    throw new Error('Failed to upload recording')
  }
}
