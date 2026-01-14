import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'
import siteMetadata from '@/data/siteMetadata'

export const runtime = 'edge'
export const alt = 'Blog Post'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params
  const slug = decodeURI(resolvedParams.slug.join('/'))
  const postResult = await getPostBySlug(slug)

  if (!postResult) {
    return new Response('Not found', { status: 404 })
  }

  const post = postResult.source === 'microcms' ? postResult.post : { title: postResult.post.title }

  // Load favicon from the site URL
  const faviconUrl = new URL('/static/favicons/favicon.svg', siteMetadata.siteUrl)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1f2937', // Dark gray background
          position: 'relative',
        }}
      >
        {/* Vignette effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            padding: '80px',
          }}
        >
          {/* Favicon */}
          <img
            src={faviconUrl.toString()}
            alt="favicon"
            width={80}
            height={80}
            style={{ marginBottom: '40px' }}
          />

          {/* Post Title */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '1000px',
            }}
          >
            {post.title}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
