const TabButtons = ({ activeTab, setActiveTab }: any) => (
  <div className="mb-4 flex justify-center space-x-4">
    {["user", "vps", "os", "service", "notifications"].map((tab) => (
      <button
        key={tab}
        className={`px-4 py-2 rounded-lg ${activeTab === tab ? "bg-gray-300 text-gray-900" : "bg-gray-800 text-white"}`}
        onClick={() => setActiveTab(tab)}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)} Management
      </button>
    ))}
  </div>
);

export default TabButtons;
