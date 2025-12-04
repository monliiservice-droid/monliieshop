'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Instagram } from 'lucide-react'

interface InstagramPost {
  id: string
  media_type: string
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchInstagramFeed() {
      try {
        const response = await fetch('/api/instagram/feed')
        const data = await response.json()

        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts)
          setError(false)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error loading Instagram feed:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramFeed()
  }, [])

  // Show placeholders while loading or if error
  if (loading || error || posts.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <a
            key={i}
            href="https://www.instagram.com/monlii_i/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Instagram className="h-12 w-12 text-white" />
            </div>
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Instagram className="h-16 w-16 text-[#931e31]/20" />
            </div>
          </a>
        ))}
      </div>
    )
  }

  // Show actual Instagram posts
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square rounded-2xl overflow-hidden soft-shadow group cursor-pointer transition-all duration-300 hover:scale-105"
        >
          {/* Instagram Post Image */}
          <Image
            src={post.media_url}
            alt={post.caption || 'Instagram post'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#931e31]/90 via-[#931e31]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
            <Instagram className="h-10 w-10 text-white mb-2" />
            <p className="text-white text-sm font-medium text-center line-clamp-2">
              {post.caption || 'Zobrazit na Instagramu'}
            </p>
          </div>
        </a>
      ))}
    </div>
  )
}
