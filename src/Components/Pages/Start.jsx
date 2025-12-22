import StartPage from "../Start/Index"
import Logo from "../../../public/assets/Admin/dashboard/logow.png"
import Image from "next/image"

const Start = ({ searchParams }) => {
  return (
    <div className="start-wrapper text-white">
        <div className="header  pb-[2.5rem] flex justify-center items-center">
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
              <div className="w-48 h-48 flex-shrink-0">
                <Image
                  src={Logo}
                  alt="ConvoAI logo"
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

            </div>

        </div>
        <StartPage searchParams={searchParams} />
    </div>
  )
}

export default Start
