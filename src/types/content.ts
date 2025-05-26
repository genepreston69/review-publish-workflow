
export type ContentStatus = 'draft' | 'under-review' | 'published';

export interface Content {
  id: string;
  title: string;
  body: string;
  status: ContentStatus;
  authorId: string;
  assignedPublisherId?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}
