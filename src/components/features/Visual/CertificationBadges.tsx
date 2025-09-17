import React, { useState, useEffect } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  credentialId?: string;
  issueDate: string;
  expiryDate?: string;
  verificationUrl?: string;
  badgeUrl?: string;
  description: string;
  skills: string[];
  category: 'technical' | 'professional' | 'language' | 'industry' | 'academic';
  status: 'active' | 'expired' | 'pending';
  isVerified: boolean;
  credibilityScore: number;
}

interface CertificationBadgesProps extends CVFeatureProps {
  displayStyle?: 'grid' | 'list' | 'compact' | 'showcase';
  showExpired?: boolean;
  groupByCategory?: boolean;
  showVerificationLinks?: boolean;
  maxDisplay?: number;
}

const CATEGORY_COLORS = {
  technical: '#3B82F6',
  professional: '#10B981',
  language: '#F59E0B',
  industry: '#8B5CF6',
  academic: '#EF4444'
};

const CATEGORY_ICONS = {
  technical: '💻',
  professional: '🏆',
  language: '🌐',
  industry: '🏭',
  academic: '🎓'
};

export const CertificationBadges: React.FC<CertificationBadgesProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  displayStyle = 'grid',
  showExpired = false,
  groupByCategory = false,
  showVerificationLinks = true,
  maxDisplay
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date');

  const {
    data: certData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getCertificationBadges',
    { jobId, profileId, includeExpired: showExpired },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (certData) {
      setCertifications(certData.certifications || []);
      onUpdate?.(certData);
    }
  }, [certData, onUpdate]);

  const isExpired = (cert: Certification) => {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  };

  const getFilteredCertifications = () => {
    let filtered = certifications.filter(cert => {
      if (!showExpired && cert.status === 'expired') return false;
      if (filterCategory !== 'all' && cert.category !== filterCategory) return false;
      return true;
    });

    // Sort certifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    if (maxDisplay) {
      filtered = filtered.slice(0, maxDisplay);
    }

    return filtered;
  };

  const getGroupedCertifications = () => {
    const filtered = getFilteredCertifications();
    return filtered.reduce((acc, cert) => {
      if (!acc[cert.category]) acc[cert.category] = [];
      acc[cert.category].push(cert);
      return acc;
    }, {} as Record<string, Certification[]>);
  };

  const getBadgeDesign = (cert: Certification) => {
    const baseClasses = "relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer";
    const isExpiredCert = isExpired(cert);
    
    if (isExpiredCert) {
      return `${baseClasses} border-gray-300 bg-gray-50 opacity-60`;
    }
    
    switch (cert.category) {
      case 'technical':
        return `${baseClasses} border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:border-blue-400 hover:shadow-lg`;
      case 'professional':
        return `${baseClasses} border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:border-green-400 hover:shadow-lg`;
      case 'language':
        return `${baseClasses} border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:border-yellow-400 hover:shadow-lg`;
      case 'industry':
        return `${baseClasses} border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:border-purple-400 hover:shadow-lg`;
      case 'academic':
        return `${baseClasses} border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-400 hover:shadow-lg`;
      default:
        return `${baseClasses} border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-gray-400 hover:shadow-lg`;
    }
  };

  const getCredibilityBadge = (score: number) => {
    if (score >= 90) return { label: 'Highly Trusted', color: 'bg-green-500' };
    if (score >= 70) return { label: 'Trusted', color: 'bg-blue-500' };
    if (score >= 50) return { label: 'Verified', color: 'bg-yellow-500' };
    return { label: 'Basic', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Certification Badges">
        <LoadingSpinner message="Loading certifications..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Certification Badges">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Failed to Load Certifications</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  const filteredCertifications = getFilteredCertifications();
  const groupedCertifications = groupByCategory ? getGroupedCertifications() : {};

  if (!certifications.length) {
    return (
      <FeatureWrapper className={className} title="Certification Badges">
        <div className="text-gray-500 text-center p-8">
          <p>No certifications available</p>
        </div>
      </FeatureWrapper>
    );
  }

  return (
    <FeatureWrapper className={className} title="Professional Certifications">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="professional">Professional</option>
              <option value="language">Language</option>
              <option value="industry">Industry</option>
              <option value="academic">Academic</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'category')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {filteredCertifications.length} of {certifications.length} certifications
          </div>
        </div>

        {/* Grid Display */}
        {displayStyle === 'grid' && !groupByCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertifications.map((cert, index) => (
              <div className="animate-fade-in"
                key={cert.id}>
              <div
                className={getBadgeDesign(cert)}
                onClick={() => setSelectedCert(cert)}
              >
                {/* Verification Badge */}
                {cert.isVerified && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`w-3 h-3 rounded-full ${getCredibilityBadge(cert.credibilityScore).color}`} />
                  </div>
                )}

                {/* Expired Badge */}
                {isExpired(cert) && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      Expired
                    </span>
                  </div>
                )}

                <div className="p-4">
                  {/* Category Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[cert.category]}
                    </span>
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[cert.category] }}
                    >
                      {cert.category}
                    </span>
                  </div>

                  {/* Badge Image */}
                  {cert.badgeUrl && (
                    <div className="mb-3 flex justify-center">
                      <img
                        src={cert.badgeUrl}
                        alt={`${cert.name} badge`}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 text-sm leading-tight">
                      {cert.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {cert.issuer}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(cert.issueDate).toLocaleDateString()}
                      {cert.expiryDate && (
                        <span> - {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      )}
                    </p>

                    {/* Skills */}
                    {cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white bg-opacity-60 text-xs rounded text-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {cert.skills.length > 3 && (
                          <span className="px-2 py-1 bg-white bg-opacity-60 text-xs rounded text-gray-500">
                            +{cert.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List Display */}
        {displayStyle === 'list' && (
          <div className="space-y-3">
            {filteredCertifications.map((cert, index) => (
              <div className="animate-fade-in"
                key={cert.id}>
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCert(cert)}
              >
                <div className="flex items-center gap-4">
                  {/* Badge/Icon */}
                  <div className="flex-shrink-0">
                    {cert.badgeUrl ? (
                      <img
                        src={cert.badgeUrl}
                        alt={`${cert.name} badge`}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: CATEGORY_COLORS[cert.category] }}
                      >
                        {CATEGORY_ICONS[cert.category]}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {cert.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {cert.issuer}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.issueDate).toLocaleDateString()}
                          {cert.expiryDate && (
                            <span> - {new Date(cert.expiryDate).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {cert.isVerified && (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-green-600">
                              {getCredibilityBadge(cert.credibilityScore).label}
                            </span>
                          </div>
                        )}
                        
                        <span 
                          className="px-2 py-1 text-xs font-medium text-white rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cert.category] }}
                        >
                          {cert.category}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    {cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cert.skills.slice(0, 5).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {cert.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            +{cert.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped Display */}
        {groupByCategory && (
          <div className="space-y-6">
            {Object.entries(groupedCertifications).map(([category, certs]) => (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                  </span>
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {category} Certifications
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({certs.length})
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {certs.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <div className="flex items-center gap-3">
                        {cert.badgeUrl && (
                          <img
                            src={cert.badgeUrl}
                            alt={`${cert.name} badge`}
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {cert.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                          </p>
                        </div>
                        {cert.isVerified && (
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certification Detail Modal */}
        <div>
          {selectedCert && (
            <div className="animate-fade-in">
              }
              }
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedCert(null)}
            >
              <div className="animate-fade-in">
                }
                }
                className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {selectedCert.badgeUrl ? (
                      <img
                        src={selectedCert.badgeUrl}
                        alt={`${selectedCert.name} badge`}
                        className="w-16 h-16 object-contain"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl"
                        style={{ backgroundColor: CATEGORY_COLORS[selectedCert.category] }}
                      >
                        {CATEGORY_ICONS[selectedCert.category]}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedCert.name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedCert.issuer}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedCert.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Issue Date:</span>
                      <p className="text-gray-600">
                        {new Date(selectedCert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedCert.expiryDate && (
                      <div>
                        <span className="font-medium text-gray-900">Expiry Date:</span>
                        <p className={`${isExpired(selectedCert) ? 'text-red-600' : 'text-gray-600'}`}>
                          {new Date(selectedCert.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedCert.credentialId && (
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Credential ID:</span>
                      <p className="text-gray-600 text-sm font-mono">
                        {selectedCert.credentialId}
                      </p>
                    </div>
                  )}

                  {selectedCert.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skills Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCert.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCert.isVerified && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-green-800 font-medium text-sm">
                          Verified Certification
                        </p>
                        <p className="text-green-700 text-xs">
                          Credibility Score: {selectedCert.credibilityScore}% - {getCredibilityBadge(selectedCert.credibilityScore).label}
                        </p>
                      </div>
                    </div>
                  )}

                  {showVerificationLinks && selectedCert.verificationUrl && (
                    <div>
                      <a
                        href={selectedCert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Verify Credential
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureWrapper>
  );
};

export default CertificationBadges;