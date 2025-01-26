import React from "react";
import { AlertCircle, XCircle } from "lucide-react"; // Import different icons

interface AlertProps {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = "default",
}) => {
  const baseStyles = "relative w-full rounded-lg border p-4 mb-4";
  const variantStyles = {
    default:
      "border-white-200 text-gray-200 bg-blue-800 bg-opacity-30 backdrop-blur-md",
    destructive: "bg-red-100 border-red-200 text-red-900",
  };

  const iconStyles = {
    default: "text-blue-500", // Icon color for default variant
    destructive: "text-red-500", // Icon color for destructive variant
  };

  const Icon = variant === "destructive" ? XCircle : AlertCircle; // Use different icons based on variant

  return (
    <div role="alert" className={`${baseStyles} ${variantStyles[variant]}`}>
      <div className="flex items-start">
        <Icon
          className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${iconStyles[variant]}`}
        />
        <div>
          <h5 className="font-medium text-lg mb-1">{title}</h5>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
