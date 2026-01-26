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

export const microcmsEndpoints = {
  listBlogs: (options?: { limit?: number; orders?: string }): MicroCMSRequest => ({
    path: 'blog',
    params: options,
  }),
  blogDetail: (slug: string): MicroCMSRequest => ({
    path: `blog/${slug}`,
  }),
  about: (options?: { limit?: number }): MicroCMSRequest => ({
    path: 'about',
    params: options,
  }),
  blogDraft: (id: string, draftKey: string): MicroCMSRequest => ({
    path: `blog/${id}`,
    params: { draftKey },
  }),
}
