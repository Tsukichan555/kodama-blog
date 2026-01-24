import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto [max-width:var(--container-md)] [padding-inline:1rem] sm:[padding-inline:1.5rem] xl:[max-width:var(--container-lg)] xl:[padding-inline:0]">
      {children}
    </section>
  )
}
