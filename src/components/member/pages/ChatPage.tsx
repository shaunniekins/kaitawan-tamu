// components/member/pages/ChatPage.tsx

"use client";

import { useState } from "react";
import {
  Avatar,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import CartHeader from "../headers/CartHeader";
import ChatHeader from "../headers/ChatHeader";
import { IoChevronBack } from "react-icons/io5";
import useChatHeaders from "@/hooks/useChatHeaders";
import { IoMdTrash } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import useChatMessages from "@/hooks/useChatMessages";
import { insertChatMessage } from "@/app/api/chatMessagesIUD";
import { useSelector } from "react-redux";
import { RootState } from "@/app/reduxUtils/store";

const ChatPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<string>("headers");
  const [selectedConvo, setSelectedConvo] = useState<any | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const rowsPerPage = 20;
  const [partnerDisplayName, setPartnerDisplayName] = useState("");

  // const [user, setUser] = useState<User | null>(null);
  // const supabase = createClient();

  // useEffect(() => {
  //   supabase.auth
  //     .getUser()
  //     .then(({ data: { user } }) => {
  //       setUser(user);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching user:", error);
  //     });
  // }, [supabase]);

  const user = useSelector((state: RootState) => state.user.user);

  const { chatHeaders, loadingChatHeaders, errorChatHeaders } = useChatHeaders(
    user ? user.id : ""
  );

  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<
    string | null
  >(null);

  const { chatMessages, loadingChatMessages, errorChatMessages } =
    useChatMessages(
      rowsPerPage,
      1, // currentPage
      user ? user.id : "",
      selectedChatPartnerId || ""
    );

  // useEffect(() => {
  //   console.log("chatMessages:", chatMessages);
  // }, [chatMessages]);

  const handleChatHeaderClick = (partnerId: string) => {
    setSelectedChatPartnerId(partnerId);
    setCurrentView("chat");
  };

  const handleSubmit = async () => {
    if (!selectedConvo || !user) return;

    await insertChatMessage({
      message: messageInput,
      sender_id: user.id,
      receiver_id: selectedConvo.partner_id,
    });
    setMessageInput("");
  };

  return (
    <>
      <div className="lg:hidden">
        <ChatHeader />
      </div>
      <div className="main-container justify-start">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}

        {!isLoading && (
          <div className="product-details-container h-[86svh] lg:h-[91svh] overflow-x-hidden mt-3 md:mt-0 bg-purple-800">
            <div className="w-full col-span-full grid grid-cols-1 lg:grid-cols-3 h-full">
              {/* Chat Headers */}
              <div
                className={`${
                  currentView !== "headers" ? "hidden lg:block" : "block"
                } h-full bg-green-800 text-white rounded-lg`}
              >
                <ul className="h-full flex flex-col pb-5">
                  {chatHeaders.length === 0 ? (
                    <li className="flex justify-center items-center h-full">
                      No chat history
                    </li>
                  ) : user ? (
                    chatHeaders.map((item, index) => {
                      const displayName =
                        item.sender_id !== user.id
                          ? `${item.sender_raw_user_meta_data.first_name} ${item.sender_raw_user_meta_data.last_name}`
                          : item.receiver_id !== user.id
                          ? `${item.receiver_raw_user_meta_data.first_name} ${item.receiver_raw_user_meta_data.last_name}`
                          : "Unknown";

                      // Determine if the user is the latest messager
                      const isUserLatestMessager = item.sender_id === user.id;

                      return (
                        <li
                          key={index}
                          className={`${
                            selectedConvo &&
                            selectedConvo.chat_message_id ===
                              item.chat_message_id
                              ? "lg:bg-green-600 hover:lg:bg-green-600"
                              : "hover:lg:bg-green-700"
                          } flex items-center py-2 px-3 text-sm rounded-md cursor-pointer w-full relative group`}
                          onClick={() => {
                            setSelectedConvo(item);
                            handleChatHeaderClick(item.partner_id);
                          }}
                        >
                          <span className="w-full flex items-center gap-2">
                            <Avatar
                              size="sm"
                              name={displayName}
                              showFallback
                              // src="https://images.unsplash.com/broken"
                            />
                            <div className="flex flex-col justify-center truncate">
                              <span className="truncate text-lg">
                                {displayName}
                              </span>
                              <span className="text-xs truncate">
                                {isUserLatestMessager
                                  ? `You: ${item.message}`
                                  : item.message}
                              </span>
                            </div>
                          </span>
                          <Popover showArrow placement="bottom">
                            <PopoverTrigger>
                              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full p-2 hover:bg-green-900">
                                <BsThreeDotsVertical />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-1">
                              <Button size="sm" startContent={<IoMdTrash />}>
                                Delete
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </li>
                      );
                    })
                  ) : (
                    <li className="flex justify-center items-center h-full">
                      Loading...
                    </li>
                  )}
                </ul>
              </div>
              {/* Chat Messages */}
              <div
                className={`${
                  currentView !== "chat" ? "hidden lg:block" : "block"
                } h-full col-span-2 bg-blue-200 relative`}
              >
                {/* lg:hidden */}
                <div className="absolute top-0 left-0 w-full h-12 px-4 bg-white flex gap-3 items-center justify-between">
                  <Button
                    startContent={<IoChevronBack />}
                    variant="faded"
                    size="sm"
                    className="visible lg:invisible"
                    onClick={() => {
                      setCurrentView("headers");
                    }}
                  >
                    back
                  </Button>
                  {/* title */}
                  <h3 className="text-sm font-semibold">
                    {partnerDisplayName}
                  </h3>
                  <Button
                    startContent={<IoChevronBack />}
                    variant="faded"
                    size="sm"
                    className="invisible"
                  >
                    back
                  </Button>
                </div>
                <div className="p-4 mt-12">
                  <div className="flex flex-col gap-3">
                    {chatMessages.map((message) => {
                      const isSender =
                        message.sender_id === (user ? user.id : "");
                      const displayName = isSender
                        ? `${message.receiver_first_name} ${message.receiver_last_name}`
                        : `${message.sender_first_name} ${message.sender_last_name}`;
                      const partnerDisplayName = isSender
                        ? `${message.sender_first_name} ${message.sender_last_name}`
                        : `${message.receiver_first_name} ${message.receiver_last_name}`;

                      return (
                        <div
                          key={message.chat_message_id}
                          className={`flex gap-4 items-start ${
                            isSender ? "justify-end" : ""
                          }`}
                        >
                          {!isSender && (
                            <Avatar name={displayName} showFallback />
                          )}
                          <div
                            className={`message py-2 ${
                              isSender
                                ? "text-right px-3 rounded-2xl bg-gray-300"
                                : "text-left"
                            }`}
                            style={{ whiteSpace: "pre-wrap" }} // Preserve newlines
                          >
                            {message.message}
                          </div>
                          {isSender && (
                            <Avatar name={partnerDisplayName} showFallback />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`${
                    (!selectedConvo || loadingChatHeaders) && "hidden"
                  } absolute bottom-0 left-0 w-full p-4 bg-white flex gap-3`}
                >
                  <Textarea
                    placeholder="Type your message..."
                    minRows={1}
                    maxRows={2}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button
                    isDisabled={!messageInput}
                    className={`${!messageInput && "hidden"}`}
                    onClick={handleSubmit}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatPage;
