import Main from './Main'
import { getAllPosts, getAboutContent } from '@/lib/posts'

export default async function Page() {
  const posts = await getAllPosts()
  const aboutData = await getAboutContent()
  return <Main posts={posts} about={aboutData} />
}
