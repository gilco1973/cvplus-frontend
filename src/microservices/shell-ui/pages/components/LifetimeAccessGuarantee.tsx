import { Shield } from 'lucide-react';

export const LifetimeAccessGuarantee = () => {
  return (
    <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 p-8 mb-16 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-neutral-100 mb-4">
          🔒 Lifetime Access - Tied to Your Google Account
        </h3>
        <p className="text-neutral-300 text-lg leading-relaxed">
          Pay once, own forever. Your premium features are permanently linked to your Google account. 
          Sign in anywhere, on any device, and instantly access all premium features. No subscriptions, 
          no recurring charges, no expiration dates.
        </p>
      </div>
    </div>
  );
};