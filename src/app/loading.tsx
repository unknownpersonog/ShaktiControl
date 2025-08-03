import React from "react";
import { LoaderCircle } from "lucide-react";
const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <LoaderCircle className="animate-spin h-16 w-16 border-gray-200"></LoaderCircle>
    </div>
  );
};

export default Loading;
