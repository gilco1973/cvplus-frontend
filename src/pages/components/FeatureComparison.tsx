import { Check, Crown, Zap, Sparkles } from 'lucide-react';

interface FeatureComparisonProps {
  freeFeaturesIncluded: string[];
}

export const FeatureComparison = ({ freeFeaturesIncluded }: FeatureComparisonProps) => {
  return (
    <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 overflow-hidden max-w-6xl mx-auto mb-16">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
        <h3 className="text-2xl font-bold text-white text-center">
          Feature Comparison
        </h3>
      </div>
      
      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Core Features */}
          <div>
            <h4 className="font-semibold text-lg text-neutral-100 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Core Features
            </h4>
            <ul className="space-y-3">
              {freeFeaturesIncluded.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-neutral-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium Features */}
          <div>
            <h4 className="font-semibold text-lg text-neutral-100 mb-4 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              Premium Only
            </h4>
            <ul className="space-y-3">
              {[
                'Personal Web Portal',
                'AI Chat Assistant',
                'AI Career Podcast',
                'Advanced Analytics',
                'Priority Support'
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="text-neutral-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-lg text-neutral-100 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Benefits
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-300">Lifetime Access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-300">Cross-device Sync</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-300">No Expiration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-neutral-300">One-time Payment</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};