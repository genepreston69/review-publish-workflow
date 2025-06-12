
import { supabase } from '@/integrations/supabase/client';

export interface UserMigrationData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export const exportUsersForMigration = async (): Promise<UserMigrationData[]> => {
  try {
    // Get all user profiles with their roles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        created_at,
        user_roles!inner(role)
      `);

    if (profilesError) {
      throw profilesError;
    }

    // Transform the data for export
    const migrationData: UserMigrationData[] = profiles.map(profile => ({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: (profile.user_roles as any[])[0]?.role || 'read-only',
      created_at: profile.created_at,
    }));

    return migrationData;
  } catch (error) {
    console.error('Error exporting users for migration:', error);
    throw error;
  }
};

export const downloadUserMigrationData = async () => {
  try {
    const users = await exportUsersForMigration();
    
    const csvContent = [
      'ID,Email,Name,Role,Created At',
      ...users.map(user => 
        `${user.id},"${user.email}","${user.name}",${user.role},${user.created_at}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-migration-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading migration data:', error);
    throw error;
  }
};
