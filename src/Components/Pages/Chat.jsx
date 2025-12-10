import Chat from "../Chat/Index.jsx"



const ChatPage = ({ id }) => {
  return (
    <div className="chat-wrapper text-white">
        <div className="header py-[2.5rem] 3xl:py-[2rem] pb-[1.5rem] flex justify-center items-center">
            <div className="logo w-[13.375rem]"><img src="/assets/Landing/header-logo.png" className="w-full" alt="logo-image" /></div>
        </div>
        <Chat id={id} />
    </div>
  )
}

export default ChatPage
