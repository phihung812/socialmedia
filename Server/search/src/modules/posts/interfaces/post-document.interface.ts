export interface PostDocument {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  createdAt: Date;
  updatedAt?: Date;
  likeCount: number;
  commentCount: number;
  location?: {
    lat: number;
    lon: number;
  };
}
