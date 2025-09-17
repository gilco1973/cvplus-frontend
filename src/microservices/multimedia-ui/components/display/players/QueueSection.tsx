import React from 'react';
import { Trash2, Music, Video } from 'lucide-react';
import type { QueueItem } from './types';

interface QueueSectionProps {
  queue: QueueItem[];
  onRemoveFromQueue: (queueIndex: number) => void;
  onClearQueue: () => void;
}

/**
 * QueueSection Component
 *
 * Displays the upcoming tracks queue with management controls.
 */
export const QueueSection: React.FC<QueueSectionProps> = ({
  queue,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (queue.length === 0) return null;

  return (
    <div className="p-4 border-b border-gray-200 bg-blue-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-blue-800">Up Next</h4>
        <button
          onClick={onClearQueue}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-1">
        {queue.slice(0, 3).map((item) => (
          <div
            key={item.queueIndex}
            className="flex items-center justify-between p-2 bg-white rounded-lg text-sm shadow-sm"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {item.type === 'video' ? (
                  <Video size={14} className="text-gray-400" />
                ) : (
                  <Music size={14} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{item.title}</p>
                {item.artist && (
                  <p className="text-xs text-gray-500 truncate">{item.artist}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onRemoveFromQueue(item.queueIndex)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Remove from queue"
            >
              <Trash2 size={12} className="text-gray-400" />
            </button>
          </div>
        ))}

        {queue.length > 3 && (
          <div className="text-xs text-gray-500 text-center py-1">
            +{queue.length - 3} more in queue
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueSection;