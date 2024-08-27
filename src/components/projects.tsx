'use client';

import { useState, useEffect, useCallback } from 'react';
import { makeRequest } from '@/functions/api/makeRequest';
import Sidebar from './sidebar';
import debounce from 'lodash.debounce';
import { Plus } from 'lucide-react'; // Import the Plus icon

const borderColors = [
  'border-pink-500',
  'border-purple-500',
  'border-indigo-500',
  'border-blue-500',
  'border-cyan-500',
  'border-teal-500',
];

interface Project {
  id: string;
  name: string;
  description: string;
  users: string[];
  servers: string[];
}

interface ProjectProps {
  userData: any;
  session: any;
}

export default function ProjectManagement({ userData, session }: ProjectProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([
    { id: '1', name: 'Sample Project', description: 'This is a sample project.', users: ['User1', 'User2'], servers: ['Server1'] }
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const checkMobile = useCallback(
    debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200),
    []
  );

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await makeRequest("GET", "/api/uvapi/projects");
        if (response?.response.ok) {
          // Ensure the response data is an array and cast it to Project[]
          const data: Project[] = Array.isArray(response.data) ? response.data : [];
          setProjects(data);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    // Temporarily create a new project for testing
    const tempProject = { id: Date.now().toString(), name: newProject.name, description: newProject.description, users: [], servers: [] };
    setProjects([...projects, tempProject]);
    setNewProject({ name: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAdmin={userData.data.admin === "true"}
      />

      <main className={`flex-1 p-6 md:p-10 ${isMobile ? 'pt-20' : ''}`}>
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-300">Project Management</h1>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="py-2 px-4 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors flex items-center"
          >
            <Plus className="mr-2" />
            {showForm ? 'Cancel' : 'Create New Project'}
          </button>
        </header>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg bg-opacity-50 border backdrop-blur-md border-teal-500">
            <h3 className="text-xl font-semibold mb-4 text-teal-300">New Project</h3>
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
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
          {projects.map((project) => (
            <div key={project.id} className={`p-6 rounded-lg bg-opacity-50 border backdrop-blur-md ${borderColors[0]}`}>
              <h3 className="text-xl font-semibold mb-4 text-pink-300">{project.name}</h3>
              <p className="text-gray-300 mb-4">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Users</span>
                <span className="text-green-400">{project.users.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Servers</span>
                <span className="text-blue-400">{project.servers.length}</span>
              </div>
              <button 
                onClick={() => console.log('Open Project', project.id)} 
                className="mt-4 py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Open Project
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <p className="rounded border p-2 text-purple-300 border-purple-500 hover:bg-purple-800 transition-colors">
            ShaktiCtrl • Made In India 🚀
          </p>
        </div>
      </main>
    </div>
  );
}
