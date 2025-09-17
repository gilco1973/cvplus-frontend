import React from 'react';
import type { TemplateComponentProps } from './index';
import { BookOpen, GraduationCap, Award, Users, Calendar, MapPin, Mail, Phone, Linkedin, FileText } from 'lucide-react';
import type { CVParsedData } from '../../types/cvData';

/**
 * Academic Scholar Template Component
 * Scholarly design for educators and researchers
 * Colors: Oxford blue (#1e3a8a) + Scholarly grey (#374151)
 * Features: Research publications, grants, academic presentations, peer review
 */
export const AcademicTemplate: React.FC<TemplateComponentProps> = ({
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
  const headingClasses = 'text-2xl font-bold text-blue-900 mb-4 border-b-2 border-gray-500 pb-2';
  const subHeadingClasses = 'text-lg font-semibold text-blue-800 mb-3';
  const textClasses = 'text-gray-700 leading-relaxed';
  const accentClasses = 'text-gray-600 font-medium';

  return (
    <div className={`academic-template bg-gradient-to-br from-blue-50 to-gray-50 min-h-screen ${className}`}>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-8 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 text-white">
              {data.personalInfo?.fullName || 'Academic Scholar'}
            </h1>
            <p className="text-xl text-blue-100 mb-4">
              {data.personalInfo?.title || 'Professor & Researcher'}
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
          
          {/* Research Metrics Box */}
          <div className="bg-gray-600 rounded-lg p-4 text-center text-white ml-6">
            <div className="text-2xl font-bold">45+</div>
            <div className="text-sm">Publications</div>
            <div className="text-lg font-bold mt-2">2,000+</div>
            <div className="text-xs">Citations</div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Research Summary */}
        {data.summary && (
          <section className={sectionClasses}>
            <h2 className={headingClasses}>Research Profile</h2>
            <p className={`${textClasses} text-lg leading-relaxed`}>
              {data.summary}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Academic Positions */}
            {data.experience && data.experience.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Academic Positions</h2>
                <div className="space-y-6">
                  {data.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-gray-500 pl-6 relative">
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-500 rounded-full"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-900">{exp.title}</h3>
                          <div className="flex items-center gap-2 text-blue-800 mb-1">
                            <GraduationCap className="w-4 h-4" />
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
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Academic Achievements
                          </h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start gap-2 text-gray-700">
                                <Award className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Publications */}
            {(data as any).publications && (data as any).publications.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={headingClasses}>Selected Publications</h2>
                <div className="space-y-4">
                  {(data as any).publications.map((publication: string, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-900">
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
                        <p className="text-gray-800 font-medium leading-relaxed">{publication}</p>
                      </div>
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
                          <h3 className="text-lg font-bold text-blue-900">
                            {edu.degree} {edu.field && `in ${edu.field}`}
                          </h3>
                          <p className="text-blue-800 font-medium">{edu.institution}</p>
                          {edu.location && (
                            <p className="text-gray-600">{edu.location}</p>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Research Areas */}
            {data.skills?.categories && Object.keys(data.skills.categories).length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Research Areas</h2>
                <div className="space-y-4">
                  {Object.entries(data.skills.categories).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-blue-900 mb-2">{category}</h3>
                      <div className="space-y-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="bg-blue-100 rounded-full px-3 py-1">
                            <span className="text-blue-900 text-sm font-medium">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Awards & Honors */}
            {(data as any).awards && (data as any).awards.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Awards & Honors</h2>
                <div className="space-y-3">
                  {(data as any).awards.map((award: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Award className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900">{award.name || award}</h3>
                          {award.issuer && <p className="text-gray-700 text-sm">{award.issuer}</p>}
                          {award.year && <p className="text-gray-600 text-sm">{award.year}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Grants & Funding */}
            {(data as any).grants && (data as any).grants.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Grants & Funding</h2>
                <div className="space-y-3">
                  {(data as any).grants.map((grant: any, index: number) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-3">
                      <h3 className="font-semibold text-blue-900">{grant.title || grant}</h3>
                      {grant.amount && <p className="text-gray-700 text-sm font-medium">{grant.amount}</p>}
                      {grant.year && <p className="text-gray-600 text-sm">{grant.year}</p>}
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
                      <span className="text-blue-900 font-medium">{lang.language}</span>
                      <span className="text-gray-600 text-sm font-medium">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Memberships */}
            {data.certifications && data.certifications.length > 0 && (
              <section className={sectionClasses}>
                <h2 className={subHeadingClasses}>Professional Memberships</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-blue-900">{cert.name}</h3>
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

        {/* Research Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className={sectionClasses}>
            <h2 className={headingClasses}>Current Research Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{project.title}</h3>
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

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center rounded-b-lg">
        <p className="text-blue-100 text-sm">
          Academic CV • {data.personalInfo?.fullName} • Generated with CVPlus
        </p>
      </footer>
    </div>
  );
};