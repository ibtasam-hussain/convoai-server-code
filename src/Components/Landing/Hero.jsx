


const Hero = () => {
  return (
    <div className="hero-section relative w-[90%] min-h-[75vh] mx-auto flex justify-center items-center">
        <div className="content w-full xs:w-[90%] 3sm:w-[80%] lg:w-[70%] 3xl:w-[55%] mx-auto mt-[-3rem] xs:mt-0 flex flex-col gap-[1.2rem] items-center text-center z-50">
            <div className="heading gradient-text text-[1.8rem] 4xs:text-[2.1rem] xs:text-[2.5rem] 3sm:text-[2.9rem] lg:text-[3.5rem] 3xl:text-[4.5rem] leading-[1.2]">Effortless Human-Like AI Phone Calls</div>
            <div className="sub-heading text-[.9rem] xs:text-[.95rem] 3sm:text-[1.05rem] lg:text-[1.2rem] 3xl:text-[1.5rem] leading-relaxed">Build a no-code AI phone call system with our AI voice agents: stop missing calls and start converting more leads.</div>
            <div className="button w-fit text-[1.05rem] xs:text-[1.125rem] px-[2.1rem] py-[1.1rem] xs:px-[2.5rem] xs:py-[1.375rem] mt-[1.125rem] rounded-[2.5rem] bg-[#010314] border-[1.5px] border-[#4467FF]" style={{ boxShadow: '0px 0px 10px 0px rgba(119, 68, 255, 0.70)' }}>Contact Us</div>
        </div>
        {/* gradient background */}
        <div className="bg-wrapper absolute left-[50%] top-[60%] xs:top-[50%] translate-x-[-50%] translate-y-[-50%] h-full w-full z-10"><img src="/assets/Landing/bg.svg" alt="" /></div>
    </div>
  )
}

export default Hero
