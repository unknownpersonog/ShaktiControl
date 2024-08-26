import { RefreshCw } from "lucide-react";

export default function LoadingComponent() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <RefreshCw className="animate-spin h-8 w-8 text-purple-500" />
    </div>
  );
}