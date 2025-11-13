// import React from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// export type ImageItem = { src?: string; label?: string }

// export function PropertyImages({ images }: { images: ImageItem[] }) {
//   const [index, setIndex] = React.useState(0)

//   React.useEffect(() => {
//     setIndex(0)
//   }, [images])

//   if (!images || images.length === 0) return null

//   const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
//   const next = () => setIndex((i) => (i + 1) % images.length)

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Gallery</h2>
//         <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
//       </div>

//       <div className="relative max-w-xl mx-auto">
//         {/* Main Image */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//           <div className="aspect-[4/3] overflow-hidden">
//             <img
//               src={images[index].src || "/placeholder.svg"}
//               alt={images[index].label || `image-${index + 1}`}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <div className="p-1.5 text-center">
//             <p className="text-xs font-medium text-gray-700 leading-tight truncate">
//               {images[index].label}
//             </p>
//           </div>
//         </div>

//         {/* Navigation Buttons */}
//         <button
//           onClick={prev}
//           aria-label="Previous image"
//           className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm flex items-center justify-center cursor-pointer"
//         >
//           <ChevronLeft className="w-4 h-4 text-gray-700" />
//         </button>
//         <button
//           onClick={next}
//           aria-label="Next image"
//           className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm flex items-center justify-center cursor-pointer"
//         >
//           <ChevronRight className="w-4 h-4 text-gray-700" />
//         </button>
//       </div>

//       {/* Thumbnails aligned left */}
//       <div className="flex gap-2 overflow-x-auto py-1 justify-center ">
//         {images.map((img, i) => (
//           <button
//             key={i}
//             onClick={() => setIndex(i)}
//             className={`flex-shrink-0 w-24 rounded-lg overflow-hidden border transition-shadow focus:outline-none ${
//               i === index ? "ring-2 ring-gray-900" : "border-gray-200"
//             }`}
//             aria-label={`Show image ${i + 1}`}
//           >
//             <div className="aspect-[4/3] overflow-hidden cursor-pointer">
//               <img
//                 src={img.src || "/placeholder.svg"}
//                 alt={img.label || `thumb-${i + 1}`}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div className="p-1 text-center">
//               <p className="text-xs font-medium text-gray-700 leading-tight truncate cursor-pointer">
//                 {img.label}
//               </p>
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyData } from "@/lib/property-data";

interface PropertyImageCarouselProps {
  propertyData: PropertyData;
  className?: string;
}

export default function PropertyImageCarousel({ propertyData, className = "" }: PropertyImageCarouselProps) {
  const images =
    propertyData?.images && propertyData.images.length > 0
      ? propertyData.images
      : [
          {
            src: propertyData?.thumbnail || "/placeholder.svg?height=300&width=500&query=apartment building",
            label: propertyData?.name || "Property",
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);

  const visibleThumbs = 5; // Number of thumbnails visible at once
  const totalThumbs = images.length;

  const goPrevMain = () => setCurrentIndex((i) => (i - 1 + totalThumbs) % totalThumbs);
  const goNextMain = () => setCurrentIndex((i) => (i + 1) % totalThumbs);

  const goPrevThumbs = () => setThumbStartIndex((i) => Math.max(0, i - 1));
  const goNextThumbs = () => setThumbStartIndex((i) => Math.min(totalThumbs - visibleThumbs, i + 1));

  const select = (i: number) => setCurrentIndex(i);

  useEffect(() => {
    setCurrentIndex(0);
    setThumbStartIndex(0);
  }, [propertyData?.id, propertyData?.thumbnail, propertyData?.images?.length]);

  const displayedThumbs = images.slice(thumbStartIndex, thumbStartIndex + visibleThumbs);

  return (
    <div className={`max-w-3xl mx-auto space-y-6 ${className}`}>
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Image</h2>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2" />
      </div>

      {/* Main Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-gray-50">
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrevMain}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-md bg-white/80 hover:bg-white shadow"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={goNextMain}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-md bg-white/80 hover:bg-white shadow"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].label || `${propertyData?.name} image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {images.length > 1 && (
          <div className="absolute right-3 bottom-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length > 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Property Gallery</h3>
            <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2" />
          </div>

          <div className="relative flex items-center justify-center">
            {/* Left arrow */}
            {thumbStartIndex > 0 && (
              <button
                type="button"
                aria-label="Scroll left"
                onClick={goPrevThumbs}
                className="absolute left-0 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Thumbnails */}
            <div className="flex justify-center gap-2 overflow-hidden w-full px-8 border-t py-4">
              {displayedThumbs.map((image, i) => {
                const actualIndex = thumbStartIndex + i;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => select(actualIndex)}
                    type="button"
                    className={`rounded-lg border overflow-hidden flex-shrink-0 transition-transform ${
                      actualIndex === currentIndex
                        ? "ring-2 ring-blue-500 scale-100"
                        : "hover:scale-105"
                    }`}
                    style={{ width: "190px" }}
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={image.src}
                        alt={image.label || `Thumbnail ${actualIndex + 1}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                    <div className="p-1 text-center bg-white">
                      <p className="text-[11px] font-medium text-gray-700 leading-tight truncate">
                        {image.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right arrow */}
            {thumbStartIndex + visibleThumbs < totalThumbs && (
              <button
                type="button"
                aria-label="Scroll right"
                onClick={goNextThumbs}
                className="absolute right-0 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
