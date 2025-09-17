/**
 * Testimonial Card Component
 * Individual testimonial display in different layouts
 */

import React from 'react';
import { Star, CheckCircle, ExternalLink } from 'lucide-react';
import { TestimonialCardProps } from './types';
import { getRelationshipIcon, getRelationshipColor } from './utils';

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  layout,
  showRatings,
  mode
}) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (layout === 'cards') {
    return (
      <div className="bg-white p-8 rounded-lg border shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {testimonial.avatarUrl ? (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {testimonial.name}
                </h4>
                <p className="text-gray-600">
                  {testimonial.title}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.company}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {testimonial.isVerified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}

                {testimonial.featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Featured
                  </span>
                )}
              </div>
            </div>

            {/* Relationship & Rating */}
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                getRelationshipColor(testimonial.relationship)
              }`}>
                {getRelationshipIcon(testimonial.relationship)} {testimonial.relationship}
              </span>

              {showRatings && (
                <div className="flex items-center gap-1">
                  {renderStars(testimonial.rating)}
                </div>
              )}

              <span className="text-xs text-gray-500">
                {new Date(testimonial.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Testimonial Content */}
        <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
          "{testimonial.content}"
        </blockquote>

        {/* Tags */}
        {testimonial.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {testimonial.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* LinkedIn Link */}
        {testimonial.linkedinUrl && mode === 'private' && (
          <div className="pt-4 border-t border-gray-200">
            <a
              href={testimonial.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View LinkedIn Profile
            </a>
          </div>
        )}
      </div>
    );
  }

  if (layout === 'quotes') {
    return (
      <div className="text-center py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl text-blue-200 mb-4">"</div>
          <blockquote className="text-2xl font-light text-gray-700 leading-relaxed mb-8">
            {testimonial.content}
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            {testimonial.avatarUrl && (
              <img
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {testimonial.name}
              </div>
              <div className="text-sm text-gray-600">
                {testimonial.title}, {testimonial.company}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal layout
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex items-start gap-4">
        <div className="w-2 h-16 bg-blue-500 rounded-full flex-shrink-0" />
        <div>
          <p className="text-gray-700 mb-4 italic">
            "{testimonial.content}"
          </p>
          <div className="text-sm text-gray-600">
            <strong>{testimonial.name}</strong>, {testimonial.title}
          </div>
        </div>
      </div>
    </div>
  );
};