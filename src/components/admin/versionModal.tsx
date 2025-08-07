import React from "react";
import { X, Mail } from "lucide-react";
import pack from "@/../package.json";
interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-black border border-gray-600 rounded-lg w-full max-w-2xl mx-4 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="order-2 sm:order-1 border-t border-gray-600 sm:border-t-0 sm:border-r sm:border-r-gray-600 flex flex-col items-center justify-center p-4">
            <div className="rounded-xl flex items-center justify-center shadow-lg mb-3">
              <img
                src="/shaktictrl_transparent.png"
                alt="ShaktiCtrl Logo"
                className="w-32 h-32 object-contain rounded-lg"
              />
            </div>
            <p className="text-white text-sm font-medium text-center">
              ShaktiCtrl
            </p>
          </div>

          <div className="flex-1 flex flex-col order-1 sm:order-2">
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Version Information
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-gray-500 rounded p-3 text-center">
                    <p className="text-gray-300 text-xs mb-1">Version</p>
                    <p className="text-blue-300 font-mono text-sm">
                      v{pack.version}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-gray-500 rounded p-3 text-center">
                    <p className="text-gray-300 text-xs mb-1">API</p>
                    <p className="text-blue-300 font-mono text-sm">YogAPI</p>
                  </div>
                  <div className="bg-white/5 border border-gray-500 rounded p-3 text-center">
                    <p className="text-gray-300 text-xs mb-1">Github</p>
                    <a
                      href="https://github.com/unknownpersonog/ShaktiControl"
                      className="text-blue-300 text-xs hover:underline"
                    >
                      ShaktiControl
                    </a>
                  </div>
                </div>

                <div className="bg-white/5 border border-gray-500 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="text-white" size={16} />
                      <span className="text-white text-sm">Support</span>
                    </div>
                    <a
                      href="mailto:admin@unknownvps.eu.org"
                      className="text-orange-300 text-xs hover:underline"
                    >
                      admin@unknownvps.eu.org
                    </a>
                  </div>
                </div>

                <div className="bg-white/5 border border-gray-500 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="rounded-full flex items-center justify-center">
                        <img
                          className="w-16 h-16"
                          src="/unknownvps_transparent.png"
                          alt="UnknownVPS"
                        />
                      </div>
                    </div>
                    <span className="text-sm">
                      A <span className="text-orange-300">UnknownVPS</span>{" "}
                      Product
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionModal;
