/** Plain, serializable shapes passed from server to client components. */

export type UserSummary = {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
};

export type PostDTO = {
  id: string;
  content: string | null;
  image: string | null;
  createdAt: string;
  edited: boolean;
  author: UserSummary;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
};

export type CommentDTO = {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  author: UserSummary;
  canDelete: boolean;
};

export type Page<T> = { items: T[]; nextCursor: string | null };

export type SuggestedUser = UserSummary & { bio: string | null; followerCount: number };

export type ProfileDTO = {
  id: string;
  name: string | null;
  username: string;
  bio: string | null;
  image: string | null;
  coverImage: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
  isMe: boolean;
  isFollowing: boolean;
  followsMe: boolean;
};

export type NotificationDTO = {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  read: boolean;
  createdAt: string;
  creator: UserSummary;
  post: { id: string; content: string | null; image: string | null } | null;
  comment: { id: string; content: string } | null;
};

export type ProfileTab = "posts" | "media" | "likes";
