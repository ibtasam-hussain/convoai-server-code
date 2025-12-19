import StartPage from "../Start/Index"
import Logo from "../../../public/assets/Admin/dashboard/logo.svg"
import Image from "next/image"

const Start = ({ searchParams }) => {
  return (
    <div className="start-wrapper text-white">
        <div className="header py-[3rem] pb-[2.5rem] flex justify-center items-center">
               <div
              className="
                flex items-center gap-3
                cursor-pointer
                select-none
                transition-opacity
                hover:opacity-90
              "
            >
              {/* LOGO IMAGE */}
              <div className="w-12 h-12 flex-shrink-0">
                <Image
                  src={Logo}
                  alt="ConvoAI logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            
              {/* BRAND NAME */}
              <span
                className="
                  text-[2.4rem]
                  font-semibold
               
                  tracking-tight
                  text-white
                "
              >
                Conver<span className="text-[#6B4EFF]">AI</span>x
              </span>
            </div>

        </div>
        <StartPage searchParams={searchParams} />
    </div>
  )
}

export default Start
