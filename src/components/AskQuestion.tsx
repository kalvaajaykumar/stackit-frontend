import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { RichTextEditor } from './RichTextEditor';
import { TagSelector } from './TagSelector';
import { AIAssistant } from './AIAssistant';

interface AskQuestionProps {
  onBack: () => void;
}

export const AskQuestion: React.FC<AskQuestionProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { addQuestion, tags } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.replace(/<[^>]*>/g, '').trim() || selectedTags.length === 0) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addQuestion({
        title: title.trim(),
        content: content.trim(),
        authorId: isAnonymous ? 'anonymous' : user.id,
        author: isAnonymous ? { ...user, username: 'Anonymous', avatar: '' } : user,
        tags: tags.filter(tag => selectedTags.includes(tag.id)),
        votes: 0,
        views: 0,
        answers: [],
        isAnonymous
      });

      onBack();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAISuggestion = (suggestion: string) => {
    setContent(suggestion);
  };

  const handleAITagSuggestion = (suggestedTags: string[]) => {
    const tagIds = tags
      .filter(tag => suggestedTags.includes(tag.name))
      .map(tag => tag.id);
    setSelectedTags(prev => [...new Set([...prev, ...tagIds])]);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to ask a question</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to post questions on StackIt.</p>
        <button 
          onClick={() => window.location.hash = 'login'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-600 mt-2">
          Get help from the community by asking a clear, detailed question.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-2">
            Title
          </label>
          <p className="text-gray-600 text-sm mb-4">
            Be specific and imagine you're asking a question to another person.
          </p>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How do I center a div in CSS?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="text-lg font-semibold text-gray-900">
              Description
            </label>
            <AIAssistant
              mode="question"
              content={content}
              title={title}
              onSuggestionApply={handleAISuggestion}
              onTagSuggestion={handleAITagSuggestion}
            />
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Provide all the details someone would need to understand and answer your question.
            Use the rich text editor to format your content with bold, italic, lists, links, and images.
          </p>
          <RichTextEditor
            value={content}
            onChange={(newValue) => setContent(newValue)}
            placeholder="Describe your problem in detail. You can use formatting, add links, images, and more..."
            height="300px"
          />
        </div>

        {/* Tags */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <label className="text-lg font-semibold text-gray-900">
              Tags
              </label>
              <span className="text-red-500">*</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Add up to 5 tags to describe what your question is about.
            Tags help others find and categorize your question.
          </p>
          
          <TagSelector
            availableTags={tags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            maxTags={5}
            placeholder="Search for tags (e.g., React, JavaScript, Career)..."
          />
          
          {selectedTags.length === 0 && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Please select at least one tag for your question</span>
            </div>
          )}
        </div>

        {/* Privacy Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Options</h3>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              {isAnonymous ? (
                <EyeOff className="w-5 h-5 text-gray-500" />
              ) : (
                <Eye className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-gray-700">Post anonymously</span>
            </div>
          </label>
          <p className="text-sm text-gray-600 mt-2 ml-7">
            Your name and profile picture will not be shown with this question.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.replace(/<[^>]*>/g, '').trim() || selectedTags.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
};