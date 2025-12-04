'use client'

import { useEffect } from 'react'

// Curated Instagram posts - same as in API
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  'https://www.instagram.com/p/DHYlZ1fIjPv/',
]

export function InstagramFeed() {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)

    // Process embeds after script loads
    script.onload = () => {
      if (window.instgrm) {
        window.instgrm.Embeds.process()
      }
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
      {INSTAGRAM_POSTS.map((url) => (
        <div 
          key={url}
          className="instagram-embed-wrapper rounded-2xl overflow-hidden soft-shadow"
          style={{ minHeight: '500px' }}
        >
          <blockquote
            className="instagram-media"
            data-instgrm-captioned
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{
              background: '#FFF',
              border: '0',
              borderRadius: '16px',
              boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
              margin: '1px',
              maxWidth: '100%',
              minWidth: '326px',
              padding: '0',
              width: 'calc(100% - 2px)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Type declaration for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}
