import { Download, FileText, Globe } from 'lucide-react';
import type { Job } from '../../types/cv';
import toast from 'react-hot-toast';

interface DownloadActionsProps {
  job: Job;
}

export const DownloadActions = ({ job }: DownloadActionsProps) => {
  const handleDownloadPDF = () => {
    if (job?.generatedCV?.pdfUrl) {
      window.open(job.generatedCV.pdfUrl, '_blank');
      toast.success('PDF download started');
    }
  };

  const handleDownloadDOCX = () => {
    if (job?.generatedCV?.docxUrl) {
      window.open(job.generatedCV.docxUrl, '_blank');
      toast.success('DOCX download started');
    }
  };

  const handleDownloadHTML = () => {
    if (job?.generatedCV?.htmlUrl) {
      window.open(job.generatedCV.htmlUrl, '_blank');
      toast.success('HTML download started');
    } else if (job?.generatedCV?.html) {
      // Create a blob and download if direct URL not available
      const blob = new Blob([job.generatedCV.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv-${job.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('HTML download started');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Download Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleDownloadPDF}
          disabled={!job.generatedCV?.pdfUrl}
          className="flex items-center gap-3 p-4 border-2 border-red-500/30 hover:border-red-400/50 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 text-red-400" />
          <div className="text-left">
            <p className="font-semibold text-gray-100">PDF Format</p>
            <p className="text-sm text-gray-400">Best for printing & sharing</p>
          </div>
        </button>

        <button
          onClick={handleDownloadDOCX}
          disabled={!job.generatedCV?.docxUrl}
          className="flex items-center gap-3 p-4 border-2 border-blue-500/30 hover:border-blue-400/50 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <p className="font-semibold text-gray-100">Word Format</p>
            <p className="text-sm text-gray-400">Editable document</p>
          </div>
        </button>

        <button
          onClick={handleDownloadHTML}
          disabled={!job.generatedCV?.html}
          className="flex items-center gap-3 p-4 border-2 border-green-500/30 hover:border-green-400/50 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Globe className="w-5 h-5 text-green-400" />
          <div className="text-left">
            <p className="font-semibold text-gray-100">HTML Format</p>
            <p className="text-sm text-gray-400">Web-ready version</p>
          </div>
        </button>
      </div>
    </div>
  );
};