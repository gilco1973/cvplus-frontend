import { Tag, Sparkles, Calendar } from 'lucide-react';
import type { Job } from '../../types/cv';

interface CVMetadataProps {
  job: Job;
}

export const CVMetadata = ({ job }: CVMetadataProps) => {
  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Tag className="w-5 h-5 text-cyan-500" />
          <div>
            <p className="text-sm text-gray-400">Template</p>
            <p className="font-semibold text-gray-100">
              {job.generatedCV?.template 
                ? job.generatedCV.template.charAt(0).toUpperCase() + job.generatedCV.template.slice(1)
                : 'Modern'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-500" />
          <div>
            <p className="text-sm text-gray-400">Features Applied</p>
            <p className="font-semibold text-gray-100">
              {job.appliedRecommendations?.length || job.generatedCV?.features?.length || 0} enhancements
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-cyan-500" />
          <div>
            <p className="text-sm text-gray-400">Generated</p>
            <p className="font-semibold text-gray-100">
              {formatDate(job.updatedAt || job.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};