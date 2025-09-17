import { useState } from 'react';
import { Grid3x3, List, Clock, Tag, Trash2, Share2, Loader2, FileText, ExternalLink, X, Briefcase, Trophy, BookOpen, Mic, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioItem {
  id: string;
  type: 'project' | 'achievement' | 'certification' | 'publication' | 'presentation';
  title: string;
  description: string;
  category: string;
  tags: string[];
  date?: Date;
  duration?: string;
  role?: string;
  technologies?: string[];
  impact?: {
    metric: string;
    value: string;
  }[];
  media?: {
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    thumbnail?: string;
    caption?: string;
  }[];
  links?: {
    type: 'github' | 'website' | 'demo' | 'documentation' | 'other';
    url: string;
    label: string;
  }[];
  collaborators?: string[];
  visibility: 'public' | 'private' | 'unlisted';
}

interface PortfolioGallery {
  items: PortfolioItem[];
  categories: string[];
  statistics: {
    totalProjects: number;
    totalTechnologies: number;
    yearsSpanned: number;
    impactMetrics: {
      metric: string;
      total: string;
    }[];
  };
  layout: {
    style: 'grid' | 'timeline' | 'showcase';
    featuredItems: string[];
    order: 'chronological' | 'category' | 'impact';
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    font: string;
  };
}

interface PortfolioGalleryProps {
  gallery?: PortfolioGallery;
  shareableUrl?: string;
  embedCode?: string;
  onGenerateGallery: () => Promise<PortfolioGallery>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onGenerateShareableLink: (customDomain?: string) => Promise<{ url: string; embedCode: string }>;
}

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  gallery,
  shareableUrl,
  embedCode,
  onGenerateGallery,
  onDeleteItem,
  onGenerateShareableLink
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const typeIcons = {
    project: <Briefcase className="w-5 h-5" />,
    achievement: <Trophy className="w-5 h-5" />,
    certification: <Award className="w-5 h-5" />,
    publication: <BookOpen className="w-5 h-5" />,
    presentation: <Mic className="w-5 h-5" />
  };

  const typeColors = {
    project: 'from-blue-500 to-cyan-500',
    achievement: 'from-green-500 to-emerald-500',
    certification: 'from-purple-500 to-pink-500',
    publication: 'from-red-500 to-orange-500',
    presentation: 'from-yellow-500 to-amber-500'
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateGallery();
      toast.success('Portfolio gallery generated successfully!');
    } catch {
      toast.error('Failed to generate portfolio gallery');
    } finally {
      setIsGenerating(false);
    }
  };


  const filteredItems = gallery?.items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  if (!gallery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
        <Grid3x3 className="w-16 h-16 text-gray-600 mb-4 animate-pulse-slow" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Portfolio Gallery Not Created
        </h3>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Generate a visual showcase of your projects, achievements, and professional work.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 hover-glow"
        >
          {isGenerating ? (
            <>
              <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
              Generating Gallery...
            </>
          ) : (
            'Generate Portfolio Gallery'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-100">Portfolio Gallery</h3>
          <p className="text-gray-400 mt-1">
            {gallery.items.length} items across {gallery.categories.length} categories
          </p>
        </div>
        
        <div className="flex gap-3">
          {/* <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button> */}
          
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share Gallery
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-cyan-400">{gallery.statistics.totalProjects}</div>
          <div className="text-gray-400 text-sm">Projects</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-purple-400">{gallery.statistics.totalTechnologies}</div>
          <div className="text-gray-400 text-sm">Technologies</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-green-400">{gallery.statistics.yearsSpanned}</div>
          <div className="text-gray-400 text-sm">Years Experience</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-3xl font-bold text-orange-400">
            {gallery.statistics.impactMetrics[0]?.total || '0'}
          </div>
          <div className="text-gray-400 text-sm">
            {gallery.statistics.impactMetrics[0]?.metric || 'Impact'}
          </div>
        </div>
      </div>

      {/* Filters & View Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          {gallery.categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'timeline'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Portfolio Items */}
      <div>
        {viewMode === 'grid' && (
          <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                className="animate-fade-in bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all hover:shadow-lg cursor-pointer"
                key={item.id}
                onClick={() => setSelectedItem(item)}
              >
                {/* Media Preview */}
                {item.media && item.media[0] && (
                  <div className="h-48 bg-gray-900 relative overflow-hidden">
                    {item.media[0].type === 'image' ? (
                      <img 
                        src={item.media[0].url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${typeColors[item.type]} flex items-center justify-center`}>
                          {typeIcons[item.type]}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${typeColors[item.type]} text-white`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">{item.title}</h4>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Impact Metrics */}
                  {item.impact && item.impact.length > 0 && (
                    <div className="text-sm text-cyan-400 font-medium">
                      {item.impact[0].metric}: {item.impact[0].value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="animate-fade-in space-y-4">
            {filteredItems.map((item, index) => (
              <div 
                className="animate-fade-in bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-all cursor-pointer"
                key={item.id}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${typeColors[item.type]}`}>
                    {typeIcons[item.type]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-100">{item.title}</h4>
                      <span className="text-sm text-gray-400">
                        {item.date ? new Date(item.date).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{item.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      {item.technologies && (
                        <div className="flex gap-2">
                          {item.technologies.slice(0, 4).map((tech, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.impact && item.impact.length > 0 && (
                        <div className="text-sm text-cyan-400 font-medium">
                          {item.impact[0].metric}: {item.impact[0].value}
                        </div>
                      )}
                      
                      {item.links && item.links.length > 0 && (
                        <div className="flex gap-2">
                          {item.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="animate-fade-in relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>
            
            {filteredItems
              .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
              .map((item, index) => (
                <div 
                  className="animate-fade-in relative flex items-start mb-8"
                  key={item.id}
                >
                  <div className={`absolute left-4 w-8 h-8 rounded-full bg-gradient-to-r ${typeColors[item.type]} flex items-center justify-center`}>
                    <div className="w-6 h-6 flex items-center justify-center text-white text-xs">
                      {typeIcons[item.type]}
                    </div>
                  </div>
                  
                  <div 
                    className="ml-16 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-all cursor-pointer flex-1"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-100">{item.title}</h4>
                      <span className="text-sm text-gray-400">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <p className="text-gray-400 mb-3">{item.description}</p>
                    
                    {item.impact && item.impact.length > 0 && (
                      <div className="text-sm text-cyan-400 font-medium">
                        {item.impact[0].metric}: {item.impact[0].value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      <div>
        {selectedItem && (
          <div 
            className="animate-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedItem(null)}
          >
            <div 
              className="animate-fade-in bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${typeColors[selectedItem.type]}`}>
                      {typeIcons[selectedItem.type]}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-100">{selectedItem.title}</h3>
                  </div>
                  <p className="text-gray-400">{selectedItem.category}</p>
                </div>
                
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Media Gallery */}
              {selectedItem.media && selectedItem.media.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedItem.media.map((media, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg overflow-hidden">
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={media.caption || `Media ${index + 1}`}
                            className="w-full h-64 object-cover"
                          />
                        ) : media.type === 'video' ? (
                          <video 
                            src={media.url} 
                            controls
                            className="w-full h-64"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center">
                            <FileText className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        {media.caption && (
                          <p className="p-2 text-sm text-gray-400">{media.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-100 mb-2">Description</h4>
                <p className="text-gray-300">{selectedItem.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Technologies */}
                {selectedItem.technologies && selectedItem.technologies.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.technologies.map((tech, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact Metrics */}
                {selectedItem.impact && selectedItem.impact.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Impact</h4>
                    <div className="space-y-2">
                      {selectedItem.impact.map((metric, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-400">{metric.metric}:</span>
                          <span className="text-cyan-400 font-medium">{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {(selectedItem.date || selectedItem.duration || selectedItem.role) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Timeline</h4>
                    <div className="space-y-2">
                      {selectedItem.date && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-gray-300">
                            {new Date(selectedItem.date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {selectedItem.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-gray-300">{selectedItem.duration}</span>
                        </div>
                      )}
                      {selectedItem.role && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Role:</span>
                          <span className="text-gray-300">{selectedItem.role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                {selectedItem.links && selectedItem.links.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-2">Links</h4>
                    <div className="space-y-2">
                      {selectedItem.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-100 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this item?')) {
                      await onDeleteItem(selectedItem.id);
                      setSelectedItem(null);
                      toast.success('Item deleted');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <div>
        {showShareModal && (
          <div 
            className="animate-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowShareModal(false)}
          >
            <div 
              className="animate-fade-in bg-gray-800 rounded-xl p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-100 mb-6">Share Portfolio Gallery</h3>
              
              {shareableUrl ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Shareable Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareableUrl}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareableUrl);
                          toast.success('Link copied!');
                        }}
                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  {embedCode && (
                    <div>
                      <label className="block text-gray-300 mb-2">Embed Code</label>
                      <textarea
                        value={embedCode}
                        readOnly
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 font-mono text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(embedCode);
                          toast.success('Embed code copied!');
                        }}
                        className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        Copy Embed Code
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-6">Generate a shareable link for your portfolio gallery</p>
                  <button
                    onClick={async () => {
                      await onGenerateShareableLink();
                      toast.success('Shareable link generated!');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                  >
                    Generate Shareable Link
                  </button>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};