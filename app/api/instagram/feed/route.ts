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

    console.log('🔍 Instagram API - Starting fetch')
    console.log('📌 App ID exists:', !!appId)
    console.log('📌 App Secret exists:', !!appSecret)

    if (!appId || !appSecret) {
      console.warn('❌ Instagram credentials not configured')
      return NextResponse.json({ 
        error: 'Instagram not configured',
        posts: [] 
      })
    }

    // Create access token from App ID and App Secret
    const accessToken = `${appId}|${appSecret}`

    // Fetch oEmbed data for each post
    const postPromises = INSTAGRAM_POSTS.map(async (url, index) => {
      try {
        const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}`
        
        console.log(`📡 Fetching post ${index + 1}/${INSTAGRAM_POSTS.length}: ${url}`)
        
        const response = await fetch(oembedUrl, {
          next: { revalidate: 3600 } // Cache for 1 hour
        })

        console.log(`📊 Response status for post ${index + 1}:`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Failed to fetch oEmbed for ${url}:`, response.status, errorText)
          return null
        }

        const data: InstagramOEmbed = await response.json()
        console.log(`✅ Successfully fetched post ${index + 1}:`, data.thumbnail_url ? 'Has thumbnail' : 'No thumbnail')

        return {
          id: url.split('/p/')[1]?.split('/')[0] || Math.random().toString(),
          media_url: data.thumbnail_url,
          permalink: url,
          caption: data.title || data.author_name
        }
      } catch (error) {
        console.error(`❌ Error fetching post ${url}:`, error)
        return null
      }
    })

    const results = await Promise.all(postPromises)
    const posts = results.filter((post) => post !== null) as InstagramPost[]

    console.log('📦 Final result: ', posts.length, 'posts loaded')

    return NextResponse.json({ 
      posts,
      success: true 
    })
  } catch (error) {
    console.error('❌ Error fetching Instagram feed:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch Instagram feed',
      posts: [] 
    })
  }
}
