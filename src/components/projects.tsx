import React, { useState, useEffect, useCallback } from "react";
import { makeRequest } from "@/functions/api/makeRequest";
import Sidebar from "./sidebar";
import debounce from "lodash.debounce";
import { Plus, Users, Server, Calendar } from "lucide-react";

const borderColors = [
  "border-pink-500",
  "border-purple-500",
  "border-indigo-500",
  "border-blue-500",
  "border-cyan-500",
  "border-teal-500",
];

interface Project {
  _id: string;
  uniqueId: string; // Use uniqueId to match the backend
  name: string;
  description: string;
  users: string[];
  vps: string[];
  createdAt?: string;
}

interface ProjectProps {
  userData: {
    data: {
      admin: string;
      unid: string; // Assuming userData contains the current user's ID
      email: string; // Added email field
    };
  };
  session: any;
}

function isProject(data: any): data is Project {
  return (
    typeof data === "object" &&
    typeof data._id === "string" &&
    typeof data.uniqueId === "string" && // Check for uniqueId
    typeof data.name === "string" &&
    typeof data.description === "string" &&
    Array.isArray(data.users) &&
    Array.isArray(data.vps)
  );
}

export default function ProjectManagement({ userData, session }: ProjectProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    email: userData.data.email, // Ensure the email field is initialized correctly
  });

  const checkMobile = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200),
    [],
  );

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await makeRequest("GET", "/api/uvapi/projects/list");
        if (response?.status === 200) {
          const data = response.data;
          if (Array.isArray(data)) {
            const userProjects: Project[] = data.filter(
              (project) =>
                isProject(project) &&
                project.users.includes(userData.data.unid),
            );
            setProjects(userProjects);
          } else {
            console.error("Invalid data format");
          }
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [userData.data.unid]);

  const handleCreateProject = async () => {
    try {
      const response = await makeRequest(
        "POST",
        "/api/uvapi/projects/create",
        newProject,
      );
      if (response?.status === 200) {
        const data = response.data;
        if (isProject(data) && data.users.includes(userData.data.unid)) {
          setProjects([...projects, data]);
          setNewProject({
            name: "",
            description: "",
            email: userData.data.email,
          });
          setShowForm(false);
        } else {
          console.error(
            "Invalid project data or project not assigned to current user",
          );
        }
      } else {
        console.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleRemoveProject = async (uniqueId: string) => {
    try {
      const response = await makeRequest("POST", "/api/uvapi/projects/delete", {
        projectId: uniqueId,
      });
      if (response?.status === 200) {
        setProjects(
          projects.filter((project) => project.uniqueId !== uniqueId),
        );
      } else {
        console.error("Failed to remove project");
      }
    } catch (error) {
      console.error("Error removing project:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}



      />

      <main className={`flex-1 p-6 md:p-10 ${isMobile ? "pt-20" : ""}`}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-300">
            My Projects
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
          >
            <Plus className="mr-2" />
            {showForm ? "Cancel" : "Create New Project"}
          </button>
        </header>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-teal-500">
            <h3 className="text-xl font-semibold mb-4 text-teal-300">
              New Project
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
              >
                Create Project
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[index % borderColors.length]}`}
            >
              <h3 className="text-xl font-semibold mb-4 text-pink-300">
                {project.name}
              </h3>
              <p className="text-gray-300 mb-4">{project.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <Users className="mr-2" size={16} /> Users
                  </span>
                  <span className="text-green-400">{project.users.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center">
                    <Server className="mr-2" size={16} /> VPS
                  </span>
                  <span className="text-blue-400">{project.vps.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Unique ID</span>{" "}
                  {/* Change to "Unique ID" */}
                  <span className="text-yellow-400">
                    {project.uniqueId}
                  </span>{" "}
                  {/* Update to use uniqueId */}
                </div>
                {project.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 flex items-center">
                      <Calendar className="mr-2" size={16} /> Created
                    </span>
                    <span className="text-purple-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveProject(project.uniqueId)} // Update to use uniqueId
                className="mt-4 py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Remove Project
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
