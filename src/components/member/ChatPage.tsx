"use client";

import { RootState } from "@/app/reduxUtils/store";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Button, Spinner, Textarea } from "@nextui-org/react";
import useChatMessages from "@/hooks/useChatMessages";
import { insertChatMessage } from "@/app/api/chatMessagesIUD";
import useChatHeaders from "@/hooks/useChatHeaders";
import ChatHeader from "./headers/ChatHeader";
import { IoArrowBack, IoChevronBack } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";

const ChatPage = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<string>("headers");
  const [selectedConvo, setSelectedConvo] = useState<any | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const rowsPerPage = 200;
  const [partnerDisplayName, setPartnerDisplayName] = useState("");

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

  const handleChatHeaderClick = (partnerId: string) => {
    setSelectedChatPartnerId(partnerId);
    setCurrentView("chat");
  };

  const handleSubmit = async () => {
    if (!selectedConvo || !user) return;

    await insertChatMessage({
      message: messageInput,
      sender_id: user.id,
      receiver_id:
        selectedConvo.receiver_id === user.id
          ? selectedConvo.sender_id
          : selectedConvo.receiver_id,
    });
    setMessageInput("");
  };

  // partnerName
  useEffect(() => {
    if (selectedConvo) {
      const partnerDisplayName =
        selectedConvo.sender_id !== user.id
          ? `${selectedConvo.sender_raw_user_meta_data.first_name} ${selectedConvo.sender_raw_user_meta_data.last_name}`
          : selectedConvo.receiver_id !== user.id
          ? `${selectedConvo.receiver_raw_user_meta_data.first_name} ${selectedConvo.receiver_raw_user_meta_data.last_name}`
          : "Unknown";

      setPartnerDisplayName(partnerDisplayName);
    } else {
      setPartnerDisplayName("");
    }
  }, [selectedConvo, user.id]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, selectedConvo]);

  return (
    <>
      <div className="w-full h-full flex flex-col items-center">
        <ChatHeader />
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Spinner color="success" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className="flex flex-col h-full w-full overflow-hidden">
              <div className="h-full w-full grid grid-cols-1 lg:grid-cols-[1fr,1.5fr]">
                {/* headers */}
                <div
                  className={`${
                    currentView === "headers" ? "block" : "hidden"
                  } lg:block h-full w-full p-4 overflow-y-auto`}
                >
                  <div className="h-full w-full flex flex-col rounded-xl border border-green-500 bg-green-300">
                    <ul className="h-full w-full flex flex-col overflow-y-auto">
                      {chatHeaders && chatHeaders.length === 0 ? (
                        <li className="flex justify-center items-center h-full">
                          No chat history
                        </li>
                      ) : (
                        user &&
                        chatHeaders.map((item: any, index: any) => {
                          const displayName =
                            item.sender_id !== user.id
                              ? `${item.sender_raw_user_meta_data.first_name} ${item.sender_raw_user_meta_data.last_name}`
                              : item.receiver_id !== user.id
                              ? `${item.receiver_raw_user_meta_data.first_name} ${item.receiver_raw_user_meta_data.last_name}`
                              : "Unknown";

                          const displayImage =
                            item.sender_id !== user.id
                              ? item.sender_raw_user_meta_data.profile_picture
                              : item.receiver_id !== user.id
                              ? item.receiver_raw_user_meta_data.profile_picture
                              : "";

                          // Determine if the user is the latest messager
                          const isUserLatestMessager =
                            item.sender_id === user.id;

                          return (
                            <li
                              key={item.chat_message_id}
                              className={`${
                                selectedConvo &&
                                selectedConvo.chat_message_id ===
                                  item.chat_message_id
                                  ? "lg:bg-green-600 hover:lg:bg-green-600 lg:text-white hover:lg:text-white"
                                  : "hover:lg:bg-green-700 hover:lg:text-white"
                              } flex items-center py-2 px-3 text-sm rounded-md cursor-pointer w-full relative`}
                              onClick={() => {
                                setSelectedConvo(item);
                                handleChatHeaderClick(
                                  item.sender_id === user.id
                                    ? item.receiver_id
                                    : item.sender_id
                                );
                              }}
                            >
                              <span className="w-full flex items-center gap-2">
                                <div className="flex">
                                  {!displayImage ? (
                                    <Avatar
                                      size="sm"
                                      name={displayName}
                                      showFallback
                                      disableAnimation
                                    />
                                  ) : (
                                    <Avatar
                                      size="sm"
                                      src={displayImage}
                                      showFallback
                                      disableAnimation
                                    />
                                  )}
                                </div>

                                <div className="flex flex-col justify-center truncate">
                                  <span className="truncate text-lg">
                                    {displayName}
                                  </span>
                                  <span className="text-xs truncate">
                                    {isUserLatestMessager
                                      ? `You: ${item.message}`
                                      : item.message}{" "}
                                  </span>
                                </div>
                              </span>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </div>
                </div>

                {/* messages */}
                <div
                  className={`${
                    currentView === "chat" ? "block" : "hidden"
                  } lg:block h-full w-full p-4 overflow-y-auto`}
                >
                  {selectedConvo ? (
                    <>
                      <div className="h-full w-full flex flex-col rounded-xl border border-green-500 bg-gray-100 relative">
                        {/* messages header */}
                        <div className="w-full h-14 flex lg:justify-center items-center p-2 gap-2 rounded-xl">
                          <Button
                            // isIconOnly
                            startContent={<IoArrowBack size={18} />}
                            variant="light"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => {
                              setSelectedConvo(null);
                              setCurrentView("headers");
                            }}
                          >
                            <h3 className="text-lg font-semibold truncate">
                              {partnerDisplayName}
                            </h3>
                          </Button>
                          <h3 className="text-lg font-semibold truncate hidden lg:block">
                            {partnerDisplayName}
                          </h3>
                        </div>

                        {/* messages body */}
                        <div className="w-full h-full flex flex-col gap-2 flex-grow p-2 overflow-y-auto">
                          {chatMessages.map((message) => {
                            const isSender =
                              message.sender_id === user.id ? true : false;

                            const partnerProfilePicture = isSender
                              ? message.sender_profile_picture
                              : message.receiver_profile_picture;

                            return (
                              <div
                                key={message.chat_message_id}
                                className={`flex gap-4 items-center ${
                                  isSender ? "justify-end" : ""
                                }`}
                              >
                                <div className="flex">
                                  {!isSender &&
                                    (!partnerProfilePicture ? (
                                      <Avatar
                                        name={partnerDisplayName}
                                        showFallback
                                        disableAnimation
                                      />
                                    ) : (
                                      <Avatar
                                        src={partnerProfilePicture}
                                        showFallback
                                        disableAnimation
                                      />
                                    ))}
                                </div>

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
                                <div ref={bottomRef} />
                              </div>
                            );
                          })}
                        </div>

                        {/* messages footer */}
                        <div className="w-full flex p-2 gap-2">
                          <Textarea
                            placeholder="Type your message..."
                            color="success"
                            minRows={1}
                            maxRows={1}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                              }
                            }}
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
                    </>
                  ) : (
                    <div className="h-full w-full flex justify-center items-center text-gray-600 text-sm">
                      Select a message
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ChatPage;
