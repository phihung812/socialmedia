import { defineStore } from 'pinia';

export interface Comment {
  _id: string;
  postId: string;
  userId: string;
  content: string;
  likeCount: number;
  parentId?: string | null;
  createdAt: string;
  liked?: boolean;
  replies?: Comment[];
  replyCount: number;
  author:{
    _id: string,
    username: string,
    fullName: string,
    avatar:{
      avatar_url: string,
      avatar_public_id: string,
    }
  }
}

export const useCommentStore = defineStore('comment', {
  state: () => ({
    commentMap: {} as Record<
      string,
      {
        comments: Comment[];
        page: number;
        hasMore: boolean;
        loading: boolean;
      }
    >,
  }),

  actions: {
    setComments(postId: string, comments: Comment[], page = 1, hasMore = true) {
      this.commentMap[postId] = {
        comments,
        page,
        hasMore,
        loading: false,
      };
    },

    addComment(postId: string, comment: Comment) {
      console.log(comment);
      
      if (!this.commentMap[postId]) {
        this.commentMap[postId] = {
          comments: [],
          page: 1,
          hasMore: true,
          loading: false,
        };
      }
      this.commentMap[postId].comments.unshift(comment);
    },

    updateComment(
      postId: string,
      commentId: string,
      updatedFields: Partial<Comment>
    ) {

      const postComments = this.commentMap[postId];
      if (!postComments) return;

      const updateInList = (comments: Comment[]) => {
        for (const comment of comments) {
          if (comment._id === commentId) {
            Object.assign(comment, updatedFields);
            console.log('✅ Updated comment:', comment);
            return true;
          }

          if (comment.replies && comment.replies.length > 0) {
            const found = updateInList(comment.replies);
            if (found) return true;
          }
        }
        return false;
      };

      updateInList(postComments.comments);
    },

    appendComments(postId: string, newComments: Comment[], hasMore: boolean) {
      if (!this.commentMap[postId]) return;
      this.commentMap[postId].comments.push(...newComments);
      this.commentMap[postId].page += 1;
      this.commentMap[postId].hasMore = hasMore;
    },

    setLoading(postId: string, value: boolean) {
      if (!this.commentMap[postId]) return;
      this.commentMap[postId].loading = value;
    },

    resetComments(postId: string) {
      this.commentMap[postId] = {
        comments: [],
        page: 1,
        hasMore: true,
        loading: false,
      };
    },

    deleteComment(postId: string, commentId: string): boolean {      
      const postComments = this.commentMap[postId];
      if (!postComments?.comments) return false;

      const deleteFromList = (comments: Comment[]): boolean => {
        for (let i = 0; i < comments.length; i++) {
          const comment = comments[i];

          if (comment._id === commentId) {
            comments.splice(i, 1);
            return true;
          }

          if (comment.replies?.length && deleteFromList(comment.replies)) {
            return true;
          }
        }
        return false;
      };

      return deleteFromList(postComments.comments);
    },
  },
  persist: true,
});
