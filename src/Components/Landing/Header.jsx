import Link from "next/link"


const Header = () => {
  return (
    <div className="header py-[2.5rem] xs:py-[3.9rem] w-[90%] sm:w-[84%] mx-auto flex justify-between items-center">
        <div className="left">
            <div className="logo w-[9.5rem] sm:w-[13.375rem]"><img src="/assets/Landing/header-logo.png" className="w-full" alt="logo-image" /></div>
        </div>
        <Link href={'/login'} className="right button text-[1rem] px-[1.8rem] py-[.8rem] xs:px-[2.5rem] xs:py-[1rem] rounded-[2.5rem] border-[1.5px] border-white" style={{ boxShadow: '0px 0px 10px 0px #74F' }}>Login</Link>
    </div>
  )
}

export default Header
