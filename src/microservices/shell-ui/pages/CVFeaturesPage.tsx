import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, Shield, QrCode, Clock, BarChart3, Video, FolderOpen, MessageSquare, Share2, Calendar, Globe, Trophy, Target, Zap, FileSearch, Mic, ChevronRight, Home, Users, Award, Crown } from 'lucide-react';
import { Section } from '../components/layout/Section';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus, useFeatureAccess } from '../hooks/usePremiumStatus';
import { InlinePremiumPrompt } from '../components/common/PremiumUpgradePrompt';
import { UsageLimitsDisplay } from '../components/policy/UsageLimitsDisplay';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'ai' | 'interactive' | 'visual' | 'media';
  benefits: string[];
  isPremium?: boolean;
  premiumFeature?: 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics';
}

const features: Feature[] = [
  // AI Features
  {
    id: 'ai-career-podcast',
    title: 'AI Career Podcast',
    description: 'Transform your career journey into an engaging audio narrative. Our AI creates a personalized podcast that tells your professional story in a compelling way.',
    icon: <Mic className="w-6 h-6" />,
    category: 'ai',
    isPremium: true,
    premiumFeature: 'podcast',
    benefits: [
      'Engaging audio format for recruiters on-the-go',
      'Highlights key achievements naturally',
      'Perfect for LinkedIn and portfolio sites',
      'Downloadable MP3 format'
    ]
  },
  {
    id: 'ats-optimization',
    title: 'ATS Optimization',
    description: 'Ensure your CV passes through Applicant Tracking Systems with our intelligent keyword optimization and formatting.',
    icon: <FileSearch className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      '95% ATS compatibility rate',
      'Industry-specific keyword enhancement',
      'Format optimization for parsing',
      'Score tracking and improvements'
    ]
  },
  {
    id: 'keyword-enhancement',
    title: 'Smart Keyword Enhancement',
    description: 'AI-powered keyword analysis adds industry-specific terms that recruiters and ATS systems are looking for.',
    icon: <Target className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      'Role-specific keyword suggestions',
      'Trending industry terms',
      'Natural integration into content',
      'Keyword density optimization'
    ]
  },
  {
    id: 'achievement-highlighting',
    title: 'Achievement Highlighting',
    description: 'Our AI identifies and emphasizes your key achievements, quantifying impact and showcasing results.',
    icon: <Trophy className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      'Quantified achievement metrics',
      'Impact-focused rewording',
      'STAR method formatting',
      'Visual achievement badges'
    ]
  },
  {
    id: 'privacy-mode',
    title: 'Smart Privacy Mode',
    description: 'Intelligent PII masking protects your personal information while maintaining CV effectiveness for public sharing.',
    icon: <Shield className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      'Automatic PII detection',
      'Selective information masking',
      'Public/private version toggle',
      'GDPR compliance ready'
    ]
  },
  {
    id: 'ai-chat-assistant',
    title: 'AI Chat Assistant',
    description: 'Let visitors chat with an AI that knows everything about your experience and can answer questions about your background.',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'ai',
    isPremium: true,
    premiumFeature: 'aiChat',
    benefits: [
      '24/7 availability',
      'Instant responses',
      'Privacy-aware answers',
      'Professional tone'
    ]
  },
  {
    id: 'public-profile',
    title: 'Personal Web Portal',
    description: 'Get your own custom web portal with professional URL, advanced analytics, and branding-free experience.',
    icon: <Users className="w-6 h-6" />,
    category: 'ai',
    isPremium: true,
    premiumFeature: 'webPortal',
    benefits: [
      'Custom URL',
      'Analytics tracking',
      'Privacy controls',
      'SEO optimized'
    ]
  },
  {
    id: 'skills-analytics',
    title: 'Skills Analytics',
    description: 'Interactive charts and visualizations showcase your expertise levels and skill categories dynamically.',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      'Skill categorization',
      'Proficiency levels',
      'Industry comparison',
      'Growth tracking'
    ]
  },
  {
    id: 'video-podcast',
    title: 'Video & Podcast',
    description: 'Auto-generate video introductions and career story podcasts to make your application stand out.',
    icon: <Video className="w-6 h-6" />,
    category: 'ai',
    benefits: [
      '60-second video intro',
      '5-minute career podcast',
      'Multiple styles',
      'Professional quality'
    ]
  },
  
  // Interactive Elements
  {
    id: 'qr-code',
    title: 'Dynamic QR Code',
    description: 'Embedded QR code links to your online CV, portfolio, or LinkedIn profile for instant mobile access.',
    icon: <QrCode className="w-6 h-6" />,
    category: 'interactive',
    benefits: [
      'Instant mobile access',
      'Trackable scan analytics',
      'Custom landing pages',
      'Multiple destination options'
    ]
  },
  {
    id: 'interactive-timeline',
    title: 'Interactive Career Timeline',
    description: 'Visual, clickable timeline showcases your career progression with rich media and milestone highlights.',
    icon: <Clock className="w-6 h-6" />,
    category: 'interactive',
    benefits: [
      'Visual career progression',
      'Clickable milestones',
      'Company logos and dates',
      'Achievement popups'
    ]
  },
  {
    id: 'contact-form',
    title: 'Built-in Contact Form',
    description: 'Allow recruiters to message you directly through an embedded contact form in your CV.',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'interactive',
    benefits: [
      'Direct recruiter messaging',
      'Spam protection included',
      'Email notifications',
      'Response tracking'
    ]
  },
  {
    id: 'availability-calendar',
    title: 'Interview Availability Calendar',
    description: 'Integrated calendar lets recruiters see your availability and schedule interviews directly.',
    icon: <Calendar className="w-6 h-6" />,
    category: 'interactive',
    benefits: [
      'Real-time availability display',
      'Direct interview scheduling',
      'Calendar sync integration',
      'Timezone handling'
    ]
  },
  {
    id: 'social-media-links',
    title: 'Social Media Integration',
    description: 'Clickable social media icons link to your professional profiles across platforms.',
    icon: <Share2 className="w-6 h-6" />,
    category: 'interactive',
    benefits: [
      'LinkedIn, GitHub, Portfolio links',
      'Custom icon selection',
      'Click tracking analytics',
      'Professional network showcase'
    ]
  },
  
  // Visual Enhancements
  {
    id: 'skills-visualization',
    title: 'Interactive Skills Charts',
    description: 'Transform boring skill lists into engaging visual charts, graphs, and progress bars.',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'visual',
    benefits: [
      'Radar charts for technical skills',
      'Progress bars for proficiency',
      'Skill category grouping',
      'Interactive hover details'
    ]
  },
  {
    id: 'achievements-showcase',
    title: 'Animated Achievement Cards',
    description: 'Key accomplishments displayed in eye-catching animated cards that grab attention.',
    icon: <Award className="w-6 h-6" />,
    category: 'visual',
    benefits: [
      'Attention-grabbing animations',
      'Metric visualization',
      'Before/after comparisons',
      'Impact storytelling'
    ]
  },
  {
    id: 'language-proficiency',
    title: 'Language Proficiency Visuals',
    description: 'Display language skills with intuitive visual indicators and proficiency levels.',
    icon: <Globe className="w-6 h-6" />,
    category: 'visual',
    benefits: [
      'CEFR level indicators',
      'Visual proficiency bars',
      'Native/fluent badges',
      'Multi-language support'
    ]
  },
  {
    id: 'certification-badges',
    title: 'Verified Certification Badges',
    description: 'Display professional certifications with verified badges and credential links.',
    icon: <Award className="w-6 h-6" />,
    category: 'visual',
    benefits: [
      'Official badge integration',
      'Verification links',
      'Expiry date tracking',
      'Credential showcase'
    ]
  },
  
  // Media & Portfolio
  {
    id: 'video-introduction',
    title: 'Video Introduction Section',
    description: 'Embed a personal video introduction to make a memorable first impression.',
    icon: <Video className="w-6 h-6" />,
    category: 'media',
    benefits: [
      'Personal connection building',
      'Embedded video player',
      'Multiple format support',
      'Thumbnail customization'
    ]
  },
  {
    id: 'portfolio-gallery',
    title: 'Interactive Portfolio Gallery',
    description: 'Showcase your work with an embedded portfolio gallery featuring projects and case studies.',
    icon: <FolderOpen className="w-6 h-6" />,
    category: 'media',
    benefits: [
      'Project showcase carousel',
      'Case study integration',
      'Image and video support',
      'External link connections'
    ]
  },
  {
    id: 'testimonials-carousel',
    title: 'Testimonials Carousel',
    description: 'Display recommendations and testimonials in an engaging rotating carousel format.',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'media',
    benefits: [
      'LinkedIn recommendation import',
      'Photo and title display',
      'Rotating testimonials',
      'Credibility building'
    ]
  }
];

export const CVFeaturesPage = () => {
  const navigate = useNavigate();
  const { isPremium } = usePremiumStatus();

  const featureCategories = [
    { id: 'ai', title: '🤖 AI-Powered Features', icon: <Brain className="w-5 h-5" /> },
    { id: 'interactive', title: '✨ Interactive Elements', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'visual', title: '📊 Visual Enhancements', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'media', title: '🎥 Media & Portfolio', icon: <Video className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section variant="hero" background="gradient" spacing="lg">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6 animate-fade-in-up">
            CV Enhancement Features
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Discover the powerful features that transform your traditional CV into an interactive, 
            AI-enhanced masterpiece that gets you noticed and hired faster.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 animate-fade-in-up animation-delay-300 hover-glow"
          >
            Start Creating Your CV
          </button>
        </div>
      </Section>

      {/* Features Grid */}
      <Section variant="content" background="transparent" spacing="lg">
        <div className="max-w-7xl mx-auto">
          {featureCategories.map((category, categoryIndex) => (
            <div key={category.id} className="mb-16">
              <div className="flex items-center gap-3 mb-8 animate-fade-in-left" style={{ animationDelay: `${categoryIndex * 200}ms` }}>
                <div className="p-2 bg-cyan-900/30 rounded-lg">
                  {category.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-100">{category.title}</h2>
                {category.id === 'ai' && (
                  <div className="ml-4 inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    NEW
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features
                  .filter(feature => feature.category === category.id)
                  .map((feature, featureIndex) => (
                    <div 
                      key={feature.id}
                      className={`bg-gray-800 rounded-xl p-6 border transition-all group animate-fade-in-up hover-lift ${
                        feature.isPremium 
                          ? 'border-yellow-500/30 hover:border-yellow-500' 
                          : 'border-gray-700 hover:border-cyan-500'
                      }`}
                      style={{ animationDelay: `${(categoryIndex * 200) + (featureIndex * 100) + 100}ms` }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`relative p-3 rounded-lg transition-all ${
                          feature.isPremium 
                            ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 group-hover:from-yellow-500/30 group-hover:to-yellow-600/30'
                            : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 group-hover:from-cyan-500/30 group-hover:to-blue-500/30'
                        }`}>
                          {feature.icon}
                          {feature.isPremium && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                              <Crown className="w-2.5 h-2.5 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-100">
                              {feature.title}
                            </h3>
                            {feature.isPremium && (
                              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mb-4">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Key Benefits:</h4>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                feature.isPremium ? 'text-yellow-500' : 'text-cyan-500'
                              }`} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Premium Upgrade Prompt */}
                      {feature.isPremium && !isPremium && (
                        <div className="mt-4">
                          <InlinePremiumPrompt feature={feature.title} className="text-xs" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Usage Limits Section */}
      <Section variant="content" background="transparent" spacing="md">
        <div className="max-w-4xl mx-auto">
          <UsageLimitsDisplay variant="detailed" showTitle={true} />
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="content" background="neutral-800" spacing="lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-6 animate-bounce-in">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-4 animate-fade-in-up animation-delay-100">
            Ready to Transform Your CV?
          </h2>
          <p className="text-xl text-gray-300 mb-8 animate-fade-in-up animation-delay-200">
            All these features are available with a single click. Upload your CV and let our AI work its magic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 animate-fade-in-up animation-delay-300 hover-glow"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gray-700 text-gray-100 font-semibold rounded-lg shadow-lg hover:shadow-xl border border-gray-600 transform hover:-translate-y-1 transition-all duration-200 hover:bg-gray-600 animate-fade-in-up animation-delay-400"
            >
              <Home className="inline w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </Section>
    </>
  );
};