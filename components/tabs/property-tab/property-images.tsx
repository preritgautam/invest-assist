"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star, ThumbsUp, ThumbsDown, Loader2, ImageIcon } from "lucide-react";
import type { PropertyData } from "@/lib/property-data";
import { Badge } from "@/components/ui/badge";

interface PropertyImageCarouselProps {
  propertyData: PropertyData;
  propertyId?: string;  // Database property ID for fetching images
  className?: string;
}

interface PropertyImage {
  id: string;
  filename: string;
  storage_path: string;
  signed_url?: string | null;
  image_url?: string | null;
  source_page?: number | null;
  image_category?: string | null;
  image_subcategory?: string | null;
  ai_rating?: number | null;
  ai_positives?: string[] | null;
  ai_negatives?: string[] | null;
  ai_description?: string | null;
  display_order: number;
  is_primary: boolean;
  is_thumbnail: boolean;
}

// OM Image info from extraction
interface OMImageInfo {
  page_number: number;
  image_index: number;
  description: string | null;
  estimated_category: 'exterior' | 'interior' | 'amenity' | 'aerial' | 'map' | 'floorplan' | 'other';
  estimated_subcategory: string | null;
}

interface ImageItem {
  src: string;
  label: string;
  category?: string | null;
  subcategory?: string | null;
  rating?: number | null;
  positives?: string[] | null;
  negatives?: string[] | null;
  description?: string | null;
}

export default function PropertyImageCarousel({
  propertyData,
  propertyId,
  className = ""
}: PropertyImageCarouselProps) {
  const [dbImages, setDbImages] = useState<PropertyImage[]>([]);
  const [omImages, setOmImages] = useState<OMImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Fetch images from database and OM data if propertyId is provided
  useEffect(() => {
    if (!propertyId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both images and OM data in parallel
        const [imagesResponse, omResponse] = await Promise.all([
          fetch(`/api/properties/${propertyId}/images`),
          fetch(`/api/properties/${propertyId}/om-data`)
        ]);

        // Handle images response
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          if (imagesData.success && imagesData.images) {
            setDbImages(imagesData.images);
          }
        }

        // Handle OM data response - extract image info
        if (omResponse.ok) {
          const omData = await omResponse.json();
          if (omData.success && omData.omExtraction?.images) {
            setOmImages(omData.omExtraction.images);
          }
        }
      } catch (error) {
        console.error('[PropertyImages] Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  // Get placeholder image based on category
  const getCategoryPlaceholder = (category: string | null): string => {
    const placeholders: Record<string, string> = {
      'exterior': '/placeholder.svg?height=300&width=500&query=apartment+building+exterior',
      'interior': '/placeholder.svg?height=300&width=500&query=apartment+interior+living+room',
      'amenity': '/placeholder.svg?height=300&width=500&query=apartment+pool+amenity',
      'aerial': '/placeholder.svg?height=300&width=500&query=aerial+view+building',
      'map': '/placeholder.svg?height=300&width=500&query=location+map',
      'floorplan': '/placeholder.svg?height=300&width=500&query=floor+plan',
    };
    return placeholders[category || ''] || '/placeholder.svg?height=300&width=500&query=property+image';
  };

  // Combine database images with propertyData images
  const images: ImageItem[] = React.useMemo(() => {
    // First priority: database images with signed URLs
    if (dbImages.length > 0) {
      return dbImages.map(img => ({
        src: img.signed_url || img.image_url || "/placeholder.svg",
        label: img.ai_description || img.image_category || img.filename,
        category: img.image_category,
        subcategory: img.image_subcategory,
        rating: img.ai_rating,
        positives: img.ai_positives,
        negatives: img.ai_negatives,
        description: img.ai_description,
      }));
    }

    // Second priority: propertyData images (from mock data)
    if (propertyData?.images && propertyData.images.length > 0) {
      return propertyData.images.map(img => ({
        src: img.src,
        label: img.label,
        category: null,
        subcategory: null,
        rating: null,
        positives: null,
        negatives: null,
        description: null,
      }));
    }

    // Third priority: OM extraction image info (with placeholders)
    if (omImages.length > 0) {
      return omImages.map(img => ({
        src: getCategoryPlaceholder(img.estimated_category),
        label: img.description || `${img.estimated_category} - Page ${img.page_number}`,
        category: img.estimated_category,
        subcategory: img.estimated_subcategory,
        rating: null,
        positives: null,
        negatives: null,
        description: img.description,
      }));
    }

    // Fallback: thumbnail
    return [{
      src: propertyData?.thumbnail || "/placeholder.svg?height=300&width=500&query=apartment+building",
      label: propertyData?.name || "Property",
      category: null,
      subcategory: null,
      rating: null,
      positives: null,
      negatives: null,
      description: null,
    }];
  }, [dbImages, omImages, propertyData?.images, propertyData?.thumbnail, propertyData?.name]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbStartIndex, setThumbStartIndex] = useState(0);

  const visibleThumbs = 5;
  const totalThumbs = images.length;

  const goPrevMain = () => setCurrentIndex((i) => (i - 1 + totalThumbs) % totalThumbs);
  const goNextMain = () => setCurrentIndex((i) => (i + 1) % totalThumbs);

  const goPrevThumbs = () => setThumbStartIndex((i) => Math.max(0, i - 1));
  const goNextThumbs = () => setThumbStartIndex((i) => Math.min(totalThumbs - visibleThumbs, i + 1));

  const select = (i: number) => setCurrentIndex(i);

  useEffect(() => {
    setCurrentIndex(0);
    setThumbStartIndex(0);
  }, [propertyData?.id, propertyData?.thumbnail, propertyData?.images?.length, dbImages.length, omImages.length]);

  const displayedThumbs = images.slice(thumbStartIndex, thumbStartIndex + visibleThumbs);
  const currentImage = images[currentIndex];

  // Get category color
  const getCategoryColor = (category: string | null): string => {
    const colors: Record<string, string> = {
      'exterior': 'bg-blue-100 text-blue-700',
      'interior': 'bg-green-100 text-green-700',
      'amenity': 'bg-purple-100 text-purple-700',
      'aerial': 'bg-cyan-100 text-cyan-700',
      'map': 'bg-gray-100 text-gray-700',
      'floorplan': 'bg-orange-100 text-orange-700',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-600';
  };

  // Render rating stars
  const renderRating = (rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium">{rating}/10</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`max-w-3xl mx-auto space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Images</h2>
          <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2" />
        </div>
        <div className="aspect-[16/9] flex items-center justify-center bg-gray-100 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading images...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto space-y-6 ${className}`}>
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Property Images</h2>
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
          src={currentImage.src}
          alt={currentImage.label || `${propertyData?.name} image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=500&query=property";
          }}
        />

        {/* Image info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentImage.category && (
                <Badge className={`capitalize ${getCategoryColor(currentImage.category)}`}>
                  {currentImage.category}
                  {currentImage.subcategory && ` - ${currentImage.subcategory}`}
                </Badge>
              )}
              {currentImage.rating && renderRating(currentImage.rating)}
            </div>
            {images.length > 1 && (
              <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* Toggle analysis button */}
        {(currentImage.positives?.length || currentImage.negatives?.length) && (
          <button
            type="button"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white px-3 py-1.5 rounded-md shadow text-xs font-medium"
          >
            {showAnalysis ? "Hide Analysis" : "Show AI Analysis"}
          </button>
        )}
      </div>

      {/* AI Analysis Panel */}
      {showAnalysis && (currentImage.positives?.length || currentImage.negatives?.length) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">AI Analysis</h3>
            {currentImage.rating && (
              <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-yellow-700">{currentImage.rating}/10</span>
              </div>
            )}
          </div>

          {currentImage.description && (
            <p className="text-sm text-gray-600">{currentImage.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positives */}
            {currentImage.positives && currentImage.positives.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-green-700">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Positives</span>
                </div>
                <ul className="space-y-1">
                  {currentImage.positives.map((positive, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-green-500 mt-0.5">+</span>
                      {positive}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Negatives */}
            {currentImage.negatives && currentImage.negatives.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-red-700">
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-xs font-medium">Concerns</span>
                </div>
                <ul className="space-y-1">
                  {currentImage.negatives.map((negative, idx) => (
                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">-</span>
                      {negative}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

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
                    className={`rounded-lg border overflow-hidden flex-shrink-0 transition-transform relative ${
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="p-1 text-center bg-white flex items-center justify-between">
                      <p className="text-[11px] font-medium text-gray-700 leading-tight truncate flex-1">
                        {image.category ? (
                          <span className="capitalize">{image.category}</span>
                        ) : (
                          image.label
                        )}
                      </p>
                      {image.rating && (
                        <span className="text-[10px] text-yellow-600 font-medium flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {image.rating}
                        </span>
                      )}
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
