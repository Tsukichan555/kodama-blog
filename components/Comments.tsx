'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  if (!siteMetadata.comments?.provider) {
    return null
  }
  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      ) : (
        <button
          onClick={() => setLoadComments(true)}
          className="focus:shadow-outline-orange inline [border-radius:var(--radius-md)] border border-transparent bg-orange-600 [padding-inline:1rem] [padding-block:0.5rem] text-sm leading-5 font-medium text-white shadow-xs transition-colors duration-150 hover:bg-orange-700 focus:outline-hidden dark:hover:bg-orange-500"
        >
          Load Comments
        </button>
      )}
    </>
  )
}
