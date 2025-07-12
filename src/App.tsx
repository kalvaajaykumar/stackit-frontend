import React, { useState } from 'react';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { QuestionDetail } from './components/QuestionDetail';
import { AskQuestion } from './components/AskQuestion';
import { Auth } from './components/Auth';
import { TagsPage } from './components/TagsPage';
import { UsersPage } from './components/UsersPage';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { AIInsights } from './components/AIInsights';
import { Chatbot } from './components/Chatbot';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Question } from './types';
import { TrendingUp, Clock, Star } from 'lucide-react';

type Page = 'home' | 'ask' | 'login' | 'register' | 'tags' | 'users' | 'profile' | 'admin';

function AppContent() {
  const { user } = useAuth();
  const { questions } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Handle URL hash changes for navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'register' || hash === 'login') {
        setCurrentPage(hash as Page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setSelectedQuestion(null);
    
    // Update URL hash for certain pages
    if (page === 'login' || page === 'register') {
      window.location.hash = page;
    } else {
      window.location.hash = '';
    }
    
    // Close any open dropdowns when navigating
    document.body.click();
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleAuthSuccess = () => {
    setCurrentPage('home');
    window.location.hash = '';
  };

  const renderContent = () => {
    if (currentPage === 'login' || currentPage === 'register') {
      return (
        <Auth
          mode={currentPage}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setCurrentPage(mode);
          }}
          onSuccess={handleAuthSuccess}
        />
      );
    }

    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <Header currentPage={currentPage} onPageChange={handlePageChange} />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedQuestion ? (
              <QuestionDetail
                question={selectedQuestion}
                onBack={() => setSelectedQuestion(null)}
              />
            ) : (
              <>
                {currentPage === 'home' && <HomePage onQuestionClick={handleQuestionClick} />}
                {currentPage === 'ask' && user && <AskQuestion onBack={() => setCurrentPage('home')} />}
                {currentPage === 'ask' && !user && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to ask a question</h2>
                    <p className="text-gray-600 mb-6">You need to be logged in to post questions on StackIt.</p>
                    <button 
                      onClick={() => handlePageChange('login')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Log in
                    </button>
                  </div>
                )}
                {currentPage === 'tags' && <TagsPage />}
                {currentPage === 'users' && <UsersPage onNavigate={handlePageChange} />}
                {currentPage === 'profile' && <UserProfile />}
                {currentPage === 'admin' && user?.role === 'admin' && <AdminPanel />}
              </>
            )}
          </main>
        </div>
        
        {/* AI Chatbot */}
        {user && <Chatbot />}
      </>
    );
  };

  return renderContent();
}

function HomePage({ onQuestionClick }: { onQuestionClick: (question: Question) => void }) {
  const { questions } = useApp();
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'popular'>('newest');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const { user } = useAuth();

  const handlePageChange = (page: string) => {
    // This function should be passed down from parent
    if (page === 'ask') {
      window.location.hash = 'ask';
    }
  };

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case 'trending':
        return (b.votes + b.views / 10) - (a.votes + a.views / 10);
      case 'popular':
        return b.votes - a.votes;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div>
      {/* AI Insights */}
      {showAIInsights && (
        <div className="mb-8">
          <AIInsights />
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-600 mt-1">
            {questions.length} questions • Get help from the community
          </p>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'trending'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Popular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to ask a question and help build the community!
            </p>
            {user ? (
              <button 
                onClick={() => handlePageChange('ask')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ask the First Question
              </button>
            ) : (
              <button 
                onClick={() => window.location.hash = 'login'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign up to Ask Questions
              </button>
            )}
          </div>
        ) : (
          sortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={() => onQuestionClick(question)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;