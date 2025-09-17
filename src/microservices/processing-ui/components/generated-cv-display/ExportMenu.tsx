/**
 * Export Menu Component
 *
 * Modal for configuring and initiating CV exports in multiple formats
 * with quality options and customization settings.
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Image,
  Globe,
  Code,
  Settings,
  Printer,
  Shield,
  Zap,
  Star,
  Crown
} from 'lucide-react';

import type { ExportFormat, ExportOptions, PaperSize, ExportQuality } from './types';

interface ExportMenuProps {
  onExport: (format: ExportFormat, options?: ExportOptions) => void;
  onClose: () => void;
  availableFormats: ExportFormat[];
  loading?: boolean;
}

interface FormatInfo {
  icon: React.ComponentType<any>;
  name: string;
  description: string;
  premium?: boolean;
  recommended?: boolean;
  bestFor: string[];
}

const formatInfo: Record<ExportFormat, FormatInfo> = {
  pdf: {
    icon: FileText,
    name: 'PDF Document',
    description: 'Professional format perfect for applications and printing',
    recommended: true,
    bestFor: ['Job applications', 'Email attachments', 'Printing', 'ATS systems']
  },
  docx: {
    icon: FileText,
    name: 'Word Document',
    description: 'Editable format compatible with Microsoft Word',
    bestFor: ['Further editing', 'Collaboration', 'Template reuse']
  },
  html: {
    icon: Globe,
    name: 'Web Page',
    description: 'Interactive web version with live links and animations',
    premium: true,
    bestFor: ['Online portfolios', 'Personal websites', 'Social sharing']
  },
  png: {
    icon: Image,
    name: 'PNG Image',
    description: 'High-quality image format for social media and previews',
    bestFor: ['LinkedIn headers', 'Social media', 'Quick previews']
  },
  jpeg: {
    icon: Image,
    name: 'JPEG Image',
    description: 'Compressed image format with smaller file size',
    bestFor: ['Email signatures', 'Quick sharing', 'Mobile viewing']
  },
  json: {
    icon: Code,
    name: 'JSON Data',
    description: 'Structured data format for developers and integrations',
    premium: true,
    bestFor: ['API integrations', 'Data processing', 'Backup storage']
  }
};

/**
 * Export Menu Component
 */
export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  onClose,
  availableFormats,
  loading = false
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    paperSize: 'a4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    scale: 1,
    watermark: false,
    protection: false,
    embedFonts: true,
    optimizeImages: true,
    includeMetadata: true
  });

  const [quality, setQuality] = useState<ExportQuality>('standard');

  // Handle export
  const handleExport = () => {
    onExport(selectedFormat, { ...exportOptions, quality } as any);
  };

  // Get format info
  const currentFormat = formatInfo[selectedFormat];

  // Paper size options
  const paperSizes: { value: PaperSize; label: string; dimensions: string }[] = [
    { value: 'a4', label: 'A4', dimensions: '210 × 297 mm' },
    { value: 'letter', label: 'Letter', dimensions: '8.5 × 11 in' },
    { value: 'legal', label: 'Legal', dimensions: '8.5 × 14 in' },
    { value: 'a3', label: 'A3', dimensions: '297 × 420 mm' },
    { value: 'tabloid', label: 'Tabloid', dimensions: '11 × 17 in' }
  ];

  // Quality options
  const qualityOptions: { value: ExportQuality; label: string; description: string; icon: React.ComponentType<any> }[] = [
    { value: 'draft', label: 'Draft', description: 'Quick export for previewing', icon: Zap },
    { value: 'standard', label: 'Standard', description: 'Balanced quality and file size', icon: Star },
    { value: 'high', label: 'High Quality', description: 'Best quality for presentations', icon: Crown },
    { value: 'print', label: 'Print Ready', description: 'Optimized for professional printing', icon: Printer }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Export CV</h2>
            <p className="text-gray-400 mt-1">
              Choose format and configure export settings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Format selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFormats.map(format => {
                const info = formatInfo[format];
                const Icon = info.icon;
                const isSelected = format === selectedFormat;

                return (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    disabled={loading}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                            {info.name}
                          </h4>
                          {info.recommended && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                          {info.premium && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex items-center">
                              <Crown className="w-3 h-3 mr-1" />
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{info.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {info.bestFor.slice(0, 2).map(use => (
                            <span key={use} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {use}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quality selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Export Quality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {qualityOptions.map(({ value, label, description, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setQuality(value)}
                  disabled={loading}
                  className={`
                    p-3 rounded-lg border transition-all text-left
                    ${quality === value
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <p className="text-xs text-gray-400">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced options */}
          <div className="mb-8">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-4"
            >
              <Settings className="w-4 h-4" />
              <span>Advanced Options</span>
              <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {showAdvanced && (
              <div className="bg-gray-700/50 rounded-lg p-4 space-y-4">
                {/* Paper size and orientation */}
                {(selectedFormat === 'pdf' || selectedFormat === 'png' || selectedFormat === 'jpeg') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Paper Size
                      </label>
                      <select
                        value={exportOptions.paperSize}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          paperSize: e.target.value as PaperSize
                        })}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                      >
                        {paperSizes.map(size => (
                          <option key={size.value} value={size.value}>
                            {size.label} ({size.dimensions})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Orientation
                      </label>
                      <select
                        value={exportOptions.orientation}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          orientation: e.target.value as 'portrait' | 'landscape'
                        })}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Margins */}
                {(selectedFormat === 'pdf' || selectedFormat === 'png' || selectedFormat === 'jpeg') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Margins (mm)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['top', 'right', 'bottom', 'left'] as const).map(side => (
                        <div key={side}>
                          <label className="block text-xs text-gray-400 mb-1 capitalize">
                            {side}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={exportOptions.margins[side]}
                            onChange={(e) => setExportOptions({
                              ...exportOptions,
                              margins: {
                                ...exportOptions.margins,
                                [side]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options checkboxes */}
                <div className="space-y-3">
                  {selectedFormat === 'pdf' && (
                    <>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.embedFonts}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            embedFonts: e.target.checked
                          })}
                          className="rounded border-gray-500 bg-gray-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-300">Embed fonts</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exportOptions.protection}
                          onChange={(e) => setExportOptions({
                            ...exportOptions,
                            protection: e.target.checked
                          })}
                          className="rounded border-gray-500 bg-gray-600 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-gray-300 flex items-center">
                          <Shield className="w-4 h-4 mr-1" />
                          Password protection
                        </span>
                      </label>
                    </>
                  )}

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeMetadata: e.target.checked
                      })}
                      className="rounded border-gray-500 bg-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-300">Include metadata</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.optimizeImages}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        optimizeImages: e.target.checked
                      })}
                      className="rounded border-gray-500 bg-gray-600 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-300">Optimize images</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Current selection summary */}
          <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-white mb-2">Export Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Format: <span className="text-cyan-400">{currentFormat.name}</span></div>
              <div>Quality: <span className="text-cyan-400 capitalize">{quality}</span></div>
              {selectedFormat === 'pdf' && (
                <>
                  <div>Paper: <span className="text-cyan-400">{exportOptions.paperSize?.toUpperCase()}</span></div>
                  <div>Orientation: <span className="text-cyan-400 capitalize">{exportOptions.orientation}</span></div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Best for: {currentFormat.bestFor.join(', ')}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{loading ? 'Exporting...' : 'Export CV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};