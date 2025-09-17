import React, { useState } from 'react';
import { AIPodcastPlayer } from '../AI-Powered/AIPodcastPlayer';
import { PodcastData } from '../../../types/cv-features';

export const AIPodcastPlayerExample: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<'minimal' | 'full' | 'compact'>('full');
  const [showTranscript, setShowTranscript] = useState(true);
  const [showDownload, setShowDownload] = useState(true);
  const [generationStatus, setGenerationStatus] = useState<'pending' | 'generating' | 'completed' | 'failed'>('completed');

  // Sample podcast data
  const samplePodcastData: PodcastData = {
    audioUrl: generationStatus === 'completed' ? 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' : undefined,
    transcript: `Welcome to your AI-generated career podcast. My name is Alex, and I'm here to tell the story of an exceptional professional journey.
    
    Today, we're exploring a career that spans multiple industries and showcases remarkable adaptability. From early beginnings in software development to leadership roles in product management, this is a story of continuous growth and innovation.
    
    Let's start at the beginning. Our subject began their career as a junior software developer, where they quickly distinguished themselves through their problem-solving abilities and passion for clean, efficient code.
    
    What's particularly impressive is how they transitioned from technical roles into strategic positions, demonstrating both technical depth and business acumen. This combination is rare and valuable in today's market.
    
    Throughout their journey, they've consistently shown leadership qualities, mentoring junior developers and driving successful project outcomes. Their experience with agile methodologies and cross-functional collaboration has been instrumental in their success.
    
    The most recent achievements include leading a digital transformation initiative that resulted in 40% efficiency improvements and implementing cutting-edge technologies that positioned their organization as an industry leader.
    
    What sets this professional apart is not just their technical skills, but their ability to communicate complex concepts to stakeholders at all levels. This has made them an invaluable bridge between technical and business teams.
    
    Looking ahead, their career trajectory points toward executive leadership roles where they can leverage their unique combination of technical expertise and strategic thinking.
    
    Thank you for listening to this AI-generated career narrative. This podcast demonstrates how artificial intelligence can help professionals tell their career stories in engaging and compelling ways.`,
    duration: 180,
    title: 'AI Career Journey: From Developer to Strategic Leader',
    description: 'An AI-generated narrative exploring a professional journey from software development to strategic leadership roles.',
    generationStatus
  };

  const handleError = (error: Error) => {
    console.error('AIPodcastPlayer error:', error);
  };

  const handleUpdate = (data: any) => {
    console.log('AIPodcastPlayer update:', data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Podcast Player Component
        </h1>
        <p className="text-gray-600">
          Interactive demo of the AIPodcastPlayer React component with various customization options.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Customization Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={currentTheme}
              onChange={(e) => setCurrentTheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="minimal">Minimal</option>
              <option value="full">Full</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          {/* Generation Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Status
            </label>
            <select
              value={generationStatus}
              onChange={(e) => setGenerationStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="generating">Generating</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Show Transcript Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Transcript
            </label>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showTranscript
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showTranscript ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Show Download Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show Download
            </label>
            <button
              onClick={() => setShowDownload(!showDownload)}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showDownload
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showDownload ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>

      {/* Component Demo */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Live Demo</h2>
        
        <AIPodcastPlayer
          jobId="demo-job-123"
          profileId="demo-profile-456"
          data={samplePodcastData}
          customization={{
            theme: currentTheme,
            showTranscript,
            showDownload,
            autoplay: false
          }}
          onError={handleError}
          onUpdate={handleUpdate}
          mode="preview"
          className="border-2 border-dashed border-blue-300"
        />
      </div>

      {/* Feature Overview */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Component Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Audio Controls</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Play/Pause with keyboard support</li>
              <li>• Seek bar with progress visualization</li>
              <li>• Volume control with mute toggle</li>
              <li>• Playback speed adjustment (0.5x - 2x)</li>
              <li>• Skip forward/backward (10 seconds)</li>
              <li>• Restart and replay functionality</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Advanced Features</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Interactive transcript with highlighting</li>
              <li>• Click-to-seek on transcript segments</li>
              <li>• Download audio file option</li>
              <li>• Social sharing with fallback</li>
              <li>• Generation state management</li>
              <li>• Responsive design & accessibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto">
{`import { AIPodcastPlayer } from '../features/AI-Powered/AIPodcastPlayer';

const MyComponent = () => {
  const podcastData = {
    audioUrl: 'https://example.com/podcast.mp3',
    transcript: 'Your podcast transcript...',
    duration: 180,
    title: 'My Career Podcast',
    description: 'An AI-generated career narrative',
    generationStatus: 'completed'
  };

  return (
    <AIPodcastPlayer
      jobId="job-123"
      profileId="profile-456"
      data={podcastData}
      customization={{
        theme: 'full',
        showTranscript: true,
        showDownload: true,
        autoplay: false
      }}
      onError={(error) => console.error(error)}
      onUpdate={(data) => console.log(data)}
      mode="private"
    />
  );
};`}
        </pre>
      </div>
    </div>
  );
};