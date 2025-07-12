import React from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Eye, CheckCircle, Clock, Trash2, MoreVertical } from 'lucide-react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const { user } = useAuth();
  const { voteQuestion, deleteQuestion } = useApp();
  const [showOptionsMenu, setShowOptionsMenu] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleVote = (e: React.MouseEvent, type: 'up' | 'down') => {
    e.stopPropagation();
    if (user) {
      voteQuestion(question.id, type);
    }
  };

  const handleDeleteQuestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteQuestion(question.id);
  };

  const canDeleteQuestion = user && (user.id === question.authorId || user.role === 'admin');

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const hasAcceptedAnswer = question.answers.some(answer => answer.isAccepted);

  return (
    <div 
      className="relative"
    >
      <div 
        onClick={onClick}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="flex space-x-4">
          {/* Options Menu */}
          {canDeleteQuestion && (
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOptionsMenu(!showOptionsMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(false);
                    }}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                        setShowOptionsMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <button
              onClick={(e) => handleVote(e, 'up')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              disabled={!user}
            >
              <ChevronUp className="w-5 h-5 text-gray-500 hover:text-accent-600" />
            </button>
            <span className={`font-medium ${question.votes > 0 ? 'text-accent-600' : question.votes < 0 ? 'text-danger-600' : 'text-gray-600'}`}>
              {question.votes}
            </span>
            <button
              onClick={(e) => handleVote(e, 'down')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              disabled={!user}
            >
              <ChevronDown className="w-5 h-5 text-gray-500 hover:text-danger-600" />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {question.title}
              </h3>
              {hasAcceptedAnswer && (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
              )}
            </div>
            
            <p className="text-gray-600 mt-2 line-clamp-2">
              {question.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {question.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{question.answers.length} answers</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </span>
              </div>

              {/* Author and Time */}
              <div className="flex items-center space-x-2 text-sm">
                <span className="flex items-center space-x-1 text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(question.createdAt)}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {!question.isAnonymous && question.author.avatar && (
                    <img
                      src={question.author.avatar}
                      alt={question.author.username}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-medium text-gray-700">
                    {question.isAnonymous ? 'Anonymous' : question.author.username}
                  </span>
                  {question.author.isExpert && !question.isAnonymous && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Expert
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{question.title}"?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};