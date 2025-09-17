/**
 * LivePreview Demo Component
 *
 * Demonstrates the capabilities of the LivePreview system
 * with sample data and interactive examples
 */

import React, { useState, useCallback } from 'react';
import { Play, Download, Share, Settings } from 'lucide-react';
import { LivePreview } from '../LivePreview';

// Sample CV data for demonstration
const SAMPLE_CV_DATA = {
  personalInfo: {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson'
  },
  summary: 'Experienced full-stack developer with 5+ years of expertise in React, Node.js, and cloud technologies. Passionate about creating scalable web applications and mentoring junior developers. Strong background in agile methodologies and user-centered design.',
  experience: [
    {
      company: 'TechCorp Inc.',
      position: 'Senior Full Stack Developer',
      duration: '2022 - Present',
      description: 'Lead development of customer-facing web applications serving 100k+ users daily. Architected microservices infrastructure reducing response time by 40%.',
      achievements: [
        'Reduced application load time by 60% through optimization',
        'Mentored 3 junior developers, improving team productivity by 25%',
        'Led migration to cloud-native architecture'
      ]
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      duration: '2020 - 2022',
      description: 'Developed responsive web applications using React and TypeScript. Collaborated with UX team to implement pixel-perfect designs.',
      achievements: [
        'Built reusable component library used across 5 products',
        'Improved test coverage from 60% to 95%',
        'Implemented CI/CD pipeline reducing deployment time by 80%'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      year: '2020'
    }
  ],
  skills: [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
    'GraphQL', 'PostgreSQL', 'Jest', 'Git', 'Agile', 'Scrum'
  ]
};

const SAMPLE_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Professional',
    emoji: '💼',
    category: 'Professional',
    isPremium: false,
    description: 'Clean, modern design perfect for corporate roles'
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    emoji: '🎨',
    category: 'Creative',
    isPremium: true,
    description: 'Bold, colorful design for creative professionals'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    emoji: '✨',
    category: 'Modern',
    isPremium: false,
    description: 'Minimal design focusing on content clarity'
  }
];

export const LivePreviewDemo: React.FC = () => {
  const [cvData, setCvData] = useState(SAMPLE_CV_DATA);
  const [currentTemplate, setCurrentTemplate] = useState(SAMPLE_TEMPLATES[0]);
  const [showDemo, setShowDemo] = useState(false);
  const [demoFeatures, setDemoFeatures] = useState({
    realTimeEditing: true,
    multipleViewports: true,
    templateComparison: true,
    performanceMetrics: false
  });

  const handleDataChange = useCallback((newData: any) => {
    setCvData(newData);
    console.log('CV data updated:', newData);
  }, []);

  const handleTemplateChange = useCallback((template: any) => {
    setCurrentTemplate(template);
    console.log('Template changed:', template);
  }, []);

  const resetToDefaults = () => {
    setCvData(SAMPLE_CV_DATA);
    setCurrentTemplate(SAMPLE_TEMPLATES[0]);
  };

  const exportCV = () => {
    // Mock export functionality
    alert('CV export functionality would be implemented here');
  };

  const shareCV = () => {
    // Mock share functionality
    alert('CV sharing functionality would be implemented here');
  };

  if (!showDemo) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LivePreview System Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience real-time CV editing with split-screen preview,
            viewport simulation, and template comparison.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Real-time editing synchronization</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Multi-viewport simulation</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Zoom controls (25% - 200%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Resizable split layout</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Template comparison</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Performance monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Responsive design</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span>Accessibility features</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Demo Configuration</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {Object.entries(demoFeatures).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setDemoFeatures(prev => ({ ...prev, [feature]: e.target.checked }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDemo(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Interactive Demo
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Preview</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div><strong>Name:</strong> {SAMPLE_CV_DATA.personalInfo.name}</div>
            <div><strong>Position:</strong> {SAMPLE_CV_DATA.experience[0].position}</div>
            <div><strong>Experience:</strong> {SAMPLE_CV_DATA.experience.length} positions</div>
            <div><strong>Skills:</strong> {SAMPLE_CV_DATA.skills.length} technical skills</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Demo Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowDemo(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Overview
          </button>
          <h1 className="text-xl font-semibold text-gray-900">
            LivePreview Demo - {currentTemplate.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            onClick={exportCV}
            className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
          <button
            onClick={shareCV}
            className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            <Share className="w-4 h-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* LivePreview Component */}
      <div className="flex-1 overflow-hidden">
        <LivePreview
          cvData={cvData}
          template={currentTemplate}
          selectedFeatures={demoFeatures}
          onDataChange={handleDataChange}
          onTemplateChange={handleTemplateChange}
        />
      </div>

      {/* Demo Instructions */}
      <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-yellow-800">
            <strong>Demo Tips:</strong> Try editing content in the left panel, switching viewport modes,
            changing templates, and resizing the split layout.
          </div>
          <div className="text-xs text-yellow-600">
            Press F11 for fullscreen experience
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreviewDemo;