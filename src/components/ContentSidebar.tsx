
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useContentManagement } from '@/hooks/useContentManagement';
import { useToast } from '@/hooks/use-toast';
import { Content } from '@/types/content';
import { Trash2, Edit, Eye, EyeOff, Save, X, FileText, Plus, CheckCircle, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { stripColorsFromHtml } from '@/utils/colorUtils';

export const ContentSidebar = () => {
  const { currentUser, userRole } = useAuth();
  const { contents, isLoading, fetchContents, handlePublish } = useContentManagement(currentUser, userRole);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [newContent, setNewContent] = useState({ title: '', body: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [previewContent, setPreviewContent] = useState<Content | null>(null);
  const { toast } = useToast();

  // Filter contents based on user role
  const getFilteredContents = () => {
    if (!userRole) return [];
    
    switch (userRole) {
      case 'readonly':
        return contents.filter(content => content.status === 'published');
      case 'edit':
        return contents.filter(content => 
          content.authorId === currentUser?.id || content.status === 'published'
        );
      case 'publish':
      case 'admin':
        return contents;
      default:
        return contents.filter(content => content.status === 'published');
    }
  };

  const filteredContents = getFilteredContents();

  const handleCreateContent = async () => {
    if (!newContent.title.trim() || !newContent.body.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in both title and content.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('content')
        .insert({
          title: newContent.title,
          body: newContent.body,
          status: 'draft',
          author_id: currentUser?.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content created successfully.",
      });

      setNewContent({ title: '', body: '' });
      setIsCreating(false);
      fetchContents();
    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create content.",
      });
    }
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;

    try {
      const { error } = await supabase
        .from('content')
        .update({
          title: editingContent.title,
          body: editingContent.body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingContent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully.",
      });

      setEditingContent(null);
      fetchContents();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content.",
      });
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully.",
      });

      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete content.",
      });
    }
  };

  const canEdit = userRole === 'edit' || userRole === 'publish' || userRole === 'admin';
  const canPublish = userRole === 'publish' || userRole === 'admin';
  const canDelete = userRole === 'admin';

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        {canEdit && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        )}
      </div>

      {/* Create New Content Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Content title..."
              value={newContent.title}
              onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <Textarea
              placeholder="Write your content here..."
              value={newContent.body}
              onChange={(e) => setNewContent({ ...newContent, body: e.target.value })}
              className="min-h-[200px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateContent}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {filteredContents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-500">
                {userRole === 'readonly' 
                  ? "No published content is available yet."
                  : "Start by creating some content."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContents.map((content) => (
            <Card key={content.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingContent?.id === content.id ? (
                      <input
                        type="text"
                        value={editingContent.title}
                        onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                        className="text-xl font-semibold w-full p-1 border border-gray-300 rounded"
                      />
                    ) : (
                      <CardTitle className="text-xl">{content.title}</CardTitle>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={
                        content.status === 'published' ? 'default' :
                        content.status === 'under-review' ? 'secondary' : 'outline'
                      }>
                        {content.status === 'published' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {content.status === 'under-review' && <Clock className="w-3 h-3 mr-1" />}
                        {content.status}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {content.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {previewContent?.id === content.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewContent(null)}
                      >
                        <EyeOff className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewContent(content)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canEdit && (content.authorId === currentUser?.id || userRole === 'admin') && (
                      <>
                        {editingContent?.id === content.id ? (
                          <>
                            <Button size="sm" onClick={handleUpdateContent}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingContent(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingContent(content)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                    
                    {canPublish && content.status !== 'published' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(content)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    
                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {(previewContent?.id === content.id || editingContent?.id === content.id) && (
                <CardContent>
                  {editingContent?.id === content.id ? (
                    <Textarea
                      value={editingContent.body}
                      onChange={(e) => setEditingContent({ ...editingContent, body: e.target.value })}
                      className="min-h-[200px]"
                    />
                  ) : (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: content.body }}
                    />
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
