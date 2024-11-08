"use client";
import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingComponent from "@/components/loading";
import {
  Sun,
  Snowflake,
  Cloud,
  Thermometer,
  Leaf,
  Umbrella,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { makeRequest } from "@/functions/api/makeRequest";

const weekdays: string[] = ["S", "M", "T", "W", "T", "F", "S"];

// Redesigned continent-based themes
const themesByContinent = {
  NorthAmerica: {
    Winter: {
      icon: Snowflake,
      color: "from-blue-500 via-blue-400 to-blue-300",
    },
    Spring: { icon: Leaf, color: "from-green-500 via-green-400 to-green-300" },
    Summer: {
      icon: Sun,
      color: "from-yellow-500 via-orange-400 to-orange-300",
    },
    Autumn: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
  },
  SouthAmerica: {
    Winter: {
      icon: Sun,
      color: "from-yellow-500 via-orange-400 to-orange-300",
    },
    Spring: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
    Summer: {
      icon: Snowflake,
      color: "from-blue-500 via-blue-400 to-blue-300",
    },
    Autumn: { icon: Leaf, color: "from-green-500 via-green-400 to-green-300" },
  },
  Europe: {
    Winter: {
      icon: Snowflake,
      color: "from-blue-600 via-blue-500 to-blue-400",
    },
    Spring: {
      icon: Umbrella,
      color: "from-indigo-500 via-blue-400 to-blue-300",
    },
    Summer: {
      icon: Sun,
      color: "from-yellow-500 via-orange-400 to-orange-300",
    },
    Autumn: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
  },
  Asia: {
    Winter: {
      icon: Snowflake,
      color: "from-indigo-700 via-blue-600 to-blue-500",
    },
    Spring: { icon: Leaf, color: "from-green-500 via-lime-400 to-green-300" },
    Summer: { icon: Sun, color: "from-yellow-500 via-amber-400 to-orange-300" },
    Autumn: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
  },
  Australia: {
    Winter: {
      icon: Sun,
      color: "from-yellow-500 via-orange-400 to-orange-300",
    },
    Spring: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
    Summer: {
      icon: Snowflake,
      color: "from-blue-500 via-blue-400 to-blue-300",
    },
    Autumn: { icon: Leaf, color: "from-green-500 via-green-400 to-green-300" },
  },
  Africa: {
    Winter: {
      icon: Sun,
      color: "from-yellow-500 via-orange-400 to-orange-300",
    },
    Spring: {
      icon: Umbrella,
      color: "from-indigo-500 via-blue-400 to-blue-300",
    },
    Summer: {
      icon: Sun,
      color: "from-yellow-400 via-orange-300 to-orange-200",
    },
    Autumn: { icon: Flame, color: "from-red-500 via-orange-400 to-orange-300" },
  },
};

const continents = Object.keys(themesByContinent) as Array<
  keyof typeof themesByContinent
>;

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [continent, setContinent] =
    useState<keyof typeof themesByContinent>("NorthAmerica");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const data = await makeRequest("GET", "/api/uvapi/users/info");
          setUserData(data);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUserData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  const getCurrentSeason = () => {
    const month = currentDate.getMonth() + 1;
    if (["NorthAmerica", "Europe", "Asia"].includes(continent)) {
      if ([12, 1, 2].includes(month)) return "Winter";
      if ([3, 4, 5].includes(month)) return "Spring";
      if ([6, 7, 8].includes(month)) return "Summer";
      return "Autumn";
    } else {
      if ([12, 1, 2].includes(month)) return "Summer";
      if ([3, 4, 5].includes(month)) return "Autumn";
      if ([6, 7, 8].includes(month)) return "Winter";
      return "Spring";
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const renderCalendarDays = () => {
    const startDate = startOfWeek(startOfMonth(currentDate));
    const endDate = endOfMonth(currentDate);
    const today = new Date();
    const rows: JSX.Element[] = [];

    let day = startDate;
    while (day <= endDate) {
      const row: JSX.Element[] = [];
      for (let i = 0; i < 7; i++) {
        const isCurrentMonth = format(day, "M") === format(currentDate, "M");
        const isToday =
          format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
        const isWeekend = i === 0 || i === 6;

        row.push(
          <td
            key={format(day, "yyyy-MM-dd")}
            className={`p-4 rounded-lg shadow-sm transition-transform transform hover:scale-105 
              ${
                isToday
                  ? "bg-gradient-to-r from-red-500 via-red-400 to-red-300 text-white font-semibold"
                  : isCurrentMonth
                    ? `text-white ${themesByContinent[continent][getCurrentSeason()].color}`
                    : "text-gray-300"
              } 
              ${isWeekend ? "text-gray-400" : ""}`}
          >
            <div className="flex flex-col items-center">
              <span
                className={`text-2xl font-medium ${!isCurrentMonth ? "text-gray-400" : "text-white"}`}
              >
                {format(day, "d")}
              </span>
            </div>
          </td>,
        );
        day = addDays(day, 1);
      }
      rows.push(<tr key={format(startOfWeek(day), "yyyy-MM-dd")}>{row}</tr>);
    }

    return rows;
  };

  if (status === "loading" || loading) {
    return <LoadingComponent />;
  }

  if (session == null || session.user == null) {
    return <p className="text-white">Internal Server Error</p>;
  }

  const monthTitle = format(currentDate, "MMMM yyyy");
  const seasonTheme = themesByContinent[continent][getCurrentSeason()];

  return (
    <div className="flex flex-1 min-h-screen text-white relative">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData?.data?.admin === "true"}
        session={session?.user}
        userData={userData}
      />

      <main
        className={`flex-1 p-4 md:p-6 ${isMobile ? "pt-20" : ""} flex justify-center`}
      >
        <div
          className={`w-full max-w-4xl rounded-lg shadow-lg bg-gray-800 bg-opacity-50 border p-6`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-gray-200">
              <Calendar size={32} className="inline-block mr-2 text-gray-400" />{" "}
              {monthTitle}
            </h2>
            <div className="flex gap-4 items-center">
              <button
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md shadow-md"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft size={24} className="text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <seasonTheme.icon size={24} className="text-gray-300" />
                <span className="text-lg font-medium text-gray-300">
                  {getCurrentSeason()}
                </span>
              </div>
              <button
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-md shadow-md"
                onClick={handleNextMonth}
              >
                <ChevronRight size={24} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Display Continent and Dropdown to Change */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-gray-200">
              Current Continent: {continent}
            </span>
            <select
              value={continent}
              onChange={(e) =>
                setContinent(e.target.value as keyof typeof themesByContinent)
              }
              className="bg-gray-700 text-gray-300 p-2 rounded-md shadow-md"
            >
              {continents.map((cont) => (
                <option key={cont} value={cont}>
                  {cont}
                </option>
              ))}
            </select>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                {weekdays.map((weekday) => (
                  <th
                    key={weekday}
                    className="text-lg font-medium p-4 text-gray-400 border-b border-gray-600"
                  >
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{renderCalendarDays()}</tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;