import React, { useState } from 'react';
import { CareerTimeline } from './CareerTimeline';
import { TimelineData } from '../../../types/cv-features';

// Demo data for the CareerTimeline component
const demoTimelineData: TimelineData = {
  experiences: [
    {
      company: 'Tech Innovations Inc',
      position: 'Senior Software Engineer',
      startDate: '2022-01-15',
      endDate: undefined, // Current position
      description: 'Leading a team of 5 developers in building scalable web applications using React, TypeScript, and Node.js. Implemented microservices architecture and improved system performance by 40%.',
      achievements: [
        'Led migration to microservices architecture',
        'Reduced application load time by 60%',
        'Mentored 3 junior developers',
        'Implemented CI/CD pipeline with Docker and Kubernetes'
      ],
      location: 'San Francisco, CA',
      logo: 'https://via.placeholder.com/64x64/0066cc/ffffff?text=TI'
    },
    {
      company: 'StartupCorp',
      position: 'Full Stack Developer',
      startDate: '2020-03-01',
      endDate: '2021-12-31',
      description: 'Developed and maintained web applications using React, Express.js, and PostgreSQL. Built real-time features using WebSocket and integrated third-party APIs.',
      achievements: [
        'Built real-time chat system serving 10K+ users',
        'Integrated payment processing with Stripe',
        'Reduced API response time by 50%'
      ],
      location: 'Remote',
      logo: 'https://via.placeholder.com/64x64/ff6600/ffffff?text=SC'
    },
    {
      company: 'Digital Solutions Ltd',
      position: 'Frontend Developer',
      startDate: '2018-08-01',
      endDate: '2020-02-28',
      description: 'Created responsive user interfaces using React and Angular. Collaborated with UX designers to implement pixel-perfect designs.',
      achievements: [
        'Improved mobile responsiveness across 5 products',
        'Implemented automated testing with Jest and Cypress',
        'Reduced bundle size by 30%'
      ],
      location: 'New York, NY',
      logo: 'https://via.placeholder.com/64x64/009900/ffffff?text=DS'
    }
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Master of Science',
      field: 'Computer Science',
      graduationDate: '2018-05-15',
      gpa: '3.8',
      description: 'Specialized in Software Engineering and Machine Learning. Thesis on distributed systems optimization.',
      logo: 'https://via.placeholder.com/64x64/660099/ffffff?text=UT'
    },
    {
      institution: 'State College',
      degree: 'Bachelor of Science',
      field: 'Information Technology',
      graduationDate: '2016-05-20',
      gpa: '3.6',
      description: 'Foundation in programming, database systems, and network administration.',
      logo: 'https://via.placeholder.com/64x64/cc0066/ffffff?text=SC'
    }
  ],
  milestones: [
    {
      date: '2023-06-01',
      title: 'AWS Solutions Architect Professional',
      description: 'Achieved AWS Solutions Architect Professional certification, demonstrating expertise in designing distributed applications on AWS.',
      type: 'certification'
    },
    {
      date: '2022-11-15',
      title: 'Tech Innovation Award',
      description: 'Received company-wide recognition for developing an innovative solution that improved system efficiency by 35%.',
      type: 'achievement'
    },
    {
      date: '2021-09-01',
      title: 'Team Lead Promotion',
      description: 'Promoted to technical team lead role, responsible for mentoring junior developers and architectural decisions.',
      type: 'career'
    },
    {
      date: '2020-12-10',
      title: 'Google Cloud Professional Developer',
      description: 'Earned Google Cloud Professional Developer certification, showcasing skills in cloud-native application development.',
      type: 'certification'
    }
  ]
};

export const CareerTimelineDemo: React.FC = () => {
  const [customization, setCustomization] = useState({
    layout: 'vertical' as 'vertical' | 'horizontal',
    showDates: true,
    showLogos: true,
    animateOnScroll: true,
    showDuration: true,
    groupByYear: false
  });

  const handleCustomizationChange = (key: string, value: any) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Career Timeline Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive timeline showcasing professional journey with achievements and milestones
        </p>
      </div>

      {/* Customization Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Customization Options
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Layout
            </label>
            <select
              value={customization.layout}
              onChange={(e) => handleCustomizationChange('layout', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showDates"
              checked={customization.showDates}
              onChange={(e) => handleCustomizationChange('showDates', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showDates" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Dates
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLogos"
              checked={customization.showLogos}
              onChange={(e) => handleCustomizationChange('showLogos', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showLogos" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Logos
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="animateOnScroll"
              checked={customization.animateOnScroll}
              onChange={(e) => handleCustomizationChange('animateOnScroll', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="animateOnScroll" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Animate on Scroll
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showDuration"
              checked={customization.showDuration}
              onChange={(e) => handleCustomizationChange('showDuration', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="showDuration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Duration
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="groupByYear"
              checked={customization.groupByYear}
              onChange={(e) => handleCustomizationChange('groupByYear', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="groupByYear" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Group by Year
            </label>
          </div>
        </div>
      </div>

      {/* Timeline Component */}
      <CareerTimeline
        jobId="demo-job-id"
        profileId="demo-profile-id"
        data={demoTimelineData}
        customization={customization}
        mode="preview"
        className="shadow-lg"
        onUpdate={(data) => console.log('Timeline updated:', data)}
        onError={(error) => console.error('Timeline error:', error)}
      />

      {/* Usage Code Example */}
      <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold text-white mb-4">Usage Example</h2>
        <pre className="text-green-400 text-sm">
{`import { CareerTimeline } from './components/features/Interactive/CareerTimeline';
import { TimelineData } from './types/cv-features';

const timelineData: TimelineData = {
  experiences: [/* your experience data */],
  education: [/* your education data */],
  milestones: [/* your milestone data */]
};

<CareerTimeline
  jobId="your-job-id"
  profileId="your-profile-id"
  data={timelineData}
  customization={{
    layout: 'vertical',
    showDates: true,
    showLogos: true,
    animateOnScroll: true,
    showDuration: true,
    groupByYear: false
  }}
  mode="public"
  onUpdate={(data) => console.log('Updated:', data)}
  onError={(error) => console.error('Error:', error)}
/>`}
        </pre>
      </div>

      {/* Features List */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
          Features Included
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Interactive timeline with clickable items
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Detailed popup with achievements
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Smooth animations and transitions
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Responsive design (mobile/desktop)
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Date calculations and formatting
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Company logos with fallbacks
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Statistics and analytics display
            </li>
            <li className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Accessibility features (ARIA, keyboard nav)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};