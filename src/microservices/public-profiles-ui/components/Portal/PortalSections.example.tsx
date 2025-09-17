import React, { useState } from 'react';
import { PortalSections } from './PortalSections';
import { PortalSection, PortalConfig, PortalError } from '../../../types/portal-component-props';

// Example Portal Configuration
const examplePortalConfig: PortalConfig = {
  id: 'example-portal',
  name: 'Professional Portfolio',
  description: 'A comprehensive professional portfolio showcasing skills and experience',
  visibility: 'public',
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, sans-serif',
    layout: 'modern',
    animations: true,
    darkMode: false
  },
  features: {
    aiChat: true,
    qrCode: true,
    contactForm: true,
    calendar: true,
    portfolio: true,
    socialLinks: true,
    testimonials: true,
    analytics: true
  },
  metadata: {
    title: 'John Doe - Senior Software Engineer',
    description: 'Experienced full-stack developer specializing in React, Node.js, and cloud architecture',
    keywords: ['software engineer', 'react', 'nodejs', 'typescript', 'aws']
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

// Example Sections Data
const exampleSections: PortalSection[] = [
  {
    id: 'section-header',
    name: 'Professional Header',
    type: 'header',
    data: {
      name: 'John Doe',
      title: 'Senior Software Engineer',
      photo: '/images/profile.jpg',
      location: 'San Francisco, CA',
      availability: 'Open to opportunities'
    },
    visible: true,
    order: 0,
    customization: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      alignment: 'center'
    },
    isLoading: false
  },
  {
    id: 'section-summary',
    name: 'Professional Summary',
    type: 'summary',
    data: {
      summary: 'Passionate software engineer with 8+ years of experience building scalable web applications. Expertise in React, Node.js, TypeScript, and cloud infrastructure. Led multiple teams and delivered high-impact products used by millions of users.'
    },
    visible: true,
    order: 1,
    customization: {
      fontSize: 'lg',
      fontWeight: 'medium'
    },
    isLoading: false
  },
  {
    id: 'section-experience',
    name: 'Work Experience',
    type: 'experience',
    data: {
      jobs: [
        {
          company: 'TechCorp Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: 'present',
          description: 'Leading frontend architecture and mentoring junior developers',
          technologies: ['React', 'TypeScript', 'AWS', 'GraphQL']
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          startDate: '2020-06',
          endDate: '2021-12',
          description: 'Built MVP from scratch, implemented CI/CD pipeline',
          technologies: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes']
        }
      ]
    },
    visible: true,
    order: 2,
    customization: {
      layout: 'timeline',
      showLogos: true
    },
    isLoading: false
  },
  {
    id: 'section-skills',
    name: 'Technical Skills',
    type: 'skills',
    data: {
      skills: [
        { name: 'React', level: 95, category: 'Frontend' },
        { name: 'TypeScript', level: 90, category: 'Programming' },
        { name: 'Node.js', level: 85, category: 'Backend' },
        { name: 'AWS', level: 80, category: 'Cloud' },
        { name: 'Docker', level: 75, category: 'DevOps' }
      ]
    },
    visible: true,
    order: 3,
    customization: {
      displayType: 'chart',
      showPercentages: true
    },
    isLoading: false
  },
  {
    id: 'section-projects',
    name: 'Featured Projects',
    type: 'projects',
    data: {
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with microservices architecture',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
          github: 'https://github.com/johndoe/ecommerce',
          demo: 'https://demo.ecommerce.com',
          image: '/images/project1.jpg'
        },
        {
          name: 'Task Management App',
          description: 'Real-time collaborative task management with drag-and-drop',
          technologies: ['React', 'Socket.io', 'MongoDB', 'Express'],
          github: 'https://github.com/johndoe/taskmanager',
          demo: 'https://tasks.johndoe.com',
          image: '/images/project2.jpg'
        }
      ]
    },
    visible: true,
    order: 4,
    customization: {
      layout: 'grid',
      showTechnologies: true
    },
    isLoading: false
  },
  {
    id: 'section-education',
    name: 'Education',
    type: 'education',
    data: {
      degrees: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of California, Berkeley',
          graduationYear: '2016',
          gpa: '3.8/4.0'
        }
      ],
      certifications: [
        {
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023-06',
          credentialId: 'AWS-SAA-123456'
        }
      ]
    },
    visible: false,
    order: 5,
    customization: {},
    isLoading: false
  },
  {
    id: 'section-testimonials',
    name: 'Testimonials',
    type: 'testimonials',
    data: {
      testimonials: [
        {
          text: 'John is an exceptional developer who consistently delivers high-quality solutions. His technical expertise and leadership skills make him invaluable to any team.',
          author: 'Sarah Johnson',
          position: 'Engineering Manager',
          company: 'TechCorp Inc.',
          image: '/images/testimonial1.jpg'
        },
        {
          text: 'Working with John was a pleasure. He has a deep understanding of modern web technologies and always finds elegant solutions to complex problems.',
          author: 'Mike Chen',
          position: 'CTO',
          company: 'StartupXYZ',
          image: '/images/testimonial2.jpg'
        }
      ]
    },
    visible: false,
    order: 6,
    customization: {
      layout: 'carousel',
      autoPlay: true
    },
    isLoading: false
  },
  {
    id: 'section-contact',
    name: 'Contact Information',
    type: 'contact',
    data: {
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://johndoe.dev',
      location: 'San Francisco, CA',
      availability: 'Open to new opportunities'
    },
    visible: true,
    order: 7,
    customization: {
      showAvailability: true,
      showSocialLinks: true
    },
    isLoading: false
  }
];

// Custom Section Renderers
const customRenderers = {
  // Custom Header Renderer
  header: ({ section, onUpdate }: { section: PortalSection; onUpdate?: (data: any) => void }) => (
    <div className="text-center space-y-4">
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
        {section.data.name?.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{section.data.name}</h1>
        <p className="text-xl text-blue-600 font-medium">{section.data.title}</p>
        <p className="text-gray-600">{section.data.location}</p>
        {section.data.availability && (
          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {section.data.availability}
          </span>
        )}
      </div>
    </div>
  ),

  // Custom Skills Renderer
  skills: ({ section }: { section: PortalSection }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Technical Skills</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.data.skills?.map((skill: any, index: number) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{skill.name}</span>
              <span className="text-sm text-gray-500">{skill.level}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  // Custom Projects Renderer
  projects: ({ section }: { section: PortalSection }) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Featured Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {section.data.projects?.map((project: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h4>
            <p className="text-gray-600 mb-4">{project.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies?.map((tech: string, techIndex: number) => (
                <span
                  key={techIndex}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <div className="flex gap-3">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Code
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Live Demo
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
};

// Example Component
export const PortalSectionsExample: React.FC = () => {
  const [sections, setSections] = useState<PortalSection[]>(exampleSections);
  const [error, setError] = useState<PortalError | null>(null);

  const handleSectionsReorder = (newSections: PortalSection[]) => {
    setSections(newSections);
    console.log('Sections reordered:', newSections);
  };

  const handleSectionToggle = (sectionId: string, visible: boolean) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId ? { ...section, visible } : section
      )
    );
    console.log(`Section ${sectionId} visibility:`, visible);
  };

  const handleSectionEdit = (sectionId: string, newData: any) => {
    console.log(`Editing section ${sectionId}:`, newData);
    // In a real app, this would open an edit modal or form
  };

  const handleUpdate = (data: any) => {
    console.log('Portal sections updated:', data);
  };

  const handleError = (error: Error) => {
    console.error('Portal sections error:', error);
    setError(error as PortalError);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Sections Component Example
          </h1>
          <p className="text-gray-600">
            This example demonstrates the full functionality of the PortalSections component
            with drag-and-drop reordering, visibility controls, and custom section renderers.
          </p>
        </div>

        <PortalSections
          jobId="example-job-123"
          profileId="example-profile-123"
          isEnabled={true}
          data={{}}
          customization={{
            theme: 'professional',
            showMetrics: true,
            enableInteractions: true
          }}
          onUpdate={handleUpdate}
          onError={handleError}
          className=""
          mode="private"
          portalConfig={examplePortalConfig}
          sections={sections}
          sectionConfig={{
            allowReordering: true,
            allowToggle: true,
            allowEditing: true,
            layout: 'vertical',
            spacing: 'normal',
            animations: {
              enabled: true,
              duration: 300,
              easing: 'ease-in-out'
            }
          }}
          allowReordering={true}
          allowToggle={true}
          onSectionsReorder={handleSectionsReorder}
          onSectionToggle={handleSectionToggle}
          onSectionEdit={handleSectionEdit}
          onSectionLoad={(sectionId) => console.log(`Section ${sectionId} loaded`)}
          onSectionError={(sectionId, error) => console.error(`Section ${sectionId} error:`, error)}
          customRenderers={customRenderers}
          renderOptions={{
            lazyLoad: true,
            virtualization: false,
            errorBoundaries: true,
            loadingPlaceholders: true
          }}
        />

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{error.message}</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Demonstrated</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Drag and drop section reordering
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Section visibility toggles
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Custom section renderers
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Layout and spacing configuration
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Animation controls
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Section addition and deletion
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Error handling and loading states
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Mobile-responsive design
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Accessibility features
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PortalSectionsExample;