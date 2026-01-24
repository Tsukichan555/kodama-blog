import Link from '@/components/Link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-start justify-start md:mt-24 md:flex-row md:items-center md:justify-center md:[column-gap:var(--gap-lg)]">
      <div className="[column-gap:0.5rem] [padding-block-end:var(--spacing-section-bottom)] [padding-block-start:var(--spacing-section-top)] md:[row-gap:1.25rem]">
        <h1 className="text-6xl leading-9 font-extrabold tracking-tight text-gray-900 md:[border-inline-end-width:2px] md:[padding-inline:var(--spacing-section-y)] md:text-8xl md:leading-14 dark:text-gray-100">
          404
        </h1>
      </div>
      <div className="max-w-md">
        <p className="text-xl leading-normal font-bold [margin-block-end:1rem] md:text-2xl">
          Sorry we couldn't find this page.
        </p>
        <p className="[margin-block-end:var(--spacing-section-bottom)]">
          But dont worry, you can find plenty of other things on our homepage.
        </p>
        <Link
          href="/"
          className="focus:shadow-outline-blue inline [border-radius:var(--radius-md)] border border-transparent bg-blue-600 [padding-inline:1rem] [padding-block:0.5rem] text-sm leading-5 font-medium text-white shadow-xs transition-colors duration-150 hover:bg-blue-700 focus:outline-hidden dark:hover:bg-blue-500"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  )
}
