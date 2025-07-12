import React, { useState } from 'react';
import { Bot, Sparkles, Lightbulb, CheckCircle, AlertCircle, Loader, X, Zap, Brain, Target, Shield } from 'lucide-react';
import { aiService, QuestionAnalysis, AnswerSuggestion } from '../services/aiService';

interface AIAssistantProps {
  mode: 'question' | 'answer';
  content: string;
  title?: string;
  onSuggestionApply?: (suggestion: string) => void;
  onTagSuggestion?: (tags: string[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  mode,
  content,
  title = '',
  onSuggestionApply,
  onTagSuggestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<QuestionAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<AnswerSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'suggest' | 'improve' | 'moderate'>('analyze');
  const [moderationResult, setModerationResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      if (mode === 'question') {
        const result = await aiService.analyzeQuestion(title, content);
        if (result.success) {
          setAnalysis(result.data);
        }
      } else {
        const result = await aiService.generateAnswerSuggestion(title, content);
        if (result.success) {
          setSuggestions(result.data);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveContent = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await aiService.improveContent(content, mode);
      if (result.success && onSuggestionApply) {
        onSuggestionApply(result.data.improved);
      }
    } catch (error) {
      console.error('Content improvement failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await aiService.generateTags(title + ' ' + content);
      if (result.success && onTagSuggestion) {
        onTagSuggestion(result.data);
      }
    } catch (error) {
      console.error('Tag generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerateContent = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await aiService.moderateContent(content, mode);
      if (result.success) {
        setModerationResult(result.data);
      }
    } catch (error) {
      console.error('Content moderation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze', icon: Brain, color: 'blue' },
    { id: 'suggest', label: 'Suggest', icon: Lightbulb, color: 'green' },
    { id: 'improve', label: 'Improve', icon: Target, color: 'orange' },
    { id: 'moderate', label: 'Moderate', icon: Shield, color: 'purple' }
  ];

  return (
    <div className="relative">
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Bot className="w-4 h-4" />
        <span className="font-medium">AI Assistant</span>
        <Sparkles className="w-4 h-4 animate-pulse" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute top-12 right-0 w-[480px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm opacity-90">Powered by Gemini 2.0 Flash</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 mt-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600'
                        : 'text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[480px] overflow-y-auto">
              {activeTab === 'analyze' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                      <Brain className="w-4 h-4" />
                      <span>Content Analysis</span>
                    </h4>
                    <p className="text-sm text-blue-700">
                      Get detailed insights about your {mode} quality, clarity, and completeness.
                    </p>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !content.trim()}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    <span>{isLoading ? 'Analyzing...' : 'Analyze Content'}</span>
                  </button>

                  {analysis && (
                    <div className="space-y-4">
                      {/* Quality Scores */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Quality Metrics</h4>
                        <div className="space-y-3">
                          {[
                            { label: 'Clarity', value: analysis.clarity, color: 'blue' },
                            { label: 'Completeness', value: analysis.completeness, color: 'green' },
                            { label: 'Quality Score', value: analysis.qualityScore, color: 'purple' },
                            { label: 'Readability', value: analysis.readabilityScore, color: 'orange' },
                            { label: 'Technical Depth', value: analysis.technicalDepth, color: 'red' }
                          ].map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{metric.label}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${metric.value}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{Math.round(metric.value)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggestions */}
                      {analysis.suggestions.length > 0 && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-3 flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Improvement Suggestions</span>
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                                <span className="text-yellow-600 mt-0.5 font-bold">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improved Title */}
                      {analysis.improvedTitle && mode === 'question' && analysis.improvedTitle !== title && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>Suggested Title</span>
                          </h4>
                          <p className="text-sm text-green-800 bg-white p-2 rounded border">
                            {analysis.improvedTitle}
                          </p>
                        </div>
                      )}

                      {/* Suggested Tags */}
                      {analysis.tags.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-1">
                            <Sparkles className="w-4 h-4" />
                            <span>Suggested Tags</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          {onTagSuggestion && (
                            <button
                              onClick={() => onTagSuggestion(analysis.tags)}
                              className="mt-2 text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                            >
                              Apply Tags
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'suggest' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Smart Suggestions</span>
                    </h4>
                    <p className="text-sm text-green-700">
                      {mode === 'question' 
                        ? 'Get relevant tags and content suggestions for your question.'
                        : 'Generate comprehensive answer suggestions based on the question.'
                      }
                    </p>
                  </div>

                  {mode === 'question' && (
                    <button
                      onClick={handleGenerateTags}
                      disabled={isLoading || !content.trim()}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                    >
                      {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{isLoading ? 'Generating...' : 'Suggest Tags'}</span>
                    </button>
                  )}

                  {mode === 'answer' && (
                    <button
                      onClick={handleAnalyze}
                      disabled={isLoading || !content.trim()}
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                    >
                      {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                      <span>{isLoading ? 'Generating...' : 'Generate Answer'}</span>
                    </button>
                  )}

                  {suggestions.length > 0 && (
                    <div className="space-y-4">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-purple-900 flex items-center space-x-2">
                              <Zap className="w-4 h-4" />
                              <span>AI Generated Answer</span>
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {Math.round(suggestion.confidence)}% confidence
                              </span>
                            </div>
                          </div>
                          
                          <div 
                            className="text-sm text-gray-700 prose prose-sm max-w-none bg-white p-3 rounded border max-h-40 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: suggestion.content }}
                          />
                          
                          {suggestion.relatedTopics && suggestion.relatedTopics.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-purple-600 mb-1">Related Topics:</p>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.relatedTopics.map((topic, i) => (
                                  <span key={i} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => onSuggestionApply?.(suggestion.content)}
                            className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium"
                          >
                            Use This Answer
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'improve' && (
                <div className="space-y-4">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2 flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>Content Enhancement</span>
                    </h4>
                    <p className="text-sm text-orange-700">
                      Improve your {mode} with better structure, clarity, and technical details.
                    </p>
                  </div>

                  <button
                    onClick={handleImproveContent}
                    disabled={isLoading || !content.trim()}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                    <span>{isLoading ? 'Improving...' : 'Improve Content'}</span>
                  </button>

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-2">AI will enhance your {mode} by:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Improving clarity and structure</li>
                      <li>• Adding relevant technical details</li>
                      <li>• Enhancing readability and formatting</li>
                      <li>• Including best practices</li>
                      <li>• Optimizing for better engagement</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'moderate' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Content Moderation</span>
                    </h4>
                    <p className="text-sm text-purple-700">
                      Check your content for policy compliance and quality standards.
                    </p>
                  </div>

                  <button
                    onClick={handleModerateContent}
                    disabled={isLoading || !content.trim()}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    <span>{isLoading ? 'Checking...' : 'Check Content'}</span>
                  </button>

                  {moderationResult && (
                    <div className={`p-4 rounded-lg ${
                      moderationResult.approved 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2 mb-2">
                        {moderationResult.approved ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          moderationResult.approved ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {moderationResult.approved ? 'Content Approved' : 'Issues Detected'}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {moderationResult.confidence}% confidence
                        </span>
                      </div>
                      
                      {moderationResult.issues && moderationResult.issues.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-800 mb-1">Issues Found:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {moderationResult.issues.map((issue: string, index: number) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span>•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {moderationResult.recommendations && moderationResult.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-800 mb-1">Recommendations:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {moderationResult.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-1">
                                <span>•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};