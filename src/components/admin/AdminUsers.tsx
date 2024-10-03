"use client";

import {
  SelectItem,
  Select,
  Button,
  Card,
  CardBody,
  Pagination,
} from "@nextui-org/react";
import useUsers from "@/hooks/useUsers";
import React from "react";
import { useState } from "react";
import { supabaseAdmin } from "@/utils/supabase";

const AdminUserComponent = () => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;

  const [userStatusFilter, setUserStatusFilter] = useState("pending");

  const { usersData, loadingUsers, totalUsers, errorUsers, fetchUsers } =
    useUsers(rowsPerPage, page, userStatusFilter);

  const totalPages = Math.ceil(totalUsers / rowsPerPage);

  const handleUserStatusUpdate = async (
    userID: string,
    newStatus: string,
    selectedUser: any
  ) => {
    const action =
      newStatus === "approved" || newStatus === "reapproved"
        ? "active"
        : newStatus;

    try {
      const { data: user, error } =
        await supabaseAdmin.auth.admin.updateUserById(userID, {
          user_metadata: { account_status: action },
        });

      if (error) throw error;

      if (action === "active" && user) {
        const emailData = {
          email: selectedUser.email,
          recipient_name: `${selectedUser.first_name} ${selectedUser.last_name}`,
          subject: "Account Approved",
          message: `
Greetings!

We are pleased to inform you that your account associated with the email ${selectedUser.email} has been approved. You can now sign in and access your account.

Thank you!

Best regards,
Kaitawan Tamu Team`,
        };

        try {
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData),
          });

          const data = await response.json();

          if (response.ok) {
            console.log("Email sent successfully!");
          } else {
            console.log(
              `Failed to send email: ${data?.error || "Unknown error"}`
            );
          }
        } catch (error) {
          console.error("Error sending email:", error);
        }
      }

      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }

    // setSelectedUser(null);
  };

  // if (loadingUsers) {
  //   return (
  //     <div className="h-full w-full flex justify-center items-center">
  //       Loading...
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="w-full h-full flex justify-start flex-col overflow-y-auto">
        <div className="w-full flex justify-between">
          <Pagination
            isCompact
            showControls
            showShadow
            color="default"
            page={page}
            total={totalPages}
            onChange={(newPage) => setPage(newPage)}
          />
          <Select
            label="User Status Filter"
            disallowEmptySelection={true}
            size="sm"
            color="default"
            variant="underlined"
            className="max-w-40 mb-2"
            defaultSelectedKeys={["pending"]}
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
          >
            <SelectItem key="pending" value="pending">
              Pending
            </SelectItem>
            <SelectItem key="approved" value="approved">
              Approved
            </SelectItem>
            <SelectItem key="rejected" value="rejected">
              Rejected
            </SelectItem>
            <SelectItem key="suspended" value="suspended">
              Suspended
            </SelectItem>
          </Select>
        </div>
        {usersData.length === 0 ? (
          <div className="w-full h-[75%] flex items-center justify-center">
            <p className="text-gray-500">No users available</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {usersData.map((user, index) => (
              <Card key={index} className="w-full">
                <CardBody className="w-full">
                  <div className="p-0 w-full flex justify-between">
                    <div className="w-full flex gap-2 overflow-hidden">
                      <img
                        alt="Card background"
                        className="object-cover h-28 w-28 rounded-md"
                        src="https://fakeimg.pl/500x500?text=img&font=bebas"
                      />
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="w-full truncate">
                          <h6 className="truncate font-semibold">
                            {user.first_name} {user.last_name}
                          </h6>
                          <h6 className="truncate text-sm font-semibold text-gray-600">
                            Year {user.year_level}
                          </h6>
                          <h6 className="truncate text-xs">{user.email}</h6>
                          <h6 className="truncate text-xs font-mono">
                            {user.id_number}
                          </h6>
                        </div>
                        <div className="w-full flex gap-2">
                          {/* REJECTED: "pending" users
                              SUSPEND: "active" users
                              APRROVE: "pending" users & "rejected" users
                              REAPPROVE/UNSUSPEND: "suspended" users */}
                          <Button
                            color="danger"
                            size="sm"
                            className={`${
                              user.account_status !== "pending" && "hidden"
                            }`}
                            onClick={() =>
                              handleUserStatusUpdate(user.id, "rejected", user)
                            }
                          >
                            Reject User
                          </Button>
                          <Button
                            color="primary"
                            size="sm"
                            className={`${
                              user.account_status !== "active" && "hidden"
                            }`}
                            onClick={() =>
                              handleUserStatusUpdate(user.id, "suspended", user)
                            }
                          >
                            Suspend User
                          </Button>

                          <Button
                            color="primary"
                            size="sm"
                            className={`${
                              user.account_status !== "pending" &&
                              user.account_status !== "rejected" &&
                              "hidden"
                            }`}
                            onClick={() =>
                              handleUserStatusUpdate(user.id, "approved", user)
                            }
                          >
                            {user.account_status === "pending"
                              ? "Approve User"
                              : "Give a chance"}
                          </Button>
                          <Button
                            color="primary"
                            size="sm"
                            className={`${
                              user.account_status !== "suspended" && "hidden"
                            }`}
                            onClick={() =>
                              handleUserStatusUpdate(
                                user.id,
                                "reapproved",
                                user
                              )
                            }
                          >
                            Unsuspend User
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUserComponent;
