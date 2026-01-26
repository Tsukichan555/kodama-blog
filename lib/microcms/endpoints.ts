export type MicroCMSParamValue = string | number | boolean | null | undefined

export type MicroCMSRequest = {
  path: string
  params?: Record<string, MicroCMSParamValue>
}

export const buildMicroCMSPath = (path: string, params?: Record<string, MicroCMSParamValue>) => {
  if (!params) return path
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    searchParams.set(key, String(value))
  })
  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}

const MICROCMS_BLOG_ENDPOINT: string = process.env.MICROCMS_BLOG_ENDPOINT || 'blog' // 'blog' or 'blog_test'
const MICROCMS_ABOUT_ENDPOINT: string = process.env.MICROCMS_ABOUT_ENDPOINT || 'about' //'about'

export const microcmsEndpoints = {
  listBlogs: (options?: { limit?: number; orders?: string }): MicroCMSRequest => ({
    path: MICROCMS_BLOG_ENDPOINT,
    params: options,
  }),
  blogDetail: (slug: string): MicroCMSRequest => ({
    path: `${MICROCMS_BLOG_ENDPOINT}/${slug}`,
  }),
  about: (options?: { limit?: number }): MicroCMSRequest => ({
    path: MICROCMS_ABOUT_ENDPOINT,
    params: options,
  }),
  blogDraft: (id: string, draftKey: string): MicroCMSRequest => ({
    path: `${MICROCMS_BLOG_ENDPOINT}/${id}`,
    params: { draftKey },
  }),
}
