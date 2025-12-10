import Header from "../Landing/Header"
import Hero from "../Landing/Hero"


const Landing = () => {
  return (
    <div className="landing-page relative text-white overflow-y-hidden h-full">
        <Header />
        <Hero />
        {/* <div className="bg-wrapper absolute bottom-0 left-0 opacity-[0.75]"><img src="/assets/Landing/bg-main.svg" alt="background-image" /></div> */}
    </div>
  )
}

export default Landing
