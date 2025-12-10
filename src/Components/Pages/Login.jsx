import LoginPage from "../Login/Index"


const Login = () => {
  return (
    <div className="login-wrapper overflow-y-hidden text-white">
        <div className="header py-[2.5rem] xs:py-[3.9rem] flex justify-center items-center">
            <div className="logo w-[9.5rem] sm:w-[13.375rem]"><img src="/assets/Landing/header-logo.png" className="w-full" alt="logo-image" /></div>
        </div>
        <LoginPage />
    </div>
  )
}

export default Login
