'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type ApiErrors = Partial<Record<'username' | 'email' | 'password' | 'confirm', string>>

export default function SignUpPage() {
  const router = useRouter()
  const [data, setData] = useState({ username: '', email: '', password: '', confirm: '' })
  const [hidePwd, setHidePwd] = useState(true)
  const [hideConfirm, setHideConfirm] = useState(true)
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiErrors, setApiErrors] = useState<ApiErrors>({})
  const [serverError, setServerError] = useState<string>('')

  const errors = useMemo(() => {
    const e: { [k: string]: string } = {}
    if (!data.username.trim()) e.username = 'Username is required'
    if (!data.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email'
    if (!data.password) e.password = 'Password is required'
    else if (data.password.length < 6) e.password = 'Min 6 characters'
    if (!data.confirm) e.confirm = 'Confirm your password'
    else if (data.confirm !== data.password) e.confirm = 'Passwords do not match'
    return e
  }, [data])

  const showError = (name: keyof ApiErrors) =>
    touched[name] && (errors[name] || apiErrors[name])

  const onSubmit = async () => {
    // front-end validation first
    setTouched({ username: true, email: true, password: true, confirm: true })
    setApiErrors({})
    setServerError('')
    if (Object.keys(errors).length) return

    try {
      setSubmitting(true)
      console.log('data: ', data)
      console.log('process.env.NEXT_PUBLIC_API_URL: ', process.env.NEXT_PUBLIC_API_URL)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.username.trim(),
          email: data.email.trim(),
          password: data.password,
        }),
      })

      const payload = await res.json().catch(() => ({}))

      if (!res.ok) {
        // prefer detailed field errors if provided
        if (payload?.errors && typeof payload.errors === 'object') {
          setApiErrors(payload.errors as ApiErrors)
        }
        // show a friendly general message as well
        setServerError(
          payload?.message ||
            (res.status === 409
              ? 'This email is already registered.'
              : 'Unable to create account. Please try again.')
        )
        return
      }

      // success: you can redirect wherever makes sense
      router.push('/admin/dashboard')
    } catch (err) {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-white flex flex-col items-center">
      {/* Top logo (bigger) */}
      <div className="pt-10">
        <img src="/assets/Admin/logo.png" alt="ConvoAI" className="h-14 w-auto mb-12" />
      </div>

      {/* Card */}
      <div className="relative z-10 mx-auto mt-14 w-[95%] 4sm:w-[70%] lg:w-[55%] 3xl:w-[36.5%]">
        <div className="rounded-[1.5rem] border border-gray-200 bg-white shadow-md px-[1.5rem] py-[2.4rem] xs:px-[2rem] 4xs:py-[2.7rem] 2sm:px-[3rem] xs:py-[3rem] lg:px-[4.3rem] md:py-[4.125rem]">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-[1.8rem] 3xs:text-[2.1rem] lg:text-[2.5rem] font-semibold text-gray-900">
              Create Account
            </h1>
          </div>

          {/* Inputs */}
          <div className="mt-6 flex flex-col gap-[.9rem] text-gray-700 font-medium">
            {/* Username */}
            <div>
              <label htmlFor="username-input" className="text-[1rem]">Username</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('username') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/user-icon.svg" alt="" className="h-4 w-4 opacity-60" />
                <input
                  id="username-input"
                  type="text"
                  placeholder="Username"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  value={data.username}
                  onBlur={() => setTouched((p) => ({ ...p, username: true }))}
                  onChange={(e) => setData((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
              {showError('username') && (
                <p className="mt-1 text-xs text-red-500">{errors.username || apiErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email-input" className="text-[1rem]">Email</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('email') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/mail-icon.svg" alt="" className="h-4 w-4 opacity-60" />
                <input
                  id="email-input"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  value={data.email}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              {showError('email') && (
                <p className="mt-1 text-xs text-red-500">{errors.email || apiErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password-input" className="text-[1rem]">Password</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('password') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/key-icon.svg" alt="" className="h-4 w-4 opacity-60" />
                <input
                  id="password-input"
                  type={hidePwd ? 'password' : 'text'}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  value={data.password}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  onChange={(e) => setData((p) => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setHidePwd((v) => !v)}
                  className="p-1 opacity-70 hover:opacity-100"
                  aria-label={hidePwd ? 'Show password' : 'Hide password'}
                >
                  <img
                    src={hidePwd ? '/assets/Login/eye.svg' : '/assets/Login/eye-hide.svg'}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              </div>
              {showError('password') && (
                <p className="mt-1 text-xs text-red-500">{errors.password || apiErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-input" className="text-[1rem]">Confirm Password</label>
              <div className={`mt-2 flex items-center gap-3 rounded-md border ${showError('confirm') ? 'border-red-400' : 'border-gray-300'} bg-white px-4 py-2.5`}>
                <img src="/assets/Login/key-icon.svg" alt="" className="h-4 w-4 opacity-60" />
                <input
                  id="confirm-input"
                  type={hideConfirm ? 'password' : 'text'}
                  placeholder="Re-enter password"
                  className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  value={data.confirm}
                  onBlur={() => setTouched((p) => ({ ...p, confirm: true }))}
                  onChange={(e) => setData((p) => ({ ...p, confirm: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setHideConfirm((v) => !v)}
                  className="p-1 opacity-70 hover:opacity-100"
                  aria-label={hideConfirm ? 'Show confirm password' : 'Hide confirm password'}
                >
                  <img
                    src={hideConfirm ? '/assets/Login/eye.svg' : '/assets/Login/eye-hide.svg'}
                    alt=""
                    className="h-5 w-5"
                  />
                </button>
              </div>
              {showError('confirm') && (
                <p className="mt-1 text-xs text-red-500">{errors.confirm || apiErrors.confirm}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-[13px] text-gray-500">
              <button type="button" onClick={() => router.push('/login')} className="hover:text-gray-700">
                Already have an account?
              </button>
              <button type="button" onClick={() => router.push('/forgot-password')} className="hover:text-gray-700">
                Forgot Password?
              </button>
            </div>
          </div>

          {/* CTA */}
          {serverError && (
            <div className="mt-3 rounded-md bg-red-50 text-red-600 text-sm px-3 py-2 border border-red-100">
              {serverError}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="mt-4 w-full rounded-lg py-2.5 text-white text-sm font-medium shadow-sm transition
                       bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:opacity-95 active:opacity-90 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
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
