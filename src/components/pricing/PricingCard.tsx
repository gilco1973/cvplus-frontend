import { Crown, Check, Loader2 } from 'lucide-react';

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: number;
  billing: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'outline' | 'disabled';
  onButtonClick: () => void;
  isLoading?: boolean;
  popular?: boolean;
  badge?: string;
  disabled?: boolean;
}

export const PricingCard = ({
  title,
  subtitle,
  price,
  billing,
  features,
  buttonText,
  buttonVariant,
  onButtonClick,
  isLoading = false,
  popular = false,
  badge,
  disabled = false
}: PricingCardProps) => {
  return (
    <div className={`
      relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl
      ${popular ? 'border-purple-500 transform scale-105' : 'border-gray-200'}
    `}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            MOST POPULAR
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            {badge && (
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                badge === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-gray-600 mb-4">{subtitle}</p>
          
          {/* Price */}
          <div className="mb-2">
            <span className="text-4xl font-bold text-gray-900">
              ${price}
            </span>
            {price > 0 && (
              <span className="text-gray-600 ml-2">{billing}</span>
            )}
          </div>
          {price === 0 && (
            <p className="text-gray-600">{billing}</p>
          )}
        </div>

        {/* Features */}
        <div className="mb-8">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Button */}
        <button
          onClick={disabled ? undefined : onButtonClick}
          disabled={isLoading || disabled}
          className={`
            w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${buttonVariant === 'primary' && !disabled
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
              : buttonVariant === 'disabled' || disabled
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-default opacity-90'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
            }
            ${(isLoading || disabled) ? 'cursor-not-allowed' : 'hover:transform hover:scale-[1.02]'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            buttonText
          )}
        </button>

        {popular && (
          <p className="text-center text-sm text-gray-500 mt-4">
            💡 Best value for professional growth
          </p>
        )}
      </div>
    </div>
  );
};