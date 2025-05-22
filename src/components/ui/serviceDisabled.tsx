// components/ServiceDisabled.tsx
import Link from "next/link";
import { Settings } from "lucide-react";

interface ServiceDisabledProps {
  serviceName: string;
  serviceKey: string;
}

export default function ServiceDisabled({ 
  serviceName,
  serviceKey 
}: ServiceDisabledProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center space-y-6">
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold bg-clip-text">
            Service Disabled
          </h2>
          <p className="text-gray-400 text-lg">
            {serviceName} is currently not enabled for your account
          </p>
        </div>

        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <dt className="text-gray-400">Service Name</dt>
              <dd className="font-medium">{serviceName}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-gray-400">Service Key</dt>
              <dd className="font-mono text-red-400">{serviceKey}</dd>
            </div>
          </dl>
        </div>

        <Link
          href={`/settings`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-500/20 hover:bg-gray-300 transition-colors text-white-400 hover:text-gray-800"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
