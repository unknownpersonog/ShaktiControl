const TabButtons = ({ activeTab, setActiveTab }: any) => (
  <div className="mb-6 flex justify-center">
    <div className="inline-flex bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700/50">
      {["Users", "VPS", "Services", "Notifications"].map((tab) => (
        <button
          key={tab}
          className={`
            relative px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out
            ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-lg shadow-white/10 transform scale-105 z-20"
                : "text-gray-300 hover:text-white hover:bg-gray-700/50 z-10"
            }
          `}
          onClick={() => setActiveTab(tab)}
        >
          <span className="relative z-10">
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </span>
        </button>
      ))}
    </div>
  </div>
);

export default TabButtons;
