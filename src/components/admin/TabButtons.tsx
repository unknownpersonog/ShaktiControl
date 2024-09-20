const TabButtons = ({ activeTab, setActiveTab }: any) => (
    <div className="mb-4 flex justify-center space-x-4">
      {['user', 'vps', 'os'].map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 rounded-lg ${activeTab === tab ? 'bg-purple-500' : 'bg-gray-700'} text-white`}
          onClick={() => setActiveTab(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)} Management
        </button>
      ))}
    </div>
  );
  
  export default TabButtons;
  