import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import { Plane } from 'lucide-react'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'

const Header = () => {
  let headerClass =
    'flex items-center w-full bg-white dark:bg-gray-950 justify-between [padding-block:var(--spacing-header-y)]'
  if (siteMetadata.stickyNav) {
    headerClass += ' sticky top-0 z-50'
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-start justify-between">
          <div className="[margin-inline-end:var(--gap-sm)] text-orange-700 dark:text-orange-500">
            <Plane
              className="mb-0 [height:var(--size-icon-lg)] [width:var(--size-icon-lg)] pb-0 [padding-block-start:0.25rem]"
              fill="currentColor"
              stroke="none"
              aria-hidden="true"
            />
          </div>
          {typeof siteMetadata.headerTitle === 'string' ? (
            <div className="hidden [height:var(--size-icon-md)] text-2xl font-semibold sm:block">
              {siteMetadata.headerTitle}
            </div>
          ) : (
            siteMetadata.headerTitle
          )}
        </div>
      </Link>
      <div className="flex items-center [column-gap:var(--gap-md)] leading-5 sm:[margin-inline-end:-1.5rem] sm:[column-gap:var(--gap-lg)]">
        <div className="no-scrollbar hidden [max-width:var(--container-nav-sm)] items-center [column-gap:var(--gap-md)] overflow-x-auto sm:flex md:[max-width:var(--container-nav-md)] lg:[max-width:var(--container-nav-lg)]">
          {headerNavLinks
            .filter((link) => link.href !== '/')
            .map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="hover:text-primary-500 dark:hover:text-primary-400 [margin:0.25rem] font-medium text-gray-900 dark:text-gray-100"
              >
                {link.title}
              </Link>
            ))}
          <Link
            href="mailto:&#x6C;&#x6F;&#x63;&#x6B;&#x68;&#x6F;&#x64;&#x61;&#x2E;&#x6D;&#x61;&#x72;&#x74;&#x69;&#x6E;&#x40;&#x67;&#x6D;&#x61;&#x69;&#x6C;&#x2E;&#x63;&#x6F;&#x6D;"
            className="hover:text-primary-500 dark:hover:text-primary-400 [margin:0.25rem] font-medium text-gray-900 underline dark:text-gray-100"
          >
            Contact
          </Link>
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
