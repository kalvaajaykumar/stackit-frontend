import React from 'react';
import { Award, Star, MessageCircle, TrendingUp } from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    username: 'alex_developer',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    reputation: 15420,
    badges: ['Top Contributor', 'Expert'],
    questionsAsked: 45,
    answersGiven: 234,
    isExpert: true,
    location: 'San Francisco, CA'
  },
  {
    id: '2',
    username: 'sarah_code',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    reputation: 8750,
    badges: ['Helpful', 'Rising Star'],
    questionsAsked: 23,
    answersGiven: 156,
    isExpert: false,
    location: 'London, UK'
  },
  {
    id: '3',
    username: 'mike_mentor',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    reputation: 22100,
    badges: ['Mentor', 'Expert', 'Top Contributor'],
    questionsAsked: 12,
    answersGiven: 445,
    isExpert: true,
    location: 'Toronto, Canada'
  },
  {
    id: '4',
    username: 'lisa_learner',
    avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    reputation: 3240,
    badges: ['Active Learner'],
    questionsAsked: 67,
    answersGiven: 28,
    isExpert: false,
    location: 'Sydney, Australia'
  }
];

interface UsersPageProps {
  onNavigate?: (page: string) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ onNavigate }) => {
  const sortedUsers = [...mockUsers].sort((a, b) => b.reputation - a.reputation);

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('register');
    } else {
      // Fallback to hash navigation
      window.location.hash = 'register';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-gray-600">
          Meet the community members who make StackIt a great place to learn and share knowledge.
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedUsers.map((user, index) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* User Header */}
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.username}
                  </h3>
                  {index < 3 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{user.location}</p>
                {user.isExpert && (
                  <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium mt-1">
                    Expert
                  </span>
                )}
              </div>
            </div>

            {/* Reputation */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Reputation</span>
                <span className="font-bold text-lg text-blue-600">
                  {user.reputation.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((user.reputation / 25000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Questions</span>
                </div>
                <span className="font-semibold text-gray-900">{user.questionsAsked}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Answers</span>
                </div>
                <span className="font-semibold text-gray-900">{user.answersGiven}</span>
              </div>
            </div>

            {/* Badges */}
            <div>
              <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                <Award className="w-4 h-4" />
                <span>Badges</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user.badges.map((badge, badgeIndex) => (
                  <span
                    key={badgeIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Join Community CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-gray-200 rounded-lg p-8 mt-12 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Our Community</h3>
        <p className="text-gray-600 mb-4">
          Start building your reputation by asking great questions and providing helpful answers.
        </p>
        <button 
          onClick={handleGetStarted}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};