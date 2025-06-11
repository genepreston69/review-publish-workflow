
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Users, FileText, Eye, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { UserRole } from '@/types/user';

interface Analytics {
  totalUsers: number;
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  reviewContent: number;
  usersByRole: {
    'read-only': number;
    'edit': number;
    'publish': number;
    'super-admin': number;
  };
  contentThisMonth: number;
  publishedThisMonth: number;
}

export const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);

      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get content statistics
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('status, created_at, published_at');

      if (contentError) throw contentError;

      // Get users by role from profiles table
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role');

      if (roleError) throw roleError;

      // Calculate analytics
      const totalContent = contentData.length;
      const publishedContent = contentData.filter(c => c.status === 'published').length;
      const draftContent = contentData.filter(c => c.status === 'draft').length;
      const reviewContent = contentData.filter(c => c.status === 'under-review').length;

      const usersByRole = roleData.reduce((acc, user) => {
        const role = user.role as UserRole;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, { 'read-only': 0, 'edit': 0, 'publish': 0, 'super-admin': 0 });

      // Calculate this month's statistics
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const contentThisMonth = contentData.filter(c => 
        new Date(c.created_at) >= thisMonth
      ).length;

      const publishedThisMonth = contentData.filter(c => 
        c.published_at && new Date(c.published_at) >= thisMonth
      ).length;

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalContent,
        publishedContent,
        draftContent,
        reviewContent,
        usersByRole,
        contentThisMonth,
        publishedThisMonth
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !analytics) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            System Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalUsers}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Total Content</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{analytics.totalContent}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">Published</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{analytics.publishedContent}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">In Review</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{analytics.reviewContent}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Read Only</span>
                <span className="font-bold">{analytics.usersByRole['read-only']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Editors</span>
                <span className="font-bold">{analytics.usersByRole['edit']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Publishers</span>
                <span className="font-bold">{analytics.usersByRole['publish']}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Super Admins</span>
                <span className="font-bold">{analytics.usersByRole['super-admin']}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Draft</span>
                <span className="font-bold">{analytics.draftContent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Under Review</span>
                <span className="font-bold">{analytics.reviewContent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Published</span>
                <span className="font-bold">{analytics.publishedContent}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>This Month's Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-600">Content Created</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{analytics.contentThisMonth}</p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">Content Published</span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{analytics.publishedThisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
