
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ReadOnlyDashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ReadOnlyDashboardHeader = ({ searchTerm, onSearchChange }: ReadOnlyDashboardHeaderProps) => {
  return (
    <>
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access published policies, procedures, and content. Stay informed with the latest updates and guidelines.
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search content and policies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </>
  );
};
