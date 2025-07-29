import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value?: string | number;
  children?: React.ReactNode;
}

export default function StatsCard({ icon: Icon, iconColor, title, value, children }: StatsCardProps) {
  return (
    <div className="bg-gray-600/10 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      {value && <p className="text-2xl font-bold text-white">{value}</p>}
      {children}
    </div>
  );
}
