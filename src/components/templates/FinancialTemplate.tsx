import React from 'react';
import type { TemplateComponentProps } from './index';
import { Building2, TrendingUp, Award, Calendar, MapPin, Mail, Phone, Linkedin, Star } from 'lucide-react';
import type { CVParsedData } from '../../types/cvData';

/**
 * Financial Expert Template Component
 * Conservative, stable design for finance sector professionals
 * Colors: Forest green (#14532d) + Gold accents (#d97706)
 * Features: Investment performance, client growth metrics, regulatory compliance
 */
export const FinancialTemplate: React.FC<TemplateComponentProps> = ({
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
  const headingClasses = 'text-2xl font-bold text-blue-900 mb-4 border-b-2 border-green-700 pb-2';
  const subHeadingClasses = 'text-lg font-semibold text-blue-800 mb-3';
  const textClasses = 'text-gray-700 leading-relaxed';
  const accentClasses = 'text-green-700 font-medium';

  return (
    <div className={`financial-template bg-gradient-to-br from-green-50 to-amber-50 min-h-screen ${className}`}>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {data.personalInfo?.fullName || 'Financial Professional'}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {data.personalInfo?.title || 'Financial Expert'}
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
          
          {/* Professional Metrics Box */}
          <div className="bg-green-700 rounded-lg p-4 text-center text-white ml-6">
            <div className="text-2xl font-bold">$500M+</div>
            <div className="text-sm">Assets Managed</div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        {data.summary && (
          <section className={sectionClasses}>
            <h2 className={headingClasses}>Executive Summary</h2>
            <p className={`${textClasses} text-lg leading-relaxed`}>
              {data.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Professional Experience */}
            {data.experience && data.experience.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Professional Experience</h2>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-amber-600 pl-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-600 rounded-full"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-green-800">{exp.title}</h3>
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <Building2 className="w-4 h-4" />
                            <span className="font-semibold">{exp.company}</span>
                          </div>
                          {exp.location && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{exp.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-amber-600 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>{exp.duration}</span>
                          </div>
                        </div>
                      </div>
                      
                      {exp.description && (
                        <p className={`${textClasses} mb-3`}>{exp.description}</p>
                      )}
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Key Financial Achievements
                          </h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start gap-2 text-gray-700">
                                <Star className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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
                              <span key={techIndex} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
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
                    <div key={index} className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-green-800">
                            {edu.degree} {edu.field && `in ${edu.field}`}
                          </h3>
                          <p className="text-green-700 font-medium">{edu.institution}</p>
                          {edu.location && (
                            <p className="text-gray-600">{edu.location}</p>
                          )}
                        </div>
                        <span className={`${accentClasses} font-bold`}>{edu.year}</span>
                      </div>
                      {edu.honors && (
                        <p className="text-amber-700 font-medium mt-2">{edu.honors}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Skills */}
            {data.skills?.categories && Object.keys(data.skills.categories).length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Core Competencies</h2>
                <div className="space-y-4">
                  {Object.entries(data.skills.categories).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-green-800 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="bg-green-100 rounded-full px-3 py-1">
                            <span className="text-green-800 text-sm font-medium">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Certifications</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-green-800">{cert.name}</h3>
                          <p className="text-amber-700 text-sm">{cert.issuer}</p>
                          <p className="text-gray-600 text-sm">{cert.year}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Languages</h2>
                <div className="space-y-2">
                  {data.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-green-800 font-medium">{lang.language}</span>
                      <span className="text-amber-600 text-sm font-medium">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className={sectionClasses}>
            <h2 className={headingClasses}>Notable Projects & Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-amber-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-2">{project.title}</h3>
                  <p className={`${textClasses} mb-3`}>{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-medium">
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

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center rounded-b-lg">
        <p className="text-blue-100 text-sm">
          Professional CV • {data.personalInfo?.fullName} • Generated with CVPlus
        </p>
      </footer>
    </div>
  );
};