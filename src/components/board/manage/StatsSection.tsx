import { useRouter } from 'next/navigation';
import { Layout, Activity, Zap, Database, Plus } from 'lucide-react';
import StatsCard from './StatsCard';

interface StatsSectionProps {
  totalBoards: number;
}

export default function StatsSection({ totalBoards }: StatsSectionProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard
        icon={Layout}
        iconColor="text-blue-400"
        title="Total Boards"
        value={totalBoards}
      />
      
      <StatsCard
        icon={Activity}
        iconColor="text-green-400"
        title="Status"
      >
        <p className="text-lg font-semibold text-green-400">Online</p>
      </StatsCard>
      
      <StatsCard
        icon={Zap}
        iconColor="text-yellow-400"
        title="Quick Actions"
      >
        <button
          onClick={() => router.push('/board')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </button>
      </StatsCard>
      
      <StatsCard
        icon={Database}
        iconColor="text-purple-400"
        title="Storage"
      >
        <p className="text-gray-500 text-sm">All boards saved</p>
      </StatsCard>
    </div>
  );
}
