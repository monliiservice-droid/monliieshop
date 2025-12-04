import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

interface InstagramOEmbed {
  thumbnail_url: string
  author_name: string
  title?: string
  html: string
  permalink?: string
}

interface InstagramPost {
  id: string
  media_url: string
  permalink: string
  caption?: string
}

// Curated Instagram posts
const INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DQsCraPAhTW/',
  'https://www.instagram.com/p/DKrQpFWs5NJ/',
  'https://www.instagram.com/p/DHMQj__MpA5/',
  'https://www.instagram.com/p/DHYlZ1fIjPv/',
  // Add more posts here as needed
]

export async function GET() {
  try {
    const appId = process.env.INSTAGRAM_APP_ID
    const appSecret = process.env.INSTAGRAM_APP_SECRET

    if (!appId || !appSecret) {
      console.warn('Instagram credentials not configured')
      return NextResponse.json({ 
        error: 'Instagram not configured',
        posts: [] 
      })
    }

    // Create access token from App ID and App Secret
    const accessToken = `${appId}|${appSecret}`

    // Fetch oEmbed data for each post
    const postPromises = INSTAGRAM_POSTS.map(async (url) => {
      try {
        const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}`
        
        const response = await fetch(oembedUrl, {
          next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
          console.error(`Failed to fetch oEmbed for ${url}:`, response.status)
          return null
        }

        const data: InstagramOEmbed = await response.json()

        return {
          id: url.split('/p/')[1]?.split('/')[0] || Math.random().toString(),
          media_url: data.thumbnail_url,
          permalink: url,
          caption: data.title || data.author_name
        }
      } catch (error) {
        console.error(`Error fetching post ${url}:`, error)
        return null
      }
    })

    const results = await Promise.all(postPromises)
    const posts = results.filter((post) => post !== null) as InstagramPost[]

    return NextResponse.json({ 
      posts,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching Instagram feed:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Instagram feed',
      posts: [] 
    })
  }
}
