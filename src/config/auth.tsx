'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace(`/admin/login?next=${pathname}`)
    } else {
      setAllowed(true)
    }
  }, [router, pathname])

  if (!allowed) return null // or a loader

  return <>{children}</>
}
