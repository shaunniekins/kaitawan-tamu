"use client";

import { deleteAIMessage, insertAIMessage } from "@/app/api/aiMessagesIUD";
import { RootState } from "@/app/reduxUtils/store";
import useAIChatMessages from "@/hooks/useAIChatMessages";
import useItemInventory from "@/hooks/useItemInventory";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { IoChevronBack, IoSendOutline } from "react-icons/io5";
import { MdOutlineSell } from "react-icons/md";
import { RiAuctionLine, RiRobot2Line } from "react-icons/ri";
import { useSelector } from "react-redux";

interface ExplorePageProps {
  tagParam: string | null;
}

const ExplorePage = ({ tagParam }: ExplorePageProps) => {
  const user = useSelector((state: RootState) => state.user.user);

  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const rowsPerPage = 500;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const rowsPerPageMessages = 1000;
  const [currentPageMessages, setCurrentPageMessages] = useState(1);

  const { items, loadingItems, errorItems } = useItemInventory(
    rowsPerPage,
    currentPage,
    "approved",
    true,
    user?.id,
    false,
    selectedTags
  );

  useEffect(() => {
    setIsLoading(loadingItems);
  }, [loadingItems]);

  const {
    chatMessages,
    totalChatMessages,
    loadingChatMessages,
    errorChatMessages,
  } = useAIChatMessages(rowsPerPageMessages, currentPageMessages, user?.id);

  // Initialize selectedTags based on tagParam
  useEffect(() => {
    if (tagParam) {
      const tagList = tagParam.includes(",")
        ? tagParam
            .split(",")
            .map(
              (tag) => tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1)
            )
        : [tagParam.trim().charAt(0).toUpperCase() + tagParam.trim().slice(1)];
      setSelectedTags(tagList);
    } else {
      setSelectedTags([]);
    }
  }, [tagParam]);

  // Update URL parameters when selectedTags change
  useEffect(() => {
    if (selectedTags.length > 0) {
      router.push(`/member/explore?tags=${selectedTags.join(",")}`);
    } else {
      router.push(`/member/explore`);
    }
  }, [selectedTags, router]);

  const tags = ["Clothing", "Electronics", "Bag", "Footwear", "Furniture"];

  const toggleTagSelection = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // Remove tag from selectedTags if it's already selected
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      // Add tag to selectedTags
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (currentSender: string, message: string) => {
    if (!message || !user) return;

    try {
      const payload = {
        sender_id: currentSender === "user" ? user.id : null,
        receiver_id: currentSender === "ai" ? user.id : null,
        message: message,
      };

      await insertAIMessage(payload);
      setMessageInput("");
    } catch (error) {
      console.error("Error inserting AI message:", error);
    }
  };

  const handleGenerateAiReply = async (message: string) => {
    if (!messageInput || !user) return;

    setIsAiProcessing(true);
    try {
      const response = await fetch("/api/generate-ai-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate draft reply");
      }

      const data = await response.json();
      const draftReply = data.draftReply;

      await handleSubmit("ai", draftReply);

      /////
      // const urlMatch = draftReply.match(/\/member\/explore\?tags=([^"\s]+)/);
      // if (urlMatch) {
      //   let category = decodeURIComponent(urlMatch[1]);
      //   category = category.charAt(0).toUpperCase() + category.slice(1);
      //   console.log("category", category);
      //   setSelectedTags([category]);
      // }
    } catch (error) {
      console.error("Error generating AI reply:", error);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  const renderMessage = (message: string) => {
    const urlRegex = /(\/member\/explore[^\s]*)/g;
    const parts = message.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        const urlParams = new URLSearchParams(part.split("?")[1]);
        const tags = urlParams.get("tags");
        return (
          <Link
            key={`link-${index}`}
            href={part}
            onClick={(e) => {
              e.preventDefault();
              if (tags) {
                const tagList = tags
                  .split(",")
                  .map(
                    (tag) =>
                      tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1)
                  );
                setSelectedTags(tagList);
                router.push(part);
              }
              setIsAiChatOpen(false);
            }}
          >
            <div className="text-blue-500 underline">here</div>
          </Link>
        );
      }
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    });
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiChatOpen]);

  return (
    <div className="w-full h-full flex flex-col items-center">
      <Modal
        backdrop="blur"
        placement="center"
        hideCloseButton={true}
        isOpen={isAiChatOpen}
        onOpenChange={setIsAiChatOpen}
        className="md:max-w-md h-full md:max-h-96 overflow-y-auto relative"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="sticky top-0 w-full flex gap-3 justify-between items-center bg-white">
                <div className="flex justify-start items-center gap-3 ">
                  <Button
                    isIconOnly
                    variant="flat"
                    startContent={<IoChevronBack size={15} />}
                    onClick={() => {
                      setIsAiChatOpen(false);
                    }}
                  ></Button>
                  <h1 className="flex gap-2 items-center">
                    <RiRobot2Line />
                    Ask AI
                  </h1>
                </div>
                <Button
                  size="sm"
                  color="danger"
                  className={
                    !chatMessages || chatMessages.length === 0 ? "hidden" : ""
                  }
                  onClick={() => deleteAIMessage(user?.id)}
                >
                  Delete Chat
                </Button>
              </ModalHeader>
              <ModalBody>
                <div className="h-full flex flex-col gap-3">
                  {chatMessages && chatMessages.length === 0 ? (
                    <div className="h-full text-gray-700 flex flex-col items-center justify-center">
                      <RiRobot2Line size={30} />
                      <p>No History</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => {
                      const isSender = message.sender_id === user?.id;
                      return (
                        <div
                          key={message.chat_message_id}
                          className={`w-full flex gap-4 py-2 ${
                            !isSender ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`message text-sm py-2 max-w-full whitespace-pre-wrap flex-wrap text-wrap break-words ${
                              isSender ? "px-3 rounded-2xl bg-green-200" : ""
                            } `}
                            style={{
                              overflowWrap: "break-word",
                              wordBreak: "break-word",
                              maxWidth: "100%",
                            }}
                          >
                            {renderMessage(message.message)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </ModalBody>
              <ModalFooter className="sticky bottom-0 flex gap-3 items-center bg-white">
                <Textarea
                  size="lg"
                  radius="lg"
                  maxRows={1}
                  minRows={1}
                  color="success"
                  endContent={
                    <div className="flex gap-4 text-2xl">
                      <button
                        className={`${!messageInput && "hidden"}`}
                        onClick={() => {
                          handleSubmit("user", messageInput);
                          handleGenerateAiReply(messageInput);
                        }}
                      >
                        <IoSendOutline />
                      </button>
                    </div>
                  }
                  placeholder="Enter message here"
                  value={messageInput}
                  isDisabled={isAiProcessing}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit("user", messageInput);
                      handleGenerateAiReply(messageInput);
                    }
                  }}
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Spinner color="success" />
        </div>
      )}

      {/* Category Filter */}
      <div className="w-full flex overflow-x-auto my-2 md:px-2 gap-2 custom-scrollbar">
        {tags.map((tag) => (
          <Chip
            key={tag}
            color={selectedTags.includes(tag) ? "success" : "default"}
            className="cursor-pointer"
            onClick={() => toggleTagSelection(tag)}
          >
            {tag}
          </Chip>
        ))}
      </div>

      {!isLoading && (
        <div className="w-full h-full grid grid-cols-2 md:grid-cols-4 gap-3 px-2">
          {/* AI */}
          <Button
            key="ai-button"
            isIconOnly
            startContent={<RiRobot2Line color="white" size={35} />}
            className="fixed ml-2 right-2 lg:right-96 bottom-20 lg:bottom-10 bg-[#008B47] h-14 w-14 p-2 rounded-full"
            onClick={() => setIsAiChatOpen(true)}
          />

          {items.length === 0 ? (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p className="text-gray-500">No items available</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setIsLoading(true);
                  return router.push(`explore/${item.item_id}`);
                }}
              >
                <Card className="rounded-md shadow-none">
                  <CardBody className="p-0 w-full">
                    <Image
                      alt="Product Image"
                      className={`${
                        isLoading && "h-56 w-56"
                      } object-cover rounded-none w-full rounded-b-md aspect-square`}
                      src={
                        isLoading
                          ? "https://fakeimg.pl/500x500?text=img&font=bebas"
                          : item.image_urls && item.image_urls.length > 0
                          ? item.image_urls[0]
                          : "https://fakeimg.pl/500x500?text=img&font=bebas"
                      }
                    />
                  </CardBody>
                  <CardFooter className="py-1 px-0 flex-col items-start rounded-none">
                    <div className="w-full flex justify-between">
                      <p className="font-semibold text-sm truncate">
                        {item.item_name}
                      </p>
                      <div className="flex gap-1">
                        {item.item_selling_type === "sell" ? (
                          <MdOutlineSell size={20} />
                        ) : (
                          <RiAuctionLine size={20} />
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-medium text-[#008B47]">
                      <span className="text-small">₱</span>
                      {parseFloat(item.item_price).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </h4>
                    <div className="flex gap-1">
                      <Avatar
                        src={item.seller_profile_picture}
                        className="w-4 h-4 text-xs"
                        disableAnimation
                      />
                      <h6 className="text-xs truncate">
                        {item.seller_first_name} {item.seller_last_name}
                      </h6>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
