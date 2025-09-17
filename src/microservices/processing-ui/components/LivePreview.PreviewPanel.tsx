/**
 * LivePreview PreviewPanel Component
 *
 * Renders CV preview with responsive viewport simulation
 */

import React from 'react';
import { ViewportConfig, ZoomLevel } from './LivePreview.types';

interface PreviewPanelProps {
  cvData: any;
  template?: any;
  viewportConfig: ViewportConfig;
  zoomLevel: ZoomLevel;
}

export const LivePreviewPanel: React.FC<PreviewPanelProps> = ({
  cvData,
  template,
  viewportConfig,
  zoomLevel
}) => {
  const scale = zoomLevel / 100;
  const { width, height } = viewportConfig;

  return (
    <div className="flex-1 overflow-auto p-4 bg-gray-50">
      <div
        className="bg-white shadow-lg border mx-auto"
        style={{
          width: `${width * scale}px`,
          height: `${height * scale}px`
        }}
      >
        <div
          className="h-full overflow-auto p-6 space-y-6"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${width}px`,
            height: `${height}px`
          }}
        >
          {cvData.personalInfo && (
            <div>
              <h1 className="text-2xl font-bold mb-2">{cvData.personalInfo.name || 'Your Name'}</h1>
              <div className="text-gray-600 space-y-1">
                {cvData.personalInfo.email && <div>{cvData.personalInfo.email}</div>}
                {cvData.personalInfo.phone && <div>{cvData.personalInfo.phone}</div>}
                {cvData.personalInfo.location && <div>{cvData.personalInfo.location}</div>}
              </div>
            </div>
          )}

          {cvData.summary && (
            <div>
              <h2 className="text-xl font-semibold mb-2 border-b pb-1">Summary</h2>
              <p className="text-gray-700">{cvData.summary}</p>
            </div>
          )}

          {cvData.experience && cvData.experience.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 border-b pb-1">Experience</h2>
              {cvData.experience.map((exp: any, index: number) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">{exp.position}</h3>
                  <div className="text-gray-600">{exp.company} • {exp.duration}</div>
                  {exp.description && <p className="mt-1 text-gray-700">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {cvData.skills && cvData.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 border-b pb-1">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};