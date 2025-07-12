import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle, Eye, CheckCircle, Award, ArrowLeft, Trash2, MoreVertical } from 'lucide-react';
import { Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { RichTextEditor } from './RichTextEditor';
import { AIAssistant } from './AIAssistant';

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

export const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, onBack }) => {
  const { user } = useAuth();
  const { voteQuestion, voteAnswer, acceptAnswer, addAnswer, deleteQuestion } = useApp();
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !answerContent.replace(/<[^>]*>/g, '').trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      addAnswer({
        content: answerContent,
        authorId: user.id,
        author: user,
        questionId: question.id,
        votes: 0,
        isAccepted: false,
        comments: []
      });

      setAnswerContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISuggestion = (suggestion: string) => {
    setAnswerContent(suggestion);
  };

  const handleDeleteQuestion = () => {
    deleteQuestion(question.id);
    onBack();
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to questions</span>
      </button>

      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {/* Question Header with Options */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{question.title}</h1>
          
          {canDeleteQuestion && (
            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOptionsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setShowOptionsMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Question</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <button
              onClick={() => user && voteQuestion(question.id, 'up')}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              disabled={!user}
            >
              <ChevronUp className="w-6 h-6 text-gray-500 hover:text-blue-600" />
            </button>
            <span className={`font-bold text-lg ${question.votes > 0 ? 'text-green-600' : question.votes < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {question.votes}
            </span>
            <button
              onClick={() => user && voteQuestion(question.id, 'down')}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
              disabled={!user}
            >
              <ChevronDown className="w-6 h-6 text-gray-500 hover:text-red-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="prose max-w-none text-gray-700 mb-6">
              {question.content}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </span>
                <span>Asked {formatTimeAgo(question.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {!question.isAnonymous && question.author.avatar && (
                  <img
                    src={question.author.avatar}
                    alt={question.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="text-right">
                  <div className="font-medium text-gray-700">
                    {question.isAnonymous ? 'Anonymous' : question.author.username}
                  </div>
                  {!question.isAnonymous && (
                    <div className="text-xs text-gray-500">
                      {question.author.reputation} reputation
                    </div>
                  )}
                </div>
                {question.author.isExpert && !question.isAnonymous && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                    Expert
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {question.answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            questionAuthorId={question.authorId}
            onVote={(type) => voteAnswer(answer.id, type)}
            onAccept={() => acceptAnswer(answer.id)}
            canAccept={user?.id === question.authorId && !answer.isAccepted}
          />
        ))}

        {/* Answer Form */}
        {user ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Answer</h3>
              <AIAssistant
                mode="answer"
                content={answerContent}
                title={question.title}
                onSuggestionApply={handleAISuggestion}
              />
            </div>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <RichTextEditor
                value={answerContent}
                onChange={(value) => setAnswerContent(value)}
                placeholder="Write your answer here. Use formatting to make it clear and helpful..."
                height="250px"
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !answerContent.replace(/<[^>]*>/g, '').trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Answer'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600 mb-4">You need to be logged in to post an answer.</p>
            <button 
              onClick={() => window.location.hash = 'login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log in to answer
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              Are you sure you want to delete this question? This will also delete all answers and comments associated with it.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuestion}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AnswerCardProps {
  answer: Answer;
  questionAuthorId: string;
  onVote: (type: 'up' | 'down') => void;
  onAccept: () => void;
  canAccept: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ answer, questionAuthorId, onVote, onAccept, canAccept }) => {
  const { user } = useAuth();

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

  return (
    <div className={`bg-white border rounded-lg p-6 ${answer.isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex space-x-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
          <button
            onClick={() => user && onVote('up')}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            disabled={!user}
          >
            <ChevronUp className="w-6 h-6 text-gray-500 hover:text-blue-600" />
          </button>
          <span className={`font-bold text-lg ${answer.votes > 0 ? 'text-green-600' : answer.votes < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {answer.votes}
          </span>
          <button
            onClick={() => user && onVote('down')}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            disabled={!user}
          >
            <ChevronDown className="w-6 h-6 text-gray-500 hover:text-red-600" />
          </button>
          
          {canAccept && (
            <button
              onClick={onAccept}
              className="p-2 rounded hover:bg-green-100 transition-colors"
              title="Accept this answer"
            >
              <CheckCircle className="w-6 h-6 text-gray-400 hover:text-green-600" />
            </button>
          )}
          
          {answer.isAccepted && (
            <div className="p-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {answer.isAccepted && (
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Accepted Answer</span>
            </div>
          )}

          <div className="prose max-w-none text-gray-700 mb-6">
            <div dangerouslySetInnerHTML={{ __html: question.content }} />
          </div>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
            <div className="flex items-center space-x-4">
              <span>Answered {formatTimeAgo(answer.createdAt)}</span>
              <button className="flex items-center space-x-1 hover:text-gray-700">
                <MessageCircle className="w-4 h-4" />
                <span>{answer.comments.length} comments</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <img
                src={answer.author.avatar}
                alt={answer.author.username}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-right">
                <div className="font-medium text-gray-700">{answer.author.username}</div>
                <div className="text-xs text-gray-500">{answer.author.reputation} reputation</div>
              </div>
              {answer.author.isExpert && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                  Expert
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};