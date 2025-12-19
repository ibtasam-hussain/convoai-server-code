import Chat from "../Chat/Index.jsx"
import Logo from "../../../public/assets/Admin/dashboard/logo.svg"
import Image from "next/image"



const ChatPage = ({ id }) => {
  return (
    <div className="chat-wrapper text-white">
        <div className="header py-[2.5rem] 3xl:py-[2rem] pb-[1.5rem] flex justify-center items-center">
              <div
             className="
               flex items-center gap-3
               cursor-pointer
               select-none
                  mb-10
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
        <Chat id={id} />
    </div>
  )
}

export default ChatPage
