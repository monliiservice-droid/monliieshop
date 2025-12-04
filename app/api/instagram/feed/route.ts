import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour

interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  caption?: string
  timestamp: string
}

export async function GET() {
  try {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN

    if (!accessToken) {
      console.warn('Instagram Access Token not configured')
      return NextResponse.json({ 
        error: 'Instagram not configured',
        posts: [] 
      })
    }

    // Fetch latest media from Instagram Basic Display API
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,caption,timestamp&access_token=${accessToken}&limit=8`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`)
    }

    const data = await response.json()

    // Filter only images (no videos for now)
    const posts: InstagramMedia[] = data.data
      .filter((item: InstagramMedia) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM')
      .slice(0, 8)

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
