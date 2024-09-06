// components/admin/Dashboard.tsx:

"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Tab,
  Tabs,
} from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineLogout } from "react-icons/md";
import { Key, useCallback, useEffect, useState } from "react";
import { signOutAdmin } from "@/utils/supabase-functions/signOut";
import { RxBox, RxDashboard, RxGear, RxPerson } from "react-icons/rx";
import {
  fetchPendingItemsInInventoryDataForAdmin,
  updatePendingItemsInInventoryDataForAdmin,
} from "@/app/api/itemInventoryData";
import { fetchUsersDataForAdmin, updateNewUser } from "@/app/api/usersData";
import { createClient } from "@/utils/supabase/client";
import { supabaseAdmin } from "@/utils/supabase/supabaseDb";

const AdminDashboardComponent = () => {
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState("dashboard");

  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [openSpecificItemModal, setOpenSpecificItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [productListingFilter, setProductListingFilter] = useState("pending");

  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [openSpecificUserModal, setOpenSpecificUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userStatusFilter, setUserStatusFilter] = useState("pending");

  const supabase = createClient();

  const handleSelectionChange = (key: Key) => {
    const keyString = key.toString();
    if (keyString !== currentTab) {
      // handleReset();
    }
    setCurrentTab(keyString);
  };

  // 2) Product Listings
  const memoizedFetchPendingItemsData = useCallback(async () => {
    try {
      const response = await fetchPendingItemsInInventoryDataForAdmin(
        productListingFilter
      );
      if (response?.error) {
        console.error(response.error);
      } else {
        setPendingItems(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [setPendingItems, productListingFilter]);

  useEffect(() => {
    memoizedFetchPendingItemsData();
  }, [memoizedFetchPendingItemsData]);

  useEffect(() => {
    const channel = supabase
      .channel("chat_sessions_item_inventory")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ItemInventory",
          // filter: `status=eq.${productListingFilter}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPendingItems((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setPendingItems((prev) => {
              return prev
                .map((user) => {
                  if (user.id === payload.new.id) {
                    // Only update if the status matches productListingFilter
                    if (payload.new.status === productListingFilter) {
                      return payload.new;
                    }
                    // If the status does not match, remove the item from the list
                    return null;
                  }
                  return user;
                })
                .filter((user) => user !== null); // Remove null values from the array
            });
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productListingFilter, setPendingItems]);

  useEffect(() => {
    if (!openSpecificItemModal) {
      setSelectedItem(null);
    }
  }, [openSpecificItemModal]);

  const handleItemStatusUpdate = async (itemId: number, newStatus: string) => {
    await updatePendingItemsInInventoryDataForAdmin(itemId, newStatus);
    setOpenSpecificItemModal(false);
    setSelectedItem(null);
  };

  // useEffect(() => {
  //   if (productListingFilter === "" || productListingFilter === null)
  //     setProductListingFilter("pending");
  // }, [productListingFilter, setProductListingFilter]);

  // useEffect(() => {
  //   console.log("filter: ", productListingFilter);
  // }, [productListingFilter]);

  // 3) Users
  const memoizedFetchUsersData = useCallback(async () => {
    try {
      const response = await fetchUsersDataForAdmin(userStatusFilter);
      if (response?.error) {
        console.error(response.error);
      } else {
        setPendingUsers(response?.data ?? []);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, [setPendingUsers, userStatusFilter]);

  useEffect(() => {
    memoizedFetchUsersData();
  }, [memoizedFetchUsersData]);

  useEffect(() => {
    const channel = supabase
      .channel("chat_sessions_users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Users",
          // filter: `status=eq.${userStatusFilter}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPendingUsers((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setPendingUsers((prev) => {
              return prev
                .map((user) => {
                  if (user.id === payload.new.id) {
                    // Only update if the status matches userStatusFilter
                    if (payload.new.status === userStatusFilter) {
                      return payload.new;
                    }
                    // If the status does not match, remove the user from the list
                    return null;
                  }
                  return user;
                })
                .filter((user) => user !== null); // Remove null values from the array
            });
            // memoizedFetchUsersData();
          }
        }
      )
      .subscribe((status) => {
        if (status !== "SUBSCRIBED") {
          console.error("Error subscribing to channel:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userStatusFilter, setPendingUsers]);

  const handleUserStatusUpdateAndAccountCreation = async (
    userTableId: number,
    newStatus: string
  ) => {
    if (newStatus === "approved") {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: selectedUser.email,
        password: selectedUser.password,
        email_confirm: true,
        user_metadata: {
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          password: selectedUser.password,
          role: "member",
          status: "active",
        },
      });
      await updateNewUser(userTableId, newStatus, data.user?.id);
    } else if (newStatus === "suspended") {
      console.log("id: ", selectedUser.id);
      await supabaseAdmin.auth.admin.updateUserById(selectedUser.user_id, {
        user_metadata: {
          status: "suspended",
        },
      });
      await updateNewUser(userTableId, newStatus);
    } else if (newStatus === "reapproved") {
      await supabaseAdmin.auth.admin.updateUserById(selectedUser.user_id, {
        user_metadata: {
          status: "active",
        },
      });
      await updateNewUser(userTableId, "approved");
    } else {
      await updateNewUser(userTableId, newStatus);
    }

    setOpenSpecificUserModal(false);
    setSelectedUser(null);
  };

  return (
    <>
      <Modal
        backdrop="blur"
        isOpen={openSpecificItemModal}
        onOpenChange={setOpenSpecificItemModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Item Posted
              </ModalHeader>
              <ModalBody>
                <div className="flex gap-2">
                  <img
                    alt="Card background"
                    className="object-cover h-32 w-32 rounded-md"
                    src="https://nextui.org/images/hero-card-complete.jpeg"
                  />
                  <div className="truncate">
                    <h6 className="truncate font-semibold">
                      {selectedItem.item_name}
                    </h6>
                    <h6 className="truncate text-xs">
                      {selectedItem.item_category}
                    </h6>
                    <h6 className="truncate text-sm">
                      {selectedItem.item_condition}
                    </h6>
                    <h6 className="truncate font-mono text-lg font-semibold mt-2">
                      PHP{selectedItem.item_price}
                    </h6>

                    <div className="flex gap-1">
                      <Avatar
                        src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                        className="w-4 h-4 text-xs"
                      />
                      <h6 className="text-xs truncate">
                        {selectedItem.seller_first_name}{" "}
                        {selectedItem.seller_last_name}
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h6 className="font-semibold">Description:</h6>
                  <h6 className="text-justify text-sm">
                    {selectedItem.item_description}
                  </h6>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  className={`${
                    selectedItem.item_status !== "pending" && "hidden"
                  }`}
                  onClick={() =>
                    handleItemStatusUpdate(selectedItem.item_id, "rejected")
                  }
                >
                  Reject
                </Button>
                <Button
                  color="primary"
                  className={`${
                    selectedItem.item_status !== "pending" && "hidden"
                  }`}
                  onClick={() =>
                    handleItemStatusUpdate(selectedItem.item_id, "approved")
                  }
                >
                  Approve Item
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        backdrop="blur"
        isOpen={openSpecificUserModal}
        onOpenChange={setOpenSpecificUserModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">User</ModalHeader>
              <ModalBody>
                <div className="flex gap-2">
                  <img
                    alt="Card background"
                    className="object-cover h-32 w-32 rounded-md"
                    src="https://nextui.org/images/hero-card-complete.jpeg"
                  />
                  <div className="truncate">
                    <h6 className="truncate font-semibold">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h6>
                    <h6 className="truncate text-sm font-semibold text-gray-600">
                      Year {selectedUser.year_level}
                    </h6>
                    <h6 className="truncate text-xs">{selectedUser.email}</h6>
                    <h6 className="truncate text-xs font-mono">
                      {selectedUser.school_id_number}
                    </h6>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  className={`${selectedUser.status !== "pending" && "hidden"}`}
                  onClick={() =>
                    handleUserStatusUpdateAndAccountCreation(
                      selectedUser.id,
                      "rejected"
                    )
                  }
                >
                  Reject User
                </Button>
                <Button
                  color="primary"
                  className={`${
                    selectedUser.status !== "approved" && "hidden"
                  }`}
                  onClick={() =>
                    handleUserStatusUpdateAndAccountCreation(
                      selectedUser.id,
                      "suspended"
                    )
                  }
                >
                  Suspend User
                </Button>

                <Button
                  color="primary"
                  className={`${selectedUser.status !== "pending" && "hidden"}`}
                  onClick={() =>
                    handleUserStatusUpdateAndAccountCreation(
                      selectedUser.id,
                      "approved"
                    )
                  }
                >
                  Approve User
                </Button>
                <Button
                  color="primary"
                  className={`${
                    selectedUser.status !== "suspended" && "hidden"
                  }`}
                  onClick={() =>
                    handleUserStatusUpdateAndAccountCreation(
                      selectedUser.id,
                      "reapproved"
                    )
                  }
                >
                  Unsuspend User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {isSigningOut ? (
        <div className="box justify-center">
          <div>Signing out...</div>
        </div>
      ) : (
        <div className="box h-full bg-yellow-100 flex-col">
          <header className="bg-white p-4 w-full flex items-center justify-center shadow-sm">
            <div className="w-full max-w-4xl flex justify-between items-center">
              <Link
                className="flex items-center text-2xl font-bold"
                href="/ident/admin"
              >
                <Image
                  src="/images/asscat-logo.jpeg"
                  alt="Kaitawan Tamu Logo"
                  width={45}
                  height={45}
                  className="rounded-full"
                />
                <span className="ml-2">Kaitawan Tamu</span>
              </Link>

              <div className="flex flex-col justify-end items-end">
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    radius="sm"
                    onClick={() => {
                      setIsSigningOut(true);
                      signOutAdmin();
                    }}
                  >
                    <MdOutlineLogout />
                  </Button>
                </div>
              </div>
            </div>
          </header>
          <header className="bg-white p-4 w-full flex items-center justify-center shadow-sm">
            <div className="w-full max-w-4xl flex justify-start">
              <div className="w-full md:w-auto">
                <Tabs
                  aria-label="Tab Options"
                  selectedKey={currentTab}
                  color="primary"
                  size="lg"
                  fullWidth={true}
                  variant="underlined"
                  disabledKeys={["settings"]}
                  onSelectionChange={handleSelectionChange}
                >
                  <Tab
                    key="dashboard"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxDashboard />
                        <span>Dashboard</span>
                        <Chip size="sm" variant="faded">
                          1
                        </Chip>
                      </div>
                    }
                  />
                  <Tab
                    key="products"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxBox />
                        <span>Product Listings</span>
                      </div>
                    }
                  />
                  <Tab
                    key="users"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxPerson />
                        <span>Users</span>
                      </div>
                    }
                  />
                  <Tab
                    key="settings"
                    title={
                      <div className="flex items-center space-x-2">
                        <RxGear />
                        <span>Settings</span>
                      </div>
                    }
                  />
                </Tabs>
              </div>
            </div>
          </header>
          <div className="h-full w-full p-4 flex">
            <div className="flex justify-center items-start w-full h-full">
              <div className="max-w-4xl w-full h-full flex justify-center bg-purple-200">
                {currentTab === "dashboard" && <div>Dashboard</div>}
                {currentTab === "products" && (
                  <>
                    <div className="w-full flex justify-start flex-col bg-blue-200">
                      <div className="w-full flex justify-end">
                        <Select
                          label="Filter"
                          size="sm"
                          color="default"
                          variant="underlined"
                          className="max-w-40 mb-2"
                          defaultSelectedKeys={["pending"]}
                          onChange={(e) => {
                            setProductListingFilter(e.target.value);
                          }}
                        >
                          <SelectItem key={"pending"}>Pending</SelectItem>
                          <SelectItem key={"approved"}>Approved</SelectItem>
                          <SelectItem key={"sold"}>Sold</SelectItem>
                          <SelectItem key={"rejected"}>Rejected</SelectItem>
                        </Select>
                      </div>
                      {pendingItems.length === 0 ? (
                        <div className="w-full h-[75%] flex items-center justify-center">
                          <p className="text-gray-500">No items available</p>
                        </div>
                      ) : (
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pendingItems.map((item, index) => (
                            <Card
                              key={index}
                              className="rounded-md shadow-none w-full bg-red-100"
                            >
                              <CardBody className="w-full bg-blue-100">
                                <div className="p-0 w-full flex justify-between">
                                  <div className="flex gap-2 overflow-hidden">
                                    <img
                                      alt="Card background"
                                      className="object-cover h-28 w-28 rounded-md"
                                      src="https://nextui.org/images/hero-card-complete.jpeg"
                                    />
                                    <div className="truncate">
                                      <h6 className="truncate font-semibold">
                                        {item.item_name}
                                      </h6>
                                      <h6 className="truncate text-xs">
                                        {item.item_category}
                                      </h6>
                                      <h6 className="truncate text-sm">
                                        {item.item_condition}
                                      </h6>
                                      <h6 className="truncate font-mono text-lg font-semibold mt-2">
                                        PHP{item.item_price}
                                      </h6>

                                      <div className="flex gap-1">
                                        <Avatar
                                          src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                          className="w-4 h-4 text-xs"
                                        />
                                        <h6 className="text-xs truncate">
                                          {item.seller_first_name}{" "}
                                          {item.seller_last_name}
                                        </h6>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      color="success"
                                      onPress={() => {
                                        setSelectedItem(item);
                                        setOpenSpecificItemModal(true);
                                      }}
                                    >
                                      Open
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="primary"
                                      className={`${
                                        item.item_status !== "pending" &&
                                        "hidden"
                                      }`}
                                      onClick={() =>
                                        handleItemStatusUpdate(
                                          item.item_id,
                                          "approved"
                                        )
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="danger"
                                      className={`${
                                        item.item_status !== "pending" &&
                                        "hidden"
                                      }`}
                                      onClick={() =>
                                        handleItemStatusUpdate(
                                          item.item_id,
                                          "rejected"
                                        )
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {currentTab === "users" && (
                  <>
                    <div className="w-full flex justify-start flex-col bg-blue-200">
                      <div className="w-full flex justify-end">
                        <Select
                          label="Status Filter"
                          size="sm"
                          color="default"
                          variant="underlined"
                          className="max-w-40 mb-2"
                          defaultSelectedKeys={["pending"]}
                          onChange={(e) => {
                            setUserStatusFilter(e.target.value);
                          }}
                        >
                          <SelectItem key={"pending"}>Pending</SelectItem>
                          <SelectItem key={"approved"}>Approved</SelectItem>
                          <SelectItem key={"rejected"}>Rejected</SelectItem>
                          <SelectItem key={"suspended"}>Suspended</SelectItem>
                        </Select>
                      </div>
                      {pendingUsers.length === 0 ? (
                        <div className="w-full h-[75%] flex items-center justify-center">
                          <p className="text-gray-500">No users available</p>
                        </div>
                      ) : (
                        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                          {pendingUsers.map((user, index) => (
                            <Card
                              key={index}
                              className="rounded-md shadow-none w-full bg-red-100"
                            >
                              <CardBody className="w-full bg-blue-100">
                                <div className="p-0 w-full flex justify-between">
                                  <div className="flex gap-2 overflow-hidden">
                                    <img
                                      alt="Card background"
                                      className="object-cover h-28 w-28 rounded-md"
                                      src="https://nextui.org/images/hero-card-complete.jpeg"
                                    />
                                    <div className="truncate">
                                      <h6 className="truncate font-semibold">
                                        {user.first_name} {user.last_name}
                                      </h6>
                                      <h6 className="truncate text-sm font-semibold text-gray-600">
                                        Year {user.year_level}
                                      </h6>
                                      <h6 className="truncate text-xs">
                                        {user.email}
                                      </h6>
                                      <h6 className="truncate text-xs font-mono">
                                        {user.school_id_number}
                                      </h6>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        color="success"
                                        onPress={() => {
                                          setSelectedUser(user);
                                          setOpenSpecificUserModal(true);
                                        }}
                                      >
                                        Open
                                      </Button>
                                    </div>
                                  </div>
                                  {/* <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      color="success"
                                      onPress={() => {
                                        setSelectedItem(user);
                                        setOpenSpecificItemModal(true);
                                      }}
                                    >
                                      Open
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="primary"
                                      className={`${
                                        user.status !== "pending" &&
                                        "hidden"
                                      }`}
                                      onClick={() =>
                                        handleItemStatusUpdate(
                                          user.item_id,
                                          "approved"
                                        )
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="danger"
                                      className={`${
                                        item.item_status !== "pending" &&
                                        "hidden"
                                      }`}
                                      onClick={() =>
                                        handleItemStatusUpdate(
                                          item.item_id,
                                          "rejected"
                                        )
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </div> */}
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {currentTab === "settings" && <div>Settings</div>}
              </div>
            </div>
          </div>
          <div>
            {currentTab === "products" && (
              <Pagination
                isCompact
                size="sm"
                showControls
                total={10}
                initialPage={1}
              />
            )}
          </div>
          <footer className="w-full mt-5 bg-green-100 text-center text-xs py-2">
            All rights reserved to Kaitawan Tamu ({new Date().getFullYear()})
          </footer>
        </div>
      )}
    </>
  );
};

export default AdminDashboardComponent;
