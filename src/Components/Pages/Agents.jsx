import AgentsPage from "../Agents/Index"


const Agents = () => {
  return (
    <div className="agents-wrapper overflow-y-hidden text-white">
        <div className="header py-[2.7rem] xs:py-[3.9rem] w-full flex justify-center items-center">
            <div className="logo w-[10rem] sm:w-[13.375rem]"><img src="/assets/Landing/header-logo.png" className="w-full" alt="logo-image" /></div>
        </div>
        <AgentsPage />
    </div>
  )
}

export default Agents
