// app/api/walkscore/route.ts
import { NextRequest, NextResponse } from 'next/server'

async function geocodeWithMapbox(address: string): Promise<{ lat: number; lon: number } | null> {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiYmlsbGludmVzdGFzc2lzdCIsImEiOiJjbWppNHpqbWowaWsyM2VzbGltc2NtbW1iIn0.ZdZ7tZuBe3BpM0-OicDzOw'

    if (!mapboxToken) {
        console.error('Mapbox token not configured')
        return null
    }

    try {
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`
        
        const response = await fetch(geocodeUrl)
        const data = await response.json()

        console.log('Mapbox geocoding response:', data)

        if (data.features && data.features.length > 0) {
            const [lon, lat] = data.features[0].center
            console.log(`Geocoded address "${address}" to lat: ${lat}, lon: ${lon}`)
            return { lat, lon }
        }

        return null
    } catch (error) {
        console.error('Mapbox geocoding error:', error)
        return null
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    let lat = searchParams.get('lat')
    let lon = searchParams.get('lon')

    // Validate required parameters
    if (!address) {
        return NextResponse.json(
            {
                success: false,
                error: 'Missing required parameter: address is required'
            },
            { status: 400 }
        )
    }

    // If lat/lon not provided, geocode the address using Mapbox
    if (!lat || !lon) {
        const coords = await geocodeWithMapbox(address)
        
        if (!coords) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Could not geocode address. Please provide lat/lon coordinates or check the address.'
                },
                { status: 400 }
            )
        }

        lat = coords.lat.toString()
        lon = coords.lon.toString()
    }

    const apiKey = process.env.WALKSCORE_API_KEY || '7d88da7b7c118c6da72f0d5cb190a1cd'

    if (!apiKey) {
        return NextResponse.json(
            {
                success: false,
                error: 'Walk Score API key not configured'
            },
            { status: 500 }
        )
    }

    try {
        // Build Walk Score API URL
        const walkScoreUrl = `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}&transit=1&bike=1&wsapikey=${apiKey}`

        // Fetch from Walk Score API
        const response = await fetch(walkScoreUrl)

        if (!response.ok) {
            throw new Error(`Walk Score API responded with status: ${response.status}`)
        }

        const data = await response.json()

        // Check if Walk Score API returned an error
        if (data.status !== 1) {
            const errorMessages: Record<number, string> = {
                2: 'Score is being calculated',
                30: 'Invalid latitude/longitude',
                31: 'Walk Score not available for this location',
                40: 'Invalid API key',
                41: 'Daily API quota exceeded',
                42: 'IP address not authorized'
            }

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessages[data.status] || 'Walk Score not available'
                },
                { status: 404 }
            )
        }

        // Return successful response
        return NextResponse.json({
            success: true,
            data: {
                walkScore: data.walkscore ?? null,
                walkDescription: data.description ?? null,
                transitScore: data.transit?.score ?? null,
                transitDescription: data.transit?.description ?? null,
                transitSummary: data.transit?.summary ?? null,
                bikeScore: data.bike?.score ?? null,
                bikeDescription: data.bike?.description ?? null,
                wsLink: data.ws_link ?? null,
                helpLink: data.help_link ?? null,
                moreInfoIcon: data.more_info_icon ?? null,
                moreInfoLink: data.more_info_link ?? null,
                logoUrl: data.logo_url ?? null,
                snappedLat: data.snapped_lat ?? lat,
                snappedLon: data.snapped_lon ?? lon,
                // Include the coordinates used (helpful for debugging)
                coordinates: {
                    lat: parseFloat(lat),
                    lon: parseFloat(lon)
                }
            }
        })
    } catch (error) {
        console.error('Walk Score API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Walk Score data. Please try again later.'
            },
            { status: 500 }
        )
    }
}
