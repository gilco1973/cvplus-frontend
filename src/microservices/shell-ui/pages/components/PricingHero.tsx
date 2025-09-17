import { Crown } from 'lucide-react';

export const PricingHero = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full">
          <Crown className="w-8 h-8 text-white" />
        </div>
      </div>
      <h1 className="text-5xl font-bold text-neutral-100 mb-4">
        Choose Your Plan
      </h1>
      <p className="text-xl text-neutral-300 mb-2">
        Transform your CV from paper to powerful
      </p>
      <p className="text-lg text-neutral-400">
        Start free, upgrade when you need advanced features
      </p>
    </div>
  );
};