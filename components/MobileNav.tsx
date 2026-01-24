'use client'

import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
import { Fragment, useState, useEffect, useRef } from 'react'
import Link from './Link'
import headerNavLinks from '@/data/headerNavLinks'
import { ExternalLink } from 'lucide-react'

const MobileNav = () => {
  const [navShow, setNavShow] = useState(false)
  const navRef = useRef(null)

  const onToggleNav = () => {
    setNavShow((status) => {
      if (status) {
        enableBodyScroll(navRef.current)
      } else {
        // Prevent scrolling
        disableBodyScroll(navRef.current)
      }
      return !status
    })
  }

  useEffect(() => {
    return clearAllBodyScrollLocks
  })

  return (
    <>
      <button aria-label="Toggle Menu" onClick={onToggleNav} className="sm:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="hover:text-primary-500 dark:hover:text-primary-400 [height:var(--size-icon-lg)] [width:var(--size-icon-lg)] text-gray-900 dark:text-gray-100"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <Transition appear show={navShow} as={Fragment} unmount={false}>
        <Dialog as="div" onClose={onToggleNav} unmount={false}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            unmount={false}
          >
            <div className="fixed inset-0 [z-index:var(--z-60)] bg-black/25" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-95"
            leave="transition ease-in duration-200 transform"
            leaveFrom="translate-x-0 opacity-95"
            leaveTo="translate-x-full opacity-0"
            unmount={false}
          >
            <DialogPanel className="fixed top-0 left-0 [z-index:var(--z-70)] h-full w-full bg-white/95 duration-300 dark:bg-gray-950/98">
              <nav
                ref={navRef}
                className="mt-8 flex h-full basis-0 flex-col items-start overflow-y-auto [padding-inline-start:var(--spacing-mobile-nav-left)] text-left [padding-block-start:0.5rem]"
              >
                {headerNavLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-primary-500 dark:hover:text-primary-400 [padding-block:0.5rem] [padding-inline-end:1rem] text-2xl font-bold tracking-widest text-gray-900 outline outline-0 [margin-block-end:1rem] dark:text-gray-100"
                    onClick={onToggleNav}
                  >
                    {link.title}
                  </Link>
                ))}
                <Link
                  href="mailto:&#x6C;&#x6F;&#x63;&#x6B;&#x68;&#x6F;&#x64;&#x61;&#x2E;&#x6D;&#x61;&#x72;&#x74;&#x69;&#x6E;&#x40;&#x67;&#x6D;&#x61;&#x69;&#x6C;&#x2E;&#x63;&#x6F;&#x6D;"
                  className="hover:text-primary-500 dark:hover:text-primary-400 flex flex-row items-center [gap:0.5rem] [padding-block:0.5rem] [padding-inline-end:1rem] text-2xl font-bold tracking-widest text-gray-900 outline outline-0 [margin-block-end:1rem] dark:text-gray-100"
                  onClick={onToggleNav}
                >
                  <span>Contact</span>
                  <ExternalLink className="[height:var(--size-icon-sm)] [width:var(--size-icon-sm)]" />
                </Link>
              </nav>

              <button
                className="hover:text-primary-500 dark:hover:text-primary-400 fixed [top:1.75rem] [right:1rem] [z-index:var(--z-80)] [height:var(--size-icon-2xl)] [width:var(--size-icon-2xl)] [padding:1rem] text-gray-900 dark:text-gray-100"
                aria-label="Toggle Menu"
                onClick={onToggleNav}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileNav
