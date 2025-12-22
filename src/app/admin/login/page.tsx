'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FiEyeOff, FiEye } from "react-icons/fi";
import Image from 'next/image';
import Logo from "../../../../public/assets/Admin/dashboard/logo.png";

type FieldErrors = Partial<Record<'email' | 'password', string>>

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 000 16v4l3.5-3.5L12 20v4a12 12 0 010-24C6.477 0 2 4.477 2 10h2z"
    ></path>
  </svg>
);

export default function LoginPage() {
  const [data, setData] = useState({ email: '', password: '' })
  const [hide, setHide] = useState(true)
  const [touched, setTouched] = useState<{[k: string]: boolean}>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>('')
  const [apiErrors, setApiErrors] = useState<FieldErrors>({})
  const router = useRouter()

  const errors = useMemo(() => {
    const e: FieldErrors = {}
    if (!data.email.trim()) e.email = 'Email is required'
    if (!data.password) e.password = 'Password is required'
    return e
  }, [data])

  const showError = (name: keyof FieldErrors) => touched[name] && (errors[name] || apiErrors[name])

  const onSubmit = async () => {
    setTouched({ email: true, password: true })
    setServerError('')
    setApiErrors({})
    if (Object.keys(errors).length) return

    try {
      setSubmitting(true)
      console.log('data: ', data)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
        credentials: 'include',
      })

      const payload = await res.json().catch(() => ({}))

      const token = payload?.token
      if (token) {
        localStorage.setItem('token', token)
      }
      const user = payload?.user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        window.dispatchEvent(new Event("userUpdated"))
      }

      if (!res.ok) {
        if (payload?.errors && typeof payload.errors === 'object') {
          setApiErrors(payload.errors as FieldErrors)
        }
        setServerError(
          payload?.message ||
            (res.status === 401 ? 'Invalid credentials.' : 'Unable to sign in. Please try again.')
        )
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setServerError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') onSubmit()
  }

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center overflow-hidden" onKeyDown={onKeyDown}>
      {/* Top logo (bigger) */}
<div className="pt-20 flex items-center gap-3">
  <Image
    src={Logo}
    alt="logo-image"
    width={300}
    height={200}
    priority
  />
</div>



      {/* Card */}
      <div className="relative z-10 mx-auto mt-14 w-[90%] sm:w-[70%] md:w-[60%] lg:w-[45%] xl:w-[35%] 2xl:w-[30%]">
        <div className="rounded-[1.5rem] border border-gray-200 bg-white shadow-md px-[1.5rem] py-[2.4rem] sm:px-[2rem] sm:py-[3rem] lg:px-[3rem] lg:py-[4.125rem]">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-[1.8rem] sm:text-[2.1rem] lg:text-[2.5rem] font-semibold text-gray-900">
              Welcome Back!
            </h1>
          </div>

          {/* Inputs */}
          <div className="mt-6 flex flex-col gap-[.9rem] text-gray-700 font-medium">
            <div>
              <label htmlFor="email-input" className="text-[1rem]">Email</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('email') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/user-icon.svg" alt="" className="h-4 w-4 opacity-80" />
                <input
                  id="email-input"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none placeholder:text-gray-400"
                  value={data.email}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              {showError('email') && <p className="mt-1 text-xs text-red-500">{errors.email || apiErrors.email}</p>}
            </div>

            <div>
              <label htmlFor="password-input" className="text-[1rem]">Password</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('password') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/key-icon.svg" alt="" className="h-4 w-4 opacity-80" />
                <input
                  id="password-input"
                  type={hide ? 'password' : 'text'}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full bg-transparent outline-none placeholder:text-gray-400"
                  value={data.password}
                  onBlur={() => setTouched(p => ({ ...p, password: true }))}
                  onChange={(e) => setData((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setHide(v => !v)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  {hide ? <FiEye className="text-[20px]" /> : <FiEyeOff className="text-[20px]" />}
                </button>
              </div>
              {showError('password') && <p className="mt-1 text-xs text-red-500">{errors.password || apiErrors.password}</p>}
            </div>

            {/* Footer links */}
            <div className="flex items-center justify-between text-[13px] text-gray-500">
              <button type="button" onClick={() => (window.location.href = '/admin/signup')} className="hover:text-gray-700">Don’t have an account?</button>
              <button type="button" onClick={() => (window.location.href = '/forgot-password')} className="hover:text-gray-700">Forgot Password?</button>
            </div>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mt-3 rounded-md bg-red-50 text-red-600 text-sm px-3 py-2 border border-red-100">
              {serverError}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="mt-5 w-full rounded-lg py-2.5 text-white text-sm font-medium shadow-sm transition
                       bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:opacity-95 active:opacity-90 disabled:opacity-60
                       flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Signing in…</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </div>

      {/* Bottom waves image full width */}
      <img
        src="/assets/Admin/bg.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none opacity-30 absolute left-0 right-0 bottom-0 w-full h-auto object-cover object-bottom"
      />
    </div>
  )
}
