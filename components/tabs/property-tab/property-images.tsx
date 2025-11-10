import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type ImageItem = { src?: string; label?: string }

export function PropertyImages({ images }: { images: ImageItem[] }) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    setIndex(0)
  }, [images])

  if (!images || images.length === 0) return null

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Gallery</h2>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
      </div>

      <div className="relative max-w-xl mx-auto">
        {/* Main Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={images[index].src || "/placeholder.svg"}
              alt={images[index].label || `image-${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-1.5 text-center">
            <p className="text-xs font-medium text-gray-700 leading-tight truncate">
              {images[index].label}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Thumbnails aligned left */}
      <div className="flex gap-2 overflow-x-auto py-1 justify-center ">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`flex-shrink-0 w-24 rounded-lg overflow-hidden border transition-shadow focus:outline-none ${
              i === index ? "ring-2 ring-gray-900" : "border-gray-200"
            }`}
            aria-label={`Show image ${i + 1}`}
          >
            <div className="aspect-[4/3] overflow-hidden cursor-pointer">
              <img
                src={img.src || "/placeholder.svg"}
                alt={img.label || `thumb-${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-1 text-center">
              <p className="text-xs font-medium text-gray-700 leading-tight truncate cursor-pointer">
                {img.label}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
