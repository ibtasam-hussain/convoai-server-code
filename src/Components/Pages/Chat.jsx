import Chat from "../Chat/Index.jsx"
import Logo from "../../../public/assets/Admin/dashboard/logow.png"
import Image from "next/image"



const ChatPage = ({ id }) => {
  return (
    <div className="chat-wrapper text-white">
        <div className="header -mt-10 py-[2.5rem] pb-[1.5rem] flex justify-center items-center">
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
        <Chat id={id} />
    </div>
  )
}

export default ChatPage
