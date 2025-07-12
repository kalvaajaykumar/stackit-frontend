import React, { createContext, useContext, useState } from 'react';
import { Question, Answer, Tag, Notification } from '../types';

interface AppContextType {
  questions: Question[];
  tags: Tag[];
  notifications: Notification[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  voteQuestion: (questionId: string, type: 'up' | 'down') => void;
  voteAnswer: (answerId: string, type: 'up' | 'down') => void;
  acceptAnswer: (answerId: string) => void;
  deleteQuestion: (questionId: string) => void;
  markNotificationRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock data
const mockUser = {
  id: '2',
  username: 'jane_dev',
  email: 'jane@example.com',
  role: 'user' as const,
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
  reputation: 2340,
  badges: [],
  isExpert: true,
  createdAt: new Date()
};

const mockTags: Tag[] = [
  { id: '1', name: 'React', description: 'A JavaScript library for building user interfaces', color: '#61DAFB', questionCount: 1250 },
  { id: '2', name: 'JavaScript', description: 'High-level programming language', color: '#F7DF1E', questionCount: 2100 },
  { id: '3', name: 'TypeScript', description: 'Typed superset of JavaScript', color: '#3178C6', questionCount: 890 },
  { id: '4', name: 'Career', description: 'Career guidance and job searching', color: '#10B981', questionCount: 450 },
  { id: '5', name: 'Mental Health', description: 'Mental health and wellness support', color: '#F59E0B', questionCount: 320 }
];

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to optimize React component re-renders?',
    content: '<p>I\'m building a large React application and noticing performance issues with unnecessary re-renders.</p><p><strong>What are the best practices for optimizing component rendering?</strong></p><ul><li>Should I use React.memo everywhere?</li><li>When should I use useMemo and useCallback?</li><li>Are there any tools to help identify performance bottlenecks?</li></ul>',
    authorId: '2',
    author: mockUser,
    tags: [mockTags[0], mockTags[1]],
    votes: 15,
    views: 342,
    answers: [],
    isAnonymous: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'How to deal with imposter syndrome as a junior developer?',
    content: '<p>I recently started my first job as a software developer and I\'m constantly feeling like I don\'t belong.</p><p><em>How do experienced developers deal with imposter syndrome?</em></p><p>Some specific challenges I\'m facing:</p><ol><li>Feeling overwhelmed by the codebase</li><li>Comparing myself to senior developers</li><li>Fear of asking "stupid" questions</li></ol><p>Any advice would be greatly appreciated! 😊</p>',
    authorId: 'anonymous',
    author: { ...mockUser, username: 'Anonymous', avatar: '' },
    tags: [mockTags[3], mockTags[4]],
    votes: 28,
    views: 567,
    answers: [],
    isAnonymous: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [tags] = useState<Tag[]>(mockTags);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      userId: '1',
      type: 'answer',
      title: 'New answer on your question',
      message: 'Someone answered your question about React optimization',
      isRead: false,
      link: '/questions/1',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '2',
      userId: '1',
      type: 'vote',
      title: 'Your answer was upvoted',
      message: 'Your answer on "React optimization" received an upvote',
      isRead: false,
      link: '/questions/1',
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: '3',
      userId: '1',
      type: 'mention',
      title: 'You were mentioned',
      message: '@john_doe mentioned you in a comment',
      isRead: true,
      link: '/questions/2',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      answers: [],
      views: 0,
      votes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setQuestions(prev => [newQuestion, ...prev]);
  };

  const addAnswer = (answerData: Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setQuestions(prev => prev.map(q => 
      q.id === answerData.questionId 
        ? { ...q, answers: [...q.answers, newAnswer] }
        : q
    ));
  };

  const voteQuestion = (questionId: string, type: 'up' | 'down') => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, votes: q.votes + (type === 'up' ? 1 : -1) }
        : q
    ));
  };

  const voteAnswer = (answerId: string, type: 'up' | 'down') => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      answers: q.answers.map(a => 
        a.id === answerId 
          ? { ...a, votes: a.votes + (type === 'up' ? 1 : -1) }
          : a
      )
    })));
  };

  const acceptAnswer = (answerId: string) => {
    setQuestions(prev => prev.map(q => ({
      ...q,
      answers: q.answers.map(a => 
        a.id === answerId 
          ? { ...a, isAccepted: true }
          : { ...a, isAccepted: false }
      ),
      acceptedAnswerId: answerId
    })));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  return (
    <AppContext.Provider value={{
      questions,
      tags,
      notifications,
      addQuestion,
      addAnswer,
      voteQuestion,
      voteAnswer,
      acceptAnswer,
      deleteQuestion,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
};