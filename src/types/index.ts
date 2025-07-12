export interface User {
  id: string;
  username: string;
  email: string;
  role: 'guest' | 'user' | 'admin';
  avatar: string;
  reputation: number;
  badges: Badge[];
  isExpert: boolean;
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  tags: Tag[];
  votes: number;
  views: number;
  answers: Answer[];
  acceptedAnswerId?: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Answer {
  id: string;
  content: string;
  authorId: string;
  author: User;
  questionId: string;
  votes: number;
  isAccepted: boolean;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  answerId: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  color: string;
  questionCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'answer' | 'comment' | 'vote' | 'mention' | 'admin';
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'question' | 'answer';
  type: 'up' | 'down';
}