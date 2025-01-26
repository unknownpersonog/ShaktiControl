import React from "react";
import { MemoryStick, Cpu, HardDrive } from "lucide-react";

// Define the type for resources, using the LucideReact icon type
interface Resource {
  name: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>; // Correct type for Lucide icons
  value: string;
}

interface ResourceCardProps {
  allocatedResources: Resource[];
}

const ResourceCard: React.FC<ResourceCardProps> = ({ allocatedResources }) => (
  <div className="p-4 md:p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-white-200">
    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-200">
      Allocated Resources
    </h3>
    <div className="space-y-4">
      {allocatedResources.map((resource, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Render the icon */}
            <resource.icon className="w-5 h-5 md:w-6 md:h-6 mr-2 text-gray-300" />
            <span className="text-gray-300">{resource.name}</span>
          </div>
          <span className="text-gray-100">{resource.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default ResourceCard;
