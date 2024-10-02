"use client";

import useTotalItems from "@/hooks/useTotalItems";
import useTotalUsers from "@/hooks/useTotalUsers";
import { supabaseAdmin } from "@/utils/supabase";
import { Button, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import {
  MdEdit,
  MdGroups,
  MdOutlineSell,
  MdOutlineShoppingCart,
} from "react-icons/md";
import { RiAuctionLine } from "react-icons/ri";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchAcademicYear, updateAcademicYear } from "@/app/api/academicYearU";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboardComponent = () => {
  const { totalMembers } = useTotalUsers();
  const { totalBidItems, totalSellItems, totalSoldItems } = useTotalItems();

  const [isUpdating, setIsUpdating] = useState(false);
  const [startingYear, setStartingYear] = useState<number | null>(null);
  const [endingYear, setEndingYear] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  useEffect(() => {
    const getAcademicYear = async () => {
      const academicYear = await fetchAcademicYear();
      if (academicYear) {
        setStartingYear(academicYear.starting_year);
        setEndingYear(academicYear.ending_year);
        setAcademicYearId(academicYear.id);
      }
    };

    getAcademicYear();
  }, []);

  const handleUpdate = async () => {
    if (
      academicYearId !== null &&
      startingYear !== null &&
      endingYear !== null
    ) {
      const response = await updateAcademicYear(
        startingYear,
        endingYear,
        academicYearId
      );
      if (response) {
        setIsUpdating(false);
      }
    }
  };

  const firstPieData = {
    labels: ["Bid Items", "Sell Items"],
    datasets: [
      {
        data: [totalBidItems, totalSellItems],
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        borderWidth: 1,
      },
    ],
  };

  const secondPieData = {
    labels: ["Unsold Items", "Sold Items"],
    datasets: [
      {
        data: [totalBidItems + totalSellItems, totalSoldItems],
        backgroundColor: ["#FFCE56", "#FF6384"],
        hoverBackgroundColor: ["#FFCE56", "#FF6384"],
      },
    ],
  };

  return (
    <>
      <div className="w-full h-full flex justify-start flex-col overflow-y-auto">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="col-span-2 md:col-span-4 mb-5">
            <div className="flex justify-end items-center gap-3">
              <h1 className="hidden md:block">Academic Year:</h1>
              <h1 className="md:hidden">A.Y.:</h1>
              <Input
                type="number"
                color="success"
                className="lg:w-1/12"
                value={
                  startingYear !== null && startingYear !== undefined
                    ? startingYear.toString()
                    : ""
                }
                readOnly={!isUpdating}
                onChange={(e) => setStartingYear(parseInt(e.target.value, 10))}
              />
              -
              <Input
                type="number"
                color="success"
                className="lg:w-1/12"
                value={
                  endingYear !== null && endingYear !== undefined
                    ? endingYear.toString()
                    : ""
                }
                readOnly={!isUpdating}
                onChange={(e) => setEndingYear(parseInt(e.target.value, 10))}
              />
              <Button
                color="success"
                className="text-white"
                startContent={isUpdating ? null : <MdEdit />}
                onClick={() => {
                  if (isUpdating) {
                    handleUpdate();
                  } else {
                    setIsUpdating(true);
                  }
                }}
              >
                {isUpdating ? "Save" : "Update"}
              </Button>
            </div>
          </div>
          <CardStats
            title="Total Users"
            subtitle="Total number of users"
            value={totalMembers.toString()}
            icon={<MdGroups size={30} />}
          />
          <CardStats
            title="Total Items Sold"
            subtitle="Total number of items sold"
            value={totalSoldItems.toString()}
            icon={<MdOutlineShoppingCart size={30} />}
          />
          <CardStats
            title="Total Auction Items"
            subtitle="Total number of auction items"
            value={totalBidItems.toString()}
            icon={<RiAuctionLine size={30} />}
          />
          <CardStats
            title="Total Items for Sale"
            subtitle="Total number of items for sale"
            value={totalSellItems.toString()}
            icon={<MdOutlineSell size={30} />}
          />
          <div className="w-full h-[20rem] p-4 py-5 md:col-span-2 flex flex-col items-center justify-center bg-white shadow-lg rounded-xl">
            {secondPieData.datasets[0].data[0] === 0 &&
            secondPieData.datasets[0].data[1] === 0 ? (
              <h1>No data available</h1>
            ) : (
              <Pie data={secondPieData} />
            )}
          </div>
          <div className="w-full h-[20rem] p-4 py-5 md:col-span-2 flex flex-col items-center justify-center bg-white shadow-lg rounded-xl">
            {firstPieData.datasets[0].data[0] === 0 &&
            firstPieData.datasets[0].data[1] === 0 ? (
              <h1>No data available</h1>
            ) : (
              <Pie data={firstPieData} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardComponent;

interface CardStatsProps {
  title: string;
  subtitle: string;
  value: string;
  icon: React.ReactNode;
}

const CardStats: React.FC<CardStatsProps> = ({
  title,
  subtitle,
  value,
  icon,
}) => {
  return (
    <div className="bg-white shadow-lg flex justify-between rounded-xl p-3 md:px-6 relative">
      <div className="w-full h-full">
        <h2 className="text-3xl md:text-5xl font-bold text-[#007057]">
          {value}
        </h2>
        <h3 className="text-lg md:text-2xl font-semibold text-[#007057]">
          {title}
        </h3>
        <h4 className="text-md text-slate-400">{subtitle}</h4>
      </div>
      <div className="absolute top-3 right-3 text-[#007057]">{icon}</div>
    </div>
  );
};
