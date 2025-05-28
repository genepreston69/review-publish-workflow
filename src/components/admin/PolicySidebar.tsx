
import { Shield, Plus, FileClock, FileCheck, FileText, BookOpen } from 'lucide-react';

interface PolicySidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isEditor: boolean;
  canPublish: boolean;
}

export function PolicySidebar({ activeTab, setActiveTab, isEditor, canPublish }: PolicySidebarProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-white z-20 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-600" />
          <span className="font-semibold text-lg">Policy Manager</span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('create-policy')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'create-policy' 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Policy
          </button>
          {isEditor && (
            <button
              onClick={() => setActiveTab('draft-policies')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'draft-policies' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FileClock className="w-4 h-4 inline mr-2" />
              Draft Policies
            </button>
          )}
          {canPublish && !isEditor && (
            <button
              onClick={() => setActiveTab('review-policies')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeTab === 'review-policies' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <FileCheck className="w-4 h-4 inline mr-2" />
              Review Policies
            </button>
          )}
          <button
            onClick={() => setActiveTab('facility-policies')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'facility-policies' 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Facility Policies
          </button>
          <button
            onClick={() => setActiveTab('policy-manuals')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'policy-manuals' 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Policy Manuals
          </button>
        </div>
      </div>
    </div>
  );
}
