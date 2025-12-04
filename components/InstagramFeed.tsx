'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Instagram } from 'lucide-react'

// Instagram posts - add your images here
// Upload images to /public/instagram/ folder and update paths
const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: '/instagram/post-1.jpg', // Upload your Instagram image here
    url: 'https://www.instagram.com/p/DQsCraPAhTW/',
  },
  {
    id: 2,
    image: '/instagram/post-2.jpg', // Upload your Instagram image here
    url: 'https://www.instagram.com/p/DKrQpFWs5NJ/',
  },
  {
    id: 3,
    image: '/instagram/post-3.jpg', // Upload your Instagram image here
    url: 'https://www.instagram.com/p/DHMQj__MpA5/',
  },
  {
    id: 4,
    image: '/instagram/post-4.jpg', // Upload your Instagram image here
    url: 'https://www.instagram.com/p/DHYlZ1fIjPv/',
  },
]

export function InstagramFeed() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth / 2
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative max-w-6xl mx-auto">
      {/* Navigation Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 -ml-4 hidden md:block"
        aria-label="Previous"
      >
        <ChevronLeft className="h-6 w-6 text-[#931e31]" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all hover:scale-110 -mr-4 hidden md:block"
        aria-label="Next"
      >
        <ChevronRight className="h-6 w-6 text-[#931e31]" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {INSTAGRAM_POSTS.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[calc(50%-8px)] md:w-[calc(50%-8px)] snap-start group relative"
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group-hover:soft-shadow-lg transition-all">
              {/* Instagram Image */}
              <div className="relative w-full h-full bg-gradient-to-br from-pink-100 to-purple-100">
                <Image
                  src={post.image}
                  alt={`Instagram post ${post.id}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onError={(e) => {
                    // Fallback když obrázek neexistuje
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                {/* Placeholder pokud obrázek neexistuje */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Instagram className="h-20 w-20 text-[#931e31]/20" />
                </div>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#931e31]/80 via-[#931e31]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center">
                  <Instagram className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Zobrazit na Instagramu</p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {INSTAGRAM_POSTS.map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-[#931e31]/30"
          />
        ))}
      </div>
    </div>
  )
}
