import 'server-only'

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN
const apiKey = process.env.MICROCMS_API_KEY

export const isMicroCMSEnabled = () => Boolean(serviceDomain && apiKey)

const baseUrl = serviceDomain ? `https://${serviceDomain}.microcms.io/api/v1` : ''

export async function fetchFromMicroCMS<T>(endpoint: string, init?: RequestInit): Promise<T> {
  if (!isMicroCMSEnabled()) {
    throw new Error('MicroCMS environment variables are not configured.')
  }

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    headers: {
      'X-MICROCMS-API-KEY': apiKey as string,
    },
    // Allow incremental revalidation to keep content relatively fresh without
    // requiring a rebuild for every edit made within the CMS.
    next: { revalidate: 60 },
    ...init,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Failed to fetch from microCMS: ${response.status} ${errorBody}`)
  }

  return (await response.json()) as T
}
