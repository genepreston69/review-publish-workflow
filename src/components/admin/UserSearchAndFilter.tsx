
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { UserRole } from '@/types/user';

interface UserSearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilterRole: (role: UserRole | 'all') => void;
  onFilterStatus: (status: string) => void;
  onClearFilters: () => void;
}

export const UserSearchAndFilter = ({ 
  onSearch, 
  onFilterRole, 
  onFilterStatus, 
  onClearFilters 
}: UserSearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleRoleChange = (role: UserRole | 'all') => {
    setSelectedRole(role);
    onFilterRole(role);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterStatus(status);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStatus('all');
    onClearFilters();
  };

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <div className="relative flex-1 min-w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-40">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="read-only">Read Only</SelectItem>
          <SelectItem value="edit">Editor</SelectItem>
          <SelectItem value="publish">Publisher</SelectItem>
          <SelectItem value="super-admin">Super Admin</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="invited">Invited</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleClearFilters}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
