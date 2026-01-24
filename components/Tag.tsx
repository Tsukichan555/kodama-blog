import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/projects/${slug(text)}`}
      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 [margin-inline-end:0.75rem] text-sm font-medium uppercase"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
