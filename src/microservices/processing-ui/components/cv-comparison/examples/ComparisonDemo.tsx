import React, { useState } from 'react';
import { CVComparisonView } from '../CVComparisonView';

// Example data showing before/after CV improvements
const originalCV = {
  personalInfo: {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    location: 'New York, NY'
  },
  summary: 'Software developer with experience in web development.',
  experience: [
    {
      company: 'Tech Company',
      position: 'Developer',
      duration: '2020-2023',
      description: 'Worked on various projects and helped the team with development tasks.'
    },
    {
      company: 'StartupCo',
      position: 'Junior Developer',
      duration: '2019-2020',
      description: 'Assisted with coding tasks and bug fixes.'
    }
  ],
  skills: ['JavaScript', 'React', 'CSS'],
  education: [
    {
      institution: 'State University',
      degree: 'Computer Science',
      year: '2019'
    }
  ]
};

const improvedCV = {
  personalInfo: {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/johnsmith',
    github: 'github.com/johnsmith'
  },
  summary: 'Results-driven Full-Stack Software Developer with 4+ years of experience building scalable web applications. Proven track record of delivering high-quality solutions using modern technologies and agile methodologies. Passionate about clean code, user experience, and continuous learning.',
  experience: [
    {
      company: 'Tech Company',
      position: 'Senior Full-Stack Developer',
      duration: '2020-2023',
      description: 'Led development of 3 major web applications serving 10,000+ users, improving system performance by 40%. Mentored 2 junior developers and implemented CI/CD pipelines that reduced deployment time by 60%. Built responsive React applications with Node.js backends, achieving 99.9% uptime.',
      achievements: [
        'Increased application performance by 40% through code optimization',
        'Led team of 5 developers on high-priority client projects',
        'Implemented automated testing suite with 95% code coverage'
      ]
    },
    {
      company: 'StartupCo',
      position: 'Full-Stack Developer',
      duration: '2019-2020',
      description: 'Developed MVP for fintech startup that secured $2M in Series A funding. Built end-to-end features using React, Node.js, and PostgreSQL. Collaborated directly with product managers and designers to deliver user-centered solutions.',
      achievements: [
        'Built MVP that helped secure $2M Series A funding',
        'Reduced page load times by 50% through optimization'
      ]
    }
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 
    'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'CSS', 'HTML',
    'Python', 'GraphQL', 'REST APIs'
  ],
  education: [
    {
      institution: 'State University',
      degree: 'Bachelor of Science in Computer Science',
      year: '2019',
      gpa: '3.8/4.0',
      honors: ['Dean\'s List', 'Magna Cum Laude']
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2022'
    },
    {
      name: 'React Professional Certificate',
      issuer: 'Meta',
      date: '2021'
    }
  ],
  achievements: [
    'Led development team that increased customer satisfaction by 35%',
    'Implemented microservices architecture reducing server costs by 25%',
    'Open source contributor with 500+ GitHub stars across projects',
    'Speaker at 3 local tech meetups on React best practices'
  ]
};

/**
 * Demo component showing CV comparison functionality
 */
export const ComparisonDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<'original' | 'improved' | 'comparison'>('comparison');

  // Define a simple CV data structure for demo purposes
  interface DemoCVData {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin?: string;
      github?: string;
    };
    summary: string;
    experience: Array<{
      position: string;
      company: string;
      duration: string;
      description: string;
      achievements?: string[];
    }>;
    skills: string[];
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      gpa?: string;
      honors?: string[];
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
    achievements?: string[];
  }

  const SimpleCV = ({ data }: { data: DemoCVData }) => (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
          {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
        </div>
      </div>

      {/* Summary */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* Experience */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp, index: number) => (
            <div key={index} className="border-l-2 border-blue-200 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-blue-600">{exp.company}</p>
                </div>
                <span className="text-gray-500 text-sm">{exp.duration}</span>
              </div>
              <p className="text-gray-700 mb-2">{exp.description}</p>
              {exp.achievements && (
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                  {exp.achievements.map((achievement: string, i: number) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Education</h2>
        {data.education.map((edu, index: number) => (
          <div key={index}>
            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
            <p className="text-blue-600">{edu.institution}</p>
            <div className="flex gap-4 text-gray-600 text-sm">
              <span>{edu.year}</span>
              {edu.gpa && <span>GPA: {edu.gpa}</span>}
            </div>
            {edu.honors && (
              <p className="text-gray-600 text-sm mt-1">
                Honors: {edu.honors.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Certifications */}
      {data.certifications && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium text-gray-900">{cert.name}</span>
                <span className="text-gray-600">{cert.issuer} - {cert.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {data.achievements && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Key Achievements</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {data.achievements.map((achievement: string, index: number) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Demo Controls */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            CV Before/After Comparison Demo
          </h1>
          <p className="text-gray-600 mb-4">
            This demo shows how the CV comparison feature highlights improvements between 
            an original CV and an AI-enhanced version.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => setDemoMode('original')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'original'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Original CV
            </button>
            <button
              onClick={() => setDemoMode('improved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'improved'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Improved CV
            </button>
            <button
              onClick={() => setDemoMode('comparison')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                demoMode === 'comparison'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Side-by-Side Comparison
            </button>
          </div>
        </div>

        {/* Demo Content */}
        {demoMode === 'original' && <SimpleCV data={originalCV} />}
        {demoMode === 'improved' && <SimpleCV data={improvedCV} />}
        {demoMode === 'comparison' && (
          <CVComparisonView originalData={originalCV} improvedData={improvedCV}>
            <SimpleCV data={improvedCV} />
          </CVComparisonView>
        )}
      </div>
    </div>
  );
};

export default ComparisonDemo;