import { useState } from 'react';
import { Shield, CheckCircle, Plus, ExternalLink, Calendar, Clock, Grid3x3, List, Loader2, Share2, AlertCircle, X, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface CertificationBadge {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
  badgeImage: {
    type: 'generated' | 'official' | 'custom';
    url: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  category: 'technical' | 'professional' | 'academic' | 'language' | 'other';
  level?: 'foundation' | 'associate' | 'professional' | 'expert';
  skills: string[];
  verified: boolean;
  verificationMethod?: 'manual' | 'api' | 'blockchain' | 'email';
  metadata: {
    provider?: string;
    score?: number;
    percentile?: number;
    modules?: string[];
  };
}

interface CertificationBadgesCollection {
  badges: CertificationBadge[];
  categories: {
    technical: CertificationBadge[];
    professional: CertificationBadge[];
    academic: CertificationBadge[];
    language: CertificationBadge[];
    other: CertificationBadge[];
  };
  statistics: {
    totalCertifications: number;
    verifiedCertifications: number;
    activeCertifications: number;
    expiredCertifications: number;
    topIssuers: { issuer: string; count: number }[];
    skillsCovered: string[];
  };
  displayOptions: {
    layout: 'grid' | 'list' | 'carousel' | 'timeline';
    showExpired: boolean;
    groupByCategory: boolean;
    animateOnHover: boolean;
    showVerificationStatus: boolean;
  };
}

interface CertificationBadgesProps {
  collection?: CertificationBadgesCollection;
  onGenerateBadges: () => Promise<CertificationBadgesCollection>;
  onVerifyCertification: (badgeId: string, verificationData: Record<string, unknown>) => Promise<void>;
  onUpdateDisplayOptions: (options: CertificationBadgesCollection['displayOptions']) => Promise<void>;
  onAddCertification: (certification: Record<string, unknown>) => Promise<void>;
  onRemoveCertification: (badgeId: string) => Promise<void>;
  onGenerateShareLink?: (badgeId: string) => Promise<{ shareUrl: string; expiresAt?: string }>;
}

export const CertificationBadges: React.FC<CertificationBadgesProps> = ({
  collection,
  onGenerateBadges,
  onUpdateDisplayOptions,
  onAddCertification,
  onRemoveCertification,
  onGenerateShareLink
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<CertificationBadge | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const categoryColors = {
    technical: 'from-blue-500 to-cyan-500',
    professional: 'from-green-500 to-emerald-500',
    academic: 'from-purple-500 to-pink-500',
    language: 'from-red-500 to-orange-500',
    other: 'from-gray-500 to-gray-600'
  };

  const levelIcons = {
    foundation: '🌱',
    associate: '📘',
    professional: '💼',
    expert: '🏆'
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateBadges();
      toast.success('Certification badges generated!');
    } catch {
      toast.error('Failed to generate certification badges');
    } finally {
      setIsGenerating(false);
    }
  };


  const getFilteredBadges = () => {
    if (!collection) return [];
    
    let badges = collection.badges;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      badges = badges.filter(b => b.category === selectedCategory);
    }
    
    // Filter expired if needed
    if (!collection.displayOptions.showExpired) {
      const now = new Date();
      badges = badges.filter(b => !b.expiryDate || b.expiryDate > now);
    }
    
    return badges;
  };

  const renderBadgeGrid = (badges: CertificationBadge[]) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {badges.map((badge, index) => {
          const isExpired = badge.expiryDate && badge.expiryDate < new Date();
          
          return (
            <div 
              className={`animate-fade-in relative bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                isExpired ? 'border-gray-600 opacity-60' : 'border-gray-700 hover:border-cyan-500'
              }`}
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
            >
              {/* Badge Image */}
              <div className="mb-4 relative">
                <div className="w-24 h-24 mx-auto">
                  <img 
                    src={badge.badgeImage.url} 
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Verification Status */}
                {collection?.displayOptions.showVerificationStatus && (
                  <div className={`absolute top-0 right-0 p-1 rounded-full ${
                    badge.verified ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {badge.verified ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
                
                {/* Level Icon */}
                {badge.level && (
                  <div className="absolute bottom-0 right-0 text-2xl">
                    {levelIcons[badge.level]}
                  </div>
                )}
              </div>
              
              {/* Badge Info */}
              <div className="text-center">
                <h4 className="font-semibold text-gray-100 text-sm line-clamp-2">{badge.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{badge.issuer}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(badge.issueDate).toLocaleDateString()}
                </p>
                
                {/* Expiry Warning */}
                {isExpired && (
                  <p className="text-xs text-red-400 mt-1">Expired</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderBadgeList = (badges: CertificationBadge[]) => {
    return (
      <div className="space-y-4">
        {badges.map((badge, index) => {
          const isExpired = badge.expiryDate && badge.expiryDate < new Date();
          
          return (
            <div 
              className={`animate-fade-in bg-gray-800 rounded-lg p-4 border transition-all cursor-pointer ${
                isExpired ? 'border-gray-600 opacity-60' : 'border-gray-700 hover:border-cyan-500'
              }`}
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
            >
              <div className="flex items-center gap-4">
                {/* Badge Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  <img 
                    src={badge.badgeImage.url} 
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Badge Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-100">{badge.name}</h4>
                      <p className="text-sm text-gray-400">{badge.issuer}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {badge.verified && (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                      
                      {badge.level && (
                        <div className="text-gray-400 text-sm">
                          {levelIcons[badge.level]} {badge.level}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(badge.issueDate).toLocaleDateString()}
                    </div>
                    
                    {badge.expiryDate && (
                      <div className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
                        <Clock className="w-3 h-3" />
                        {isExpired ? 'Expired' : `Expires ${new Date(badge.expiryDate).toLocaleDateString()}`}
                      </div>
                    )}
                    
                    {badge.credentialId && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        ID: {badge.credentialId}
                      </div>
                    )}
                  </div>
                  
                  {/* Skills */}
                  {badge.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {badge.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {badge.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                          +{badge.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
        <Award className="w-16 h-16 text-gray-600 mb-4 animate-pulse-slow" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Certification Badges Not Generated
        </h3>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          Generate verified badges for your professional certifications with visual representations.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 hover-glow"
        >
          {isGenerating ? (
            <>
              <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
              Generating Badges...
            </>
          ) : (
            'Generate Certification Badges'
          )}
        </button>
      </div>
    );
  }

  const filteredBadges = getFilteredBadges();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Award className="w-8 h-8 text-cyan-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{collection.statistics.totalCertifications}</div>
          <div className="text-sm text-gray-400">Total Certifications</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{collection.statistics.verifiedCertifications}</div>
          <div className="text-sm text-gray-400">Verified</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Clock className="w-8 h-8 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{collection.statistics.activeCertifications}</div>
          <div className="text-sm text-gray-400">Active</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <Shield className="w-8 h-8 text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-gray-100">{collection.statistics.skillsCovered.length}</div>
          <div className="text-sm text-gray-400">Skills Covered</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({collection.badges.length})
          </button>
          
          {Object.entries(collection.categories).map(([category, badges]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r ' + categoryColors[category as keyof typeof categoryColors] + ' text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)} ({badges.length})
            </button>
          ))}
        </div>

        {/* View Options */}
        <div className="flex items-center gap-3">
          {/* Layout Toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => onUpdateDisplayOptions({ ...collection.displayOptions, layout: 'grid' })}
              className={`p-2 rounded-lg transition-all ${
                collection.displayOptions.layout === 'grid'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onUpdateDisplayOptions({ ...collection.displayOptions, layout: 'list' })}
              className={`p-2 rounded-lg transition-all ${
                collection.displayOptions.layout === 'list'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Show Expired Toggle */}
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={collection.displayOptions.showExpired}
              onChange={(e) => onUpdateDisplayOptions({ 
                ...collection.displayOptions, 
                showExpired: e.target.checked 
              })}
              className="rounded text-cyan-600 focus:ring-cyan-500"
            />
            Show Expired
          </label>

          {/* Add Certification */}
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        </div>
      </div>

      {/* Badges Display */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {collection.displayOptions.layout === 'grid' && renderBadgeGrid(filteredBadges)}
        {collection.displayOptions.layout === 'list' && renderBadgeList(filteredBadges)}
      </div>

      {/* Top Issuers */}
      {collection.statistics.topIssuers.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Top Certification Providers</h3>
          <div className="flex flex-wrap gap-3">
            {collection.statistics.topIssuers.map(({ issuer, count }) => (
              <div key={issuer} className="bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-gray-300">{issuer}</span>
                <span className="bg-cyan-600 text-white px-2 py-0.5 rounded text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <div>
        {selectedBadge && (
          <div 
            className="animate-fade-in fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBadge(null)}
          >
            <div 
              className="animate-fade-in bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24">
                    <img 
                      src={selectedBadge.badgeImage.url} 
                      alt={selectedBadge.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100">{selectedBadge.name}</h3>
                    <p className="text-gray-400">{selectedBadge.issuer}</p>
                    {selectedBadge.level && (
                      <div className="mt-2 text-gray-300">
                        {levelIcons[selectedBadge.level]} {selectedBadge.level.charAt(0).toUpperCase() + selectedBadge.level.slice(1)} Level
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Badge Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Dates */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Issue Date</h4>
                  <p className="text-gray-300">{new Date(selectedBadge.issueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                
                {selectedBadge.expiryDate && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Expiry Date</h4>
                    <p className={selectedBadge.expiryDate < new Date() ? 'text-red-400' : 'text-gray-300'}>
                      {new Date(selectedBadge.expiryDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {selectedBadge.expiryDate < new Date() && ' (Expired)'}
                    </p>
                  </div>
                )}
                
                {/* Credential ID */}
                {selectedBadge.credentialId && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Credential ID</h4>
                    <p className="text-gray-300 font-mono">{selectedBadge.credentialId}</p>
                  </div>
                )}
                
                {/* Verification Status */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Verification Status</h4>
                  <div className="flex items-center gap-2">
                    {selectedBadge.verified ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Verified</span>
                        {selectedBadge.verificationMethod && (
                          <span className="text-gray-500 text-sm">({selectedBadge.verificationMethod})</span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400">Not Verified</span>
                        {/* <button
                          onClick={() => {
                            // TODO: Implement verification modal
                          }}
                          className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                        >
                          Verify Now
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedBadge.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Skills Validated</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBadge.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedBadge.metadata && Object.keys(selectedBadge.metadata).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Additional Information</h4>
                  <div className="space-y-1">
                    {selectedBadge.metadata.score && (
                      <p className="text-gray-300">Score: {selectedBadge.metadata.score}</p>
                    )}
                    {selectedBadge.metadata.percentile && (
                      <p className="text-gray-300">Percentile: {selectedBadge.metadata.percentile}%</p>
                    )}
                    {selectedBadge.metadata.modules && selectedBadge.metadata.modules.length > 0 && (
                      <p className="text-gray-300">Modules: {selectedBadge.metadata.modules.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {selectedBadge.verificationUrl && (
                  <a
                    href={selectedBadge.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Issuer Site
                  </a>
                )}
                
                {onGenerateShareLink && (
                  <button
                    onClick={async () => {
                      const result = await onGenerateShareLink(selectedBadge.id);
                      navigator.clipboard.writeText(result.shareUrl);
                      toast.success('Share link copied!');
                    }}
                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Badge
                  </button>
                )}
                
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to remove this certification?')) {
                      await onRemoveCertification(selectedBadge.id);
                      setSelectedBadge(null);
                      toast.success('Certification removed');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Certification Modal */}
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
              <h3 className="text-xl font-bold text-gray-100 mb-4">Add Certification</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const certification = {
                  name: formData.get('name'),
                  issuer: formData.get('issuer'),
                  date: formData.get('date'),
                  expiryDate: formData.get('expiryDate') || undefined,
                  credentialId: formData.get('credentialId') || undefined,
                  verificationUrl: formData.get('verificationUrl') || undefined
                };
                await onAddCertification(certification);
                setShowAddForm(false);
                toast.success('Certification added');
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Certification Name *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Issuing Organization *</label>
                    <input
                      name="issuer"
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Issue Date *</label>
                    <input
                      name="date"
                      type="date"
                      required
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Expiry Date (Optional)</label>
                    <input
                      name="expiryDate"
                      type="date"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Credential ID (Optional)</label>
                    <input
                      name="credentialId"
                      type="text"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                      placeholder="e.g., ABC-123-XYZ"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Verification URL (Optional)</label>
                    <input
                      name="verificationUrl"
                      type="url"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:border-cyan-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Add Certification
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