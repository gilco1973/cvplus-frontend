export const PricingFAQ = () => {
  const faqItems = [
    {
      question: "What does \"lifetime access\" mean?",
      answer: "Pay once, own forever. Your premium features are permanently tied to your Google account. No recurring charges, no expiration dates, no subscriptions to manage."
    },
    {
      question: "Can I access premium features on multiple devices?",
      answer: "Yes! Once you upgrade, simply sign in with your Google account on any device to instantly access all premium features. Works on desktop, tablet, and mobile."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. All payments are processed securely through Stripe."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-3xl font-bold text-neutral-100 text-center mb-12">
        Frequently Asked Questions
      </h3>
      
      <div className="grid gap-6">
        {faqItems.map((item, index) => (
          <div key={index} className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
            <h4 className="font-semibold text-neutral-100 mb-2">
              {item.question}
            </h4>
            <p className="text-neutral-300">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};