
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentCard } from './ContentCard';
import { useAuth } from '@/hooks/useAuth';
import { Content } from '@/types/content';
import { Plus } from 'lucide-react';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Mock data for demonstration
  const [contents] = useState<Content[]>([
    {
      id: '1',
      title: 'Introduction to React Hooks',
      body: 'React Hooks are a powerful feature that allow you to use state and other React features without writing a class component. They were introduced in React 16.8 and have revolutionized the way we write React applications.',
      status: 'draft',
      authorId: '1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Advanced TypeScript Patterns',
      body: 'TypeScript provides many advanced patterns that can help you write more robust and maintainable code. In this article, we explore utility types, conditional types, and mapped types.',
      status: 'under-review',
      authorId: '1',
      assignedPublisherId: '3',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
    },
    {
      id: '3',
      title: 'Building Scalable Web Applications',
      body: 'Scalability is a crucial consideration when building web applications. This guide covers best practices for architecture, database design, and deployment strategies.',
      status: 'published',
      authorId: '2',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-08'),
      publishedAt: new Date('2024-01-08'),
    },
  ]);

  const canCreate = currentUser?.role === 'edit' || currentUser?.role === 'publish';

  const handleCreateNew = () => {
    console.log('Create new content');
  };

  const handleEdit = (content: Content) => {
    console.log('Edit content:', content.id);
  };

  const handleView = (content: Content) => {
    console.log('View content:', content.id);
  };

  const handlePublish = (content: Content) => {
    console.log('Publish content:', content.id);
  };

  const draftContents = contents.filter(c => c.status === 'draft');
  const reviewContents = contents.filter(c => c.status === 'under-review');
  const publishedContents = contents.filter(c => c.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Content Dashboard</h2>
        {canCreate && (
          <Button onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Content
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftContents.length})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({reviewContents.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedContents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEdit}
                onView={handleView}
                onPublish={handlePublish}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
