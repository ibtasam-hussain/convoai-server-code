import ChatPage from "@/Components/Pages/Chat"



const Chat = async ({ params }) => {
  const { id } = await params;

  return (
    <ChatPage id={id} />
  )
}

export default Chat
