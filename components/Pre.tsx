'use client'

import { useRef, useState, useEffect } from 'react'
import CopyButton from './CopyButton'

interface PreProps {
  children?: React.ReactNode
  raw?: string
  [key: string]: unknown
}

export default function Pre({ children, raw, ...props }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [codeText, setCodeText] = useState('')

  useEffect(() => {
    if (preRef.current) {
      const code = preRef.current.querySelector('code')
      if (code) {
        const text = code.textContent || ''
        // Only update if text actually changed to avoid unnecessary re-renders
        setCodeText((prev) => (prev === text ? prev : text))
      }
    }
  }, [children])

  return (
    <div className="group relative">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      {codeText && <CopyButton text={codeText} />}
    </div>
  )
}
