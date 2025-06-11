
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Content } from '@/types/content';
import { FileText, Eye, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ContentWithAuthor extends Content {
  author_name: string;
}

export const ContentModeration = () => {
  const [contents, setContents] = useState<ContentWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentWithAuthor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          profiles!content_author_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContent: ContentWithAuthor[] = data.map(item => ({
        id: item.id,
        title: item.title,
        body: item.body,
        status: item.status as 'draft' | 'under-review' | 'published',
        authorId: item.author_id,
        assignedPublisherId: item.assigned_publisher_id || undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        publishedAt: item.published_at ? new Date(item.published_at) : undefined,
        author_name: item.profiles?.name || 'Unknown User'
      }));

      setContents(formattedContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load content.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateContentStatus = async (contentId: string, newStatus: 'draft' | 'under-review' | 'published') => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('content')
        .update(updateData)
        .eq('id', contentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Content ${newStatus === 'published' ? 'published' : 'status updated'} successfully.`,
      });

      fetchContent();
    } catch (error) {
      console.error('Error updating content status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content status.",
      });
    }
  };

  const updateContent = async () => {
    if (!selectedContent) return;

    try {
      const { error } = await supabase
        .from('content')
        .update({
          title: editTitle,
          body: editBody,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully.",
      });

      setIsEditDialogOpen(false);
      fetchContent();
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update content.",
      });
    }
  };

  const deleteContent = async (contentId: string) => {
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

      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete content.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'under-review':
        return <Badge className="bg-orange-100 text-orange-800">Under Review</Badge>;
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openViewDialog = (content: ContentWithAuthor) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (content: ContentWithAuthor) => {
    setSelectedContent(content);
    setEditTitle(content.title);
    setEditBody(content.body);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Content Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {content.title}
                  </TableCell>
                  <TableCell>{content.author_name}</TableCell>
                  <TableCell>{getStatusBadge(content.status)}</TableCell>
                  <TableCell>
                    {content.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(content)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(content)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {content.status === 'under-review' && (
                        <Button
                          size="sm"
                          onClick={() => updateContentStatus(content.id, 'published')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {content.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateContentStatus(content.id, 'under-review')}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteContent(content.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {contents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No content found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Content Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>View Content</DialogTitle>
            </DialogHeader>
            {selectedContent && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedContent.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {selectedContent.author_name} • {getStatusBadge(selectedContent.status)}
                  </p>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedContent.body}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Content Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Content title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder="Content body"
                  className="min-h-32"
                />
              </div>
              <Button onClick={updateContent} className="w-full">
                Update Content
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
