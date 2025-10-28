import Main from './Main'
import { getAllPosts } from '@/lib/posts'

export default async function Page() {
  const posts = await getAllPosts()
  return <Main posts={posts} />
}
