// WebSocket service for real-time flight updates
// This connects to OpenSky Network's WebSocket API for live updates

import { Server } from 'socket.io'
import { createServer } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Flight } from '@/components/FlightTracker/types'

// Note: WebSocket support in Next.js App Router requires custom server
// This is a conceptual implementation showing how it would work

export class FlightWebSocketService {
  private io: Server | null = null
  private flightSubscriptions: Map<string, Set<string>> = new Map() // userId -> Set of flight ICAOs
  private areaSubscriptions: Map<string, { lat: number; lng: number; radius: number }> = new Map()
  
  initialize(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      }
    })

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)

      // Subscribe to area updates
      socket.on('subscribe:area', (data: { lat: number; lng: number; radius: number }) => {
        this.areaSubscriptions.set(socket.id, data)
        this.sendAreaFlights(socket.id)
      })

      // Subscribe to specific flight
      socket.on('subscribe:flight', (icao24: string) => {
        if (!this.flightSubscriptions.has(socket.id)) {
          this.flightSubscriptions.set(socket.id, new Set())
        }
        this.flightSubscriptions.get(socket.id)!.add(icao24)
      })

      // Unsubscribe from flight
      socket.on('unsubscribe:flight', (icao24: string) => {
        this.flightSubscriptions.get(socket.id)?.delete(icao24)
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
        this.flightSubscriptions.delete(socket.id)
        this.areaSubscriptions.delete(socket.id)
      })
    })

    // Start update loop
    this.startUpdateLoop()
  }

  private async startUpdateLoop() {
    setInterval(async () => {
      // Fetch updates for all subscribed areas
      for (const [socketId, area] of this.areaSubscriptions) {
        await this.sendAreaFlights(socketId)
      }

      // Fetch updates for specific flights
      for (const [socketId, flights] of this.flightSubscriptions) {
        for (const icao24 of flights) {
          await this.sendFlightUpdate(socketId, icao24)
        }
      }
    }, 5000) // Update every 5 seconds for real-time feel
  }

  private async sendAreaFlights(socketId: string) {
    const area = this.areaSubscriptions.get(socketId)
    if (!area || !this.io) return

    try {
      // Fetch flights from OpenSky API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/flights?lat=${area.lat}&lng=${area.lng}&radius=${area.radius}`
      )
      const data = await response.json()
      
      // Send update to specific client
      this.io.to(socketId).emit('flights:area', data.flights)
    } catch (error) {
      console.error('WebSocket area update error:', error)
    }
  }

  private async sendFlightUpdate(socketId: string, icao24: string) {
    if (!this.io) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/flights`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icao24 })
        }
      )
      const data = await response.json()
      
      if (data.flight) {
        this.io.to(socketId).emit('flight:update', data.flight)
      }
    } catch (error) {
      console.error('WebSocket flight update error:', error)
    }
  }
}

// Client-side hook for WebSocket connection
export const useFlightWebSocket = () => {
  const [socket, setSocket] = useState<any>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      const newSocket = io(process.env.NEXT_PUBLIC_APP_URL || '', {
        path: '/api/flights/websocket'
      })

      newSocket.on('connect', () => {
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    })
  }, [])

  const subscribeToArea = (lat: number, lng: number, radius: number) => {
    socket?.emit('subscribe:area', { lat, lng, radius })
  }

  const subscribeToFlight = (icao24: string) => {
    socket?.emit('subscribe:flight', icao24)
  }

  const unsubscribeFromFlight = (icao24: string) => {
    socket?.emit('unsubscribe:flight', icao24)
  }

  return {
    socket,
    connected,
    subscribeToArea,
    subscribeToFlight,
    unsubscribeFromFlight
  }
}
