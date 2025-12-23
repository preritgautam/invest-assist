// components/WalkScore.tsx
import React, { useEffect, useState } from 'react'

interface WalkScoreProps {
    address: string
    lat: number
    lon: number
}

interface WalkScoreData {
    walkScore: number | null
    walkDescription: string | null
    transitScore: number | null
    transitDescription: string | null
    bikeScore: number | null
    bikeDescription: string | null
    wsLink: string | null
    helpLink: string | null
}

const WalkScore: React.FC<WalkScoreProps> = ({ address, lat, lon }) => {
    const [data, setData] = useState<WalkScoreData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchWalkScore = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(
                    `/api/walkscore?address=${encodeURIComponent(address)}&lat=${lat}&lon=${lon}`
                )
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                } else {
                    setError(result.error || 'Failed to fetch Walk Score')
                }
            } catch (err) {
                setError('Failed to fetch Walk Score data')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        if (address && lat && lon) {
            fetchWalkScore()
        }
    }, [address, lat, lon])

    const getScoreColor = (score: number | null): string => {
        if (!score) return 'gray'
        if (score >= 90) return 'emerald'
        if (score >= 70) return 'blue'
        if (score >= 50) return 'amber'
        if (score >= 25) return 'orange'
        return 'red'
    }

    const ScoreCard = ({
        score,
        description,
        label,
        icon
    }: {
        score: number | null
        description: string | null
        label: string
        icon: string
    }) => {
        if (score === null) return null

        const color = getScoreColor(score)

        return (
            <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{icon}</span>
                            <div className={`text-sm font-bold text-${color}-900`}>
                                {label}
                            </div>
                        </div>
                        <div className={`text-xs text-${color}-700 mt-1 font-medium`}>
                            {description}
                        </div>
                    </div>
                    <div className={`text-5xl font-display font-extrabold text-${color}-600`}>
                        {score}
                    </div>
                </div>
                <div className={`h-2 bg-${color}-200 rounded-full overflow-hidden`}>
                    <div
                        className={`h-full bg-${color}-500 transition-all duration-1000 ease-out`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
                    <p className="text-gray-600 font-medium">Loading Walk Scores...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-red-900">Error Loading Scores</h4>
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                    Location Scores
                </h2>
                <p className="text-gray-600 mt-2 text-sm">{address}</p>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreCard
                    score={data.walkScore}
                    description={data.walkDescription}
                    label="Walk Score®"
                    icon="🚶"
                />
                <ScoreCard
                    score={data.transitScore}
                    description={data.transitDescription}
                    label="Transit Score®"
                    icon="🚌"
                />
                <ScoreCard
                    score={data.bikeScore}
                    description={data.bikeDescription}
                    label="Bike Score®"
                    icon="🚴"
                />
            </div>

            {/* Score Legend */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h4 className="font-display font-semibold text-gray-900 mb-3 text-sm">
                    Score Guide
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-gray-700">90-100: Paradise</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-700">70-89: Very Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-gray-700">50-69: Somewhat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-700">25-49: Car-Dependent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-700">0-24: Very Car-Dependent</span>
                    </div>
                </div>
            </div>

            {/* Attribution (REQUIRED by Walk Score Terms) */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                <span>Powered by</span>
                <a
                    href="https://www.walkscore.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline"
                >
                    Walk Score®
                </a>
                {data.wsLink && (
                    <>
                        <span>•</span>
                        <a
                            href={data.wsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            View Details
                        </a>
                    </>
                )}
                {data.helpLink && (
                    <>
                        <span>•</span>
                        <a
                            href={data.helpLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Help
                        </a>
                    </>
                )}
            </div>
        </div>
    )
}

export default WalkScore
