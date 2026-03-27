'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useEffect, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { Spinner } from '@/components/ui/spinner'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  useEffect(() => {
    if (document.readyState === 'complete') {
      setLoadComments(true)
    } else {
      const handleLoad = () => setLoadComments(true)
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  if (!siteMetadata.comments?.provider) {
    return null
  }
  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      ) : (
        <div
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
          aria-live="polite"
          aria-label="コメントを読み込み中"
        >
          <Spinner size={20} />
          <span>コメントを読み込み中</span>
        </div>
      )}
    </>
  )
}
