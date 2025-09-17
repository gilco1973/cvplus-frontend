/**
 * Add Language Form Component
 * Modal form for adding new languages with proficiency levels
 */

import React, { useState } from 'react';
import { X, Globe, Award, Calendar, FileCheck } from 'lucide-react';
import { LanguageProficiency } from '../../types/language';

interface AddLanguageFormProps {
  onSubmit: (language: Partial<LanguageProficiency>) => Promise<void>;
  onCancel: () => void;
}

const POPULAR_LANGUAGES = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Portuguese', flag: '🇵🇹' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Korean', flag: '🇰🇷' },
  { name: 'Russian', flag: '🇷🇺' },
  { name: 'Arabic', flag: '🇸🇦' },
  { name: 'Hindi', flag: '🇮🇳' },
  { name: 'Dutch', flag: '🇳🇱' },
  { name: 'Swedish', flag: '🇸🇪' },
  { name: 'Polish', flag: '🇵🇱' },
  { name: 'Turkish', flag: '🇹🇷' }
];

const PROFICIENCY_LEVELS = [
  { 
    value: 'elementary', 
    label: 'Elementary', 
    description: 'Basic understanding and simple expressions',
    color: '#6B7280'
  },
  { 
    value: 'limited', 
    label: 'Limited Working', 
    description: 'Can handle routine work communications',
    color: '#F59E0B'
  },
  { 
    value: 'professional', 
    label: 'Professional Working', 
    description: 'Effective in professional settings',
    color: '#8B5CF6'
  },
  { 
    value: 'fluent', 
    label: 'Fluent', 
    description: 'Full proficiency in all situations',
    color: '#3B82F6'
  },
  { 
    value: 'native', 
    label: 'Native', 
    description: 'Native or bilingual proficiency',
    color: '#10B981'
  }
];

const COMMON_CERTIFICATIONS = {
  english: ['TOEFL', 'IELTS', 'TOEIC', 'Cambridge English', 'CELPIP'],
  spanish: ['DELE', 'SIELE', 'CELU'],
  french: ['DELF', 'DALF', 'TCF', 'TEF'],
  german: ['TestDaF', 'Goethe Certificate', 'telc', 'ÖSD'],
  italian: ['CELI', 'CILS', 'PLIDA'],
  portuguese: ['CELPE-Bras', 'CAPLE'],
  chinese: ['HSK', 'TOCFL'],
  japanese: ['JLPT', 'J.TEST'],
  korean: ['TOPIK'],
  russian: ['TORFL'],
  arabic: ['ALPT'],
  dutch: ['CNaVT', 'NT2'],
  default: ['Custom Certification']
};

const USAGE_CONTEXTS = [
  'Business', 'Academic', 'Technical', 'Medical', 'Legal',
  'Tourism', 'Family', 'Social', 'Literature', 'Media'
];

export const AddLanguageForm: React.FC<AddLanguageFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<LanguageProficiency>>({
    name: '',
    proficiency: 'professional',
    certifications: [],
    contexts: [],
    yearsOfExperience: 0,
    verified: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showCustomCert, setShowCustomCert] = useState(false);
  const [customCert, setCustomCert] = useState('');

  const handleLanguageSelect = (language: typeof POPULAR_LANGUAGES[0]) => {
    setFormData(prev => ({
      ...prev,
      name: language.name,
      flag: language.flag
    }));
    setCustomLanguage('');
  };

  const handleCustomLanguageSubmit = () => {
    if (customLanguage.trim()) {
      setFormData(prev => ({
        ...prev,
        name: customLanguage.trim(),
        flag: '🌍' // Generic globe emoji
      }));
    }
  };

  const handleCertificationAdd = (cert: string) => {
    if (cert && !formData.certifications?.includes(cert)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), cert]
      }));
    }
  };

  const handleCertificationRemove = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert) || []
    }));
  };

  const handleContextToggle = (context: string) => {
    const contexts = formData.contexts || [];
    const newContexts = contexts.includes(context)
      ? contexts.filter(c => c !== context)
      : [...contexts, context];
    
    setFormData(prev => ({ ...prev, contexts: newContexts }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.proficiency) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLevel = PROFICIENCY_LEVELS.find(level => level.value === formData.proficiency);
  const availableCerts = COMMON_CERTIFICATIONS[formData.name?.toLowerCase() as keyof typeof COMMON_CERTIFICATIONS] || COMMON_CERTIFICATIONS.default;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Language
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new language to your profile
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Select Language
            </label>
            
            {/* Popular Languages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {POPULAR_LANGUAGES.map((language) => (
                <button
                  key={language.name}
                  type="button"
                  onClick={() => handleLanguageSelect(language)}
                  className={`p-3 rounded-lg border transition-all text-sm ${
                    formData.name === language.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{language.flag}</div>
                  <div className="font-medium">{language.name}</div>
                </button>
              ))}
            </div>
            
            {/* Custom Language Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Or enter custom language..."
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleCustomLanguageSubmit}
                disabled={!customLanguage.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Proficiency Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Proficiency Level
            </label>
            <div className="space-y-2">
              {PROFICIENCY_LEVELS.map((level) => (
                <label key={level.value} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="proficiency"
                    value={level.value}
                    checked={formData.proficiency === level.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, proficiency: e.target.value as LanguageProficiency['proficiency'] }))}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {level.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Years of Experience
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="0"
                max="50"
                value={formData.yearsOfExperience || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Years of active use"
              />
            </div>
          </div>

          {/* Usage Contexts */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Usage Context (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {USAGE_CONTEXTS.map((context) => (
                <button
                  key={context}
                  type="button"
                  onClick={() => handleContextToggle(context)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.contexts?.includes(context)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {context}
                </button>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Certifications (Optional)
            </label>
            
            {/* Current Certifications */}
            {formData.certifications && formData.certifications.length > 0 && (
              <div className="mb-3 space-y-1">
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <span className="text-sm text-green-800 dark:text-green-200">{cert}</span>
                    <button
                      type="button"
                      onClick={() => handleCertificationRemove(cert)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Common Certifications */}
            {formData.name && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Common certifications for {formData.name}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableCerts.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => handleCertificationAdd(cert)}
                      disabled={formData.certifications?.includes(cert)}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Custom Certification */}
            <div className="flex gap-2">
              {showCustomCert ? (
                <>
                  <input
                    type="text"
                    placeholder="Enter certification name..."
                    value={customCert}
                    onChange={(e) => setCustomCert(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCert.trim()) {
                        handleCertificationAdd(customCert.trim());
                        setCustomCert('');
                        setShowCustomCert(false);
                      }
                    }}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomCert(false);
                      setCustomCert('');
                    }}
                    className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomCert(true)}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  + Add Custom Certification
                </button>
              )}
            </div>
          </div>

          {/* Verified Checkbox */}
          <div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={formData.verified || false}
                onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-green-500" />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Mark as Verified
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check if you have formal verification of this proficiency level
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.proficiency || isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Add Language
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};