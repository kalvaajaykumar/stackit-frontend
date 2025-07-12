import React, { useState } from 'react';
import { Search, TrendingUp, Users, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TagsPage: React.FC = () => {
  const { tags } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-gray-600">
          Browse questions by tag to find topics you're interested in.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="px-3 py-1 rounded-md text-sm font-medium"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>{tag.questionCount}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {tag.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{tag.questionCount} questions</span>
              </span>
              <button className="text-blue-600 hover:text-blue-700 font-medium group-hover:underline">
                Browse →
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
          <p className="text-gray-600">
            Try searching with different keywords.
          </p>
        </div>
      )}
    </div>
  );
};