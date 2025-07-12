import React, { useState } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Tag } from '../types';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  maxTags = 5,
  placeholder = "Search and select tags..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id));

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tagId]);
      setSearchTerm('');
    }
  };

  const handleTagRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  return (
    <div className="relative">
      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              <TagIcon className="w-3 h-3" />
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleTagRemove(tag.id)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length >= maxTags ? `Maximum ${maxTags} tags selected` : placeholder}
          disabled={selectedTags.length >= maxTags}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && searchTerm && filteredTags.length > 0 && selectedTags.length < maxTags && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {filteredTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  handleTagSelect(tag.id);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium text-gray-900">{tag.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {tag.questionCount} questions
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Tag Limit Info */}
      <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
        <span>
          {selectedTags.length}/{maxTags} tags selected
        </span>
        {selectedTags.length >= maxTags && (
          <span className="text-orange-600">Maximum tags reached</span>
        )}
      </div>
    </div>
  );
};