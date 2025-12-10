import StartPage from "../Start/Index"


const Start = ({ searchParams }) => {
  return (
    <div className="start-wrapper text-white">
        <div className="header py-[3rem] pb-[2.5rem] flex justify-center items-center">
            <div className="logo w-[13.375rem]"><img src="/assets/Landing/header-logo.png" className="w-full" alt="logo-image" /></div>
        </div>
        <StartPage searchParams={searchParams} />
    </div>
  )
}

export default Start
