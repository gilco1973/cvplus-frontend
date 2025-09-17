import React from 'react';
import type { TemplateComponentProps } from './index';
import { Globe, Languages, Award, Users, Calendar, MapPin, Mail, Phone, Linkedin, Briefcase, Star } from 'lucide-react';
import type { CVParsedData } from '../../types/cvData';

/**
 * International Professional Template Component
 * Universal design for global and multicultural roles
 * Colors: International blue (#1e40af) + Cultural grey (#6b7280)
 * Features: Global experience, cross-cultural competencies, language skills
 */
export const InternationalTemplate: React.FC<TemplateComponentProps> = ({
  cvData,
  template,
  isEditing,
  selectedFeatures,
  onSectionEdit,
  showFeaturePreviews,
  className = ''
}) => {
  const data = cvData as CVParsedData;
  const colors = template.colors;

  const sectionClasses = 'mb-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6';
  const headingClasses = 'text-2xl font-bold text-blue-800 mb-4 border-b-2 border-green-600 pb-2';
  const subHeadingClasses = 'text-lg font-semibold text-blue-700 mb-3';
  const textClasses = 'text-gray-700 leading-relaxed';
  const accentClasses = 'text-green-600 font-medium';

  return (
    <div className={`international-template bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen ${className}`}>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-700 text-white p-8 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {data.personalInfo?.fullName || 'International Professional'}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {data.personalInfo?.title || 'Global Business Expert'}
            </p>
            
            {/* Contact Information */}
            <div className="flex flex-wrap gap-4 text-blue-100">
              {data.personalInfo?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
              {data.personalInfo?.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  <span>{data.personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Global Experience Metrics */}
          <div className="flex gap-4 ml-6">
            <div className="bg-green-600 rounded-lg p-4 text-center text-white">
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm">Countries</div>
            </div>
            <div className="bg-blue-700 rounded-lg p-4 text-center text-white">
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm">Languages</div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        {data.summary && (
          <section className={sectionClasses}>
            <h2 className={headingClasses}>Professional Profile</h2>
            <p className={`${textClasses} text-lg leading-relaxed`}>
              {data.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* International Experience */}
            {data.experience && data.experience.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Global Experience</h2>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-gray-500 pl-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-500 rounded-full"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-800">{exp.title}</h3>
                          <div className="flex items-center gap-2 text-blue-700 mb-1">
                            <Briefcase className="w-4 h-4" />
                            <span className="font-semibold">{exp.company}</span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Globe className="w-4 h-4" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>{exp.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className={`${textClasses} mb-3`}>{exp.description}</p>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Global Achievements
                          </h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start gap-2 text-gray-700">
                                <Globe className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-blue-800">
                            {edu.degree} {edu.field && `in ${edu.field}`}
                          </h3>
                          <p className="text-blue-700 font-medium">{edu.institution}</p>
                          {edu.location && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Globe className="w-4 h-4" />
                              <span>{edu.location}</span>
                            </div>
                          )}
                        </div>
                        <span className={`${accentClasses} font-bold`}>{edu.year}</span>
                      </div>
                      {edu.honors && (
                        <p className="text-gray-700 font-medium mt-2">{edu.honors}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* International Projects */}
            {data.projects && data.projects.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Global Projects & Initiatives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.projects.map((project, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">{project.title}</h3>
                      <p className={`${textClasses} mb-3`}>{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Languages - Featured prominently */}
            {data.languages && data.languages.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Language Proficiency</h2>
                <div className="space-y-3">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-blue-700" />
                          <span className="font-semibold text-blue-800">{lang.language}</span>
                        </div>
                        <span className="text-gray-600 text-sm font-medium">{lang.proficiency}</span>
                      </div>
                      {/* Proficiency bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: lang.proficiency === 'Native' ? '100%' :
                                   lang.proficiency === 'Fluent' ? '90%' :
                                   lang.proficiency === 'Advanced' ? '75%' :
                                   lang.proficiency === 'Intermediate' ? '60%' : '40%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cross-Cultural Skills */}
            {data.skills?.categories && Object.keys(data.skills.categories).length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Global Competencies</h2>
                <div className="space-y-4">
                  {Object.entries(data.skills.categories).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-blue-800 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-gray-800 text-sm font-medium">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cultural Adaptability */}
            <section className={sectionClasses}>
              <h2 className={subHeadingClasses}>Cultural Experience</h2>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-100 to-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-6 h-6 text-blue-700" />
                    <span className="font-bold text-blue-800">Geographic Reach</span>
                  </div>
                  <div className="text-xl font-bold text-gray-600">20+ Countries</div>
                  <div className="text-sm text-gray-600">4 Continents</div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-100 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-gray-600" />
                    <span className="font-bold text-blue-800">Team Leadership</span>
                  </div>
                  <div className="text-xl font-bold text-blue-700">95%</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
              </div>
            </section>

            {/* International Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>International Qualifications</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-800">{cert.name}</h3>
                          <p className="text-gray-700 text-sm">{cert.issuer}</p>
                          <p className="text-gray-600 text-sm">{cert.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white p-4 text-center rounded-b-lg">
        <p className="text-blue-100 text-sm">
          International Professional CV • {data.personalInfo?.fullName} • Generated with CVPlus
        </p>
      </footer>
    </div>
  );
};