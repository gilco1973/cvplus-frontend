import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { useAuth } from '../contexts/AuthContext';
import { 
  Code2, 
  Brain, 
  Heart, 
  Globe, 
  Github, 
  ExternalLink,
  Sparkles,
  Home,
  Lightbulb,
  Users,
  BookOpen
} from 'lucide-react';
import { designSystem } from '../config/designSystem';
import toast from 'react-hot-toast';

export const AboutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Hero Section */}
      <Section variant="hero" background="gradient">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-100 mb-6">
            {t('aboutPage.title')}
          </h1>
          <p className="text-xl text-neutral-300 mb-8 max-w-3xl mx-auto">
            {t('aboutPage.subtitle')}
          </p>
        </div>
      </Section>

      {/* Main Content */}
      <Section variant="content" background="neutral-900">
        <div className="max-w-4xl mx-auto">
          {/* Creator Section */}
          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <Code2 className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-100">{t('aboutPage.creator.title')}</h2>
            </div>
            
            <div className="space-y-4 text-neutral-300">
              <p className="text-lg leading-relaxed">
                {t('aboutPage.creator.description1')}
              </p>
              
              <p className="text-lg leading-relaxed">
                {t('aboutPage.creator.description2')}
              </p>

              <div className="flex items-center gap-4 mt-6">
                <a 
                  href="https://klainert.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {t('aboutPage.creator.visitWebsite')}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a 
                  href="https://github.com/gilco1973/cvplus" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  {t('aboutPage.creator.viewGitHub')}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <Heart className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-100">{t('aboutPage.mission.title')}</h2>
            </div>
            
            <p className="text-lg text-neutral-300 leading-relaxed">
              {t('aboutPage.mission.description')}
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-100 mb-2">{t('aboutPage.values.openSource.title')}</h3>
                  <p className="text-neutral-400">
                    {t('aboutPage.values.openSource.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-100 mb-2">{t('aboutPage.values.aiPowered.title')}</h3>
                  <p className="text-neutral-400">
                    {t('aboutPage.values.aiPowered.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-100 mb-2">{t('aboutPage.values.innovation.title')}</h3>
                  <p className="text-neutral-400">
                    {t('aboutPage.values.innovation.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-100 mb-2">{t('aboutPage.values.community.title')}</h3>
                  <p className="text-neutral-400">
                    {t('aboutPage.values.community.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contributing Section */}
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-2xl p-8 border border-cyan-800/30 mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-100">{t('aboutPage.contributing.title')}</h2>
            </div>
            
            <p className="text-lg text-neutral-300 leading-relaxed mb-6">
              {t('aboutPage.contributing.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://github.com/gilco1973/cvplus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
              >
                <Github className="w-5 h-5" />
                {t('aboutPage.contributing.contributeGitHub')}
                <ExternalLink className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com/gilco1973/cvplus/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors font-medium"
              >
                {t('aboutPage.contributing.reportIssues')}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
            <h2 className="text-2xl font-bold text-neutral-100 mb-6">{t('aboutPage.techStack.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'React', 'TypeScript', 'Tailwind CSS', 'Firebase',
                'Claude AI', 'Vite', 'React Router', 'PDF Generation'
              ].map((tech) => (
                <div key={tech} className="bg-neutral-700 rounded-lg px-4 py-2 text-center text-neutral-300 text-sm font-medium">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="content" background="neutral-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-100 mb-4">
            {t('aboutPage.cta.title')}
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            {t('aboutPage.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              {t('aboutPage.cta.getStarted')}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-neutral-700 text-neutral-100 font-semibold rounded-lg shadow-lg hover:shadow-xl border border-neutral-600 transform hover:-translate-y-1 transition-all duration-200 hover:bg-neutral-600"
            >
              <Home className="inline w-5 h-5 mr-2" />
              {t('aboutPage.cta.backToHome')}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
};