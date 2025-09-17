import { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Filter, User, Building2, Calendar, Loader2, Grid3x3, Play, Pause, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  relationship: 'manager' | 'colleague' | 'client' | 'subordinate' | 'mentor';
  content: string;
  rating: number;
  date: Date;
  avatar?: string;
  linkedinUrl?: string;
  verified: boolean;
  skills?: string[];
  context?: string;
}

interface TestimonialsCarousel {
  testimonials: Testimonial[];
  layout: {
    style: 'carousel' | 'grid' | 'cards' | 'slider';
    autoplay: boolean;
    showNavigation: boolean;
    showDots: boolean;
    itemsPerView: number;
    spacing: number;
  };
  filters: {
    byRelationship: boolean;
    bySkills: boolean;
    byRating: boolean;
    showOnlyVerified: boolean;
  };
  analytics: {
    totalTestimonials: number;
    averageRating: number;
    relationshipBreakdown: Record<string, number>;
    topSkillsMentioned: { skill: string; mentions: number }[];
    verificationRate: number;
  };
  display: {
    primaryColor: string;
    accentColor: string;
    showCompanyLogos: boolean;
    showLinkedInLinks: boolean;
    showRatings: boolean;
    truncateLength: number;
  };
}

interface TestimonialsCarouselProps {
  carousel?: TestimonialsCarousel;
  onGenerateCarousel: () => Promise<TestimonialsCarousel>;
  onAddTestimonial: (testimonial: Partial<Testimonial>) => Promise<void>;
  onUpdateTestimonial: (testimonialId: string, updates: Partial<Testimonial>) => Promise<void>;
  onRemoveTestimonial: (testimonialId: string) => Promise<void>;
  onUpdateLayout: (layoutOptions: Partial<TestimonialsCarousel['layout']>) => Promise<void>;
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  carousel,
  onGenerateCarousel,
  onAddTestimonial,
  onRemoveTestimonial,
  onUpdateLayout
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const relationshipColors = {
    manager: 'from-purple-500 to-pink-500',
    colleague: 'from-blue-500 to-cyan-500',
    client: 'from-green-500 to-emerald-500',
    subordinate: 'from-orange-500 to-yellow-500',
    mentor: 'from-red-500 to-rose-500'
  };

  const relationshipIcons = {
    manager: '👔',
    colleague: '🤝',
    client: '💼',
    subordinate: '📈',
    mentor: '🎓'
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!carousel || !isAutoPlaying || !carousel.layout.autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => 
        prev >= carousel.testimonials.length - carousel.layout.itemsPerView 
          ? 0 
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [carousel, isAutoPlaying]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateCarousel();
      toast.success('Testimonials carousel generated!');
    } catch {
      toast.error('Failed to generate testimonials carousel');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  const getFilteredTestimonials = () => {
    if (!carousel) return [];
    
    let filtered = carousel.testimonials;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(t => t.relationship === selectedFilter);
    }
    
    if (carousel.filters.showOnlyVerified) {
      filtered = filtered.filter(t => t.verified);
    }
    
    return filtered;
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number) => {
    const isExpanded = false; // Could be state for expand/collapse
    const displayContent = testimonial.content.length > carousel!.display.truncateLength
      ? testimonial.content.substring(0, carousel!.display.truncateLength) + '...'
      : testimonial.content;

    return (
      <div 
        className="animate-fade-in"
        key={testimonial.id}
      >
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote 
            className="w-8 h-8 text-cyan-400 opacity-60" 
            style={{ color: carousel!.display.primaryColor }} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 mb-4">
          <p className="text-gray-300 leading-relaxed">
            "{isExpanded ? testimonial.content : displayContent}"
          </p>
          
          {testimonial.content.length > carousel!.display.truncateLength && (
            <button className="text-cyan-400 text-sm mt-2 hover:text-cyan-300">
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Author Info */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                {/* Relationship indicator */}
                <div className="absolute -top-1 -right-1 text-lg">
                  {relationshipIcons[testimonial.relationship]}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-100">{testimonial.name}</h4>
                  {testimonial.verified && (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-400">{testimonial.title}</p>
                
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">{testimonial.company}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              {carousel!.display.showRatings && (
                <div className="flex gap-0.5 mb-1">
                  {renderStars(testimonial.rating)}
                </div>
              )}
              
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(testimonial.date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Skills mentioned */}
          {testimonial.skills && testimonial.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {testimonial.skills.map((skill, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {}}
              className="p-1 text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={async () => {
                if (confirm('Remove this testimonial?')) {
                  await onRemoveTestimonial(testimonial.id);
                  toast.success('Testimonial removed');
                }
              }}
              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!carousel) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Quote className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Testimonials Carousel Not Generated
        </h3>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Create a professional testimonials showcase with AI-generated recommendations and reviews.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
              Generating Testimonials...
            </>
          ) : (
            'Generate Testimonials Carousel'
          )}
        </button>
      </div>
    );
  }

  const filteredTestimonials = getFilteredTestimonials();

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Quote className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{carousel.analytics.totalTestimonials}</div>
          <div className="text-sm text-gray-400">Total Testimonials</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Star className="w-8 h-8 text-yellow-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{carousel.analytics.averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-400">Average Rating</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Award className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{carousel.analytics.verificationRate}%</div>
          <div className="text-sm text-gray-400">Verified</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Building2 className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">
            {Object.keys(carousel.analytics.relationshipBreakdown).length}
          </div>
          <div className="text-sm text-gray-400">Relationship Types</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Layout Controls */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button
              onClick={() => onUpdateLayout({ style: 'carousel' })}
              className={`p-2 rounded-lg transition-all ${
                carousel.layout.style === 'carousel'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onUpdateLayout({ style: 'grid' })}
              className={`p-2 rounded-lg transition-all ${
                carousel.layout.style === 'grid'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>

          {/* Autoplay Control */}
          <button
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              onUpdateLayout({ autoplay: !isAutoPlaying });
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isAutoPlaying
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm">Auto</span>
          </button>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Filters */}
      <div>
        {showFilters && (
          <div className="animate-fade-in bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All ({carousel.testimonials.length})
              </button>
              
              {Object.entries(carousel.analytics.relationshipBreakdown).map(([relationship, count]) => (
                <button
                  key={relationship}
                  onClick={() => setSelectedFilter(relationship)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    selectedFilter === relationship
                      ? 'bg-gradient-to-r ' + relationshipColors[relationship as keyof typeof relationshipColors] + ' text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {relationshipIcons[relationship as keyof typeof relationshipIcons]} {relationship} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Testimonials Display */}
      {carousel.layout.style === 'carousel' ? (
        <div className="relative">
          <div className="overflow-hidden rounded-xl">
            <div className="flex gap-6">
              {filteredTestimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.id} 
                  className="flex-shrink-0 group"
                  style={{ width: `${100 / carousel.layout.itemsPerView}%` }}
                >
                  {renderTestimonialCard(testimonial, index)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          {carousel.layout.showNavigation && (
            <>
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => setCurrentIndex(Math.min(filteredTestimonials.length - carousel.layout.itemsPerView, currentIndex + 1))}
                disabled={currentIndex >= filteredTestimonials.length - carousel.layout.itemsPerView}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Dots */}
          {carousel.layout.showDots && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(filteredTestimonials.length / carousel.layout.itemsPerView) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-cyan-400 w-6' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="group">
              {renderTestimonialCard(testimonial, index)}
            </div>
          ))}
        </div>
      )}

      {/* Add Testimonial Modal - Simplified for now */}
      <div>
        {showAddForm && (
          <div 
            className="animate-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <div 
              className="animate-fade-in bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-100 mb-4">Add Testimonial</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await onAddTestimonial({
                  name: formData.get('name') as string,
                  title: formData.get('title') as string,
                  company: formData.get('company') as string,
                  relationship: formData.get('relationship') as unknown,
                  content: formData.get('content') as string,
                  rating: Number(formData.get('rating'))
                });
                setShowAddForm(false);
                toast.success('Testimonial added');
              }}>
                <div className="space-y-4">
                  <input
                    name="name"
                    placeholder="Name"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    name="title"
                    placeholder="Job Title"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    name="company"
                    placeholder="Company"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                  />
                  <select
                    name="relationship"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="colleague">Colleague</option>
                    <option value="manager">Manager</option>
                    <option value="client">Client</option>
                    <option value="subordinate">Team Member</option>
                    <option value="mentor">Mentor</option>
                  </select>
                  <textarea
                    name="content"
                    placeholder="Testimonial content..."
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none resize-none"
                  />
                  <select
                    name="rating"
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add Testimonial
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};