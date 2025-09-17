import { FAQItem, FAQCategory } from '../components/pages/FAQ/types';

/**
 * Comprehensive FAQ data for CVPlus - AI-powered CV transformation platform
 * Organized by categories with realistic, CVPlus-specific content
 * Optimized for search performance and user experience
 */

// Branded types for type safety
export type FAQId = string & { readonly __brand: 'FAQId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };

export const createFAQId = (id: string): FAQId => id as FAQId;
export const createCategoryId = (id: string): CategoryId => id as CategoryId;

// CVPlus FAQ Categories with proper branding and metadata
export const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: createCategoryId('getting-started'),
    name: 'Getting Started',
    description: 'Everything you need to know to begin transforming your CV with CVPlus AI',
    icon: 'rocket',
    color: 'blue',
    count: 12
  },
  {
    id: createCategoryId('ai-features'),
    name: 'AI Features',
    description: 'Learn about our powerful AI-driven CV enhancement and analysis tools',
    icon: 'brain',
    color: 'purple',
    count: 15
  },
  {
    id: createCategoryId('file-formats'),
    name: 'File Formats & Upload',
    description: 'Supported file formats, upload requirements, and technical specifications',
    icon: 'file',
    color: 'green',
    count: 8
  },
  {
    id: createCategoryId('privacy-security'),
    name: 'Privacy & Security',
    description: 'Your data protection, privacy policies, and security measures',
    icon: 'shield',
    color: 'red',
    count: 10
  },
  {
    id: createCategoryId('pricing-billing'),
    name: 'Pricing & Billing',
    description: 'Subscription plans, billing information, and premium features',
    icon: 'dollar-sign',
    color: 'yellow',
    count: 9
  },
  {
    id: createCategoryId('integrations'),
    name: 'Integrations',
    description: 'Calendar integration, portfolio connections, and third-party services',
    icon: 'link',
    color: 'indigo',
    count: 7
  },
  {
    id: createCategoryId('troubleshooting'),
    name: 'Troubleshooting',
    description: 'Common issues, error resolution, and technical support',
    icon: 'wrench',
    color: 'orange',
    count: 11
  },
  {
    id: createCategoryId('multimedia'),
    name: 'Multimedia Features',
    description: 'Video introductions, podcasts, portfolio galleries, and interactive elements',
    icon: 'play',
    color: 'pink',
    count: 6
  }
];

// Comprehensive CVPlus FAQ content with realistic data
export const FAQ_DATA: FAQItem[] = [
  // Getting Started Category
  {
    id: createFAQId('getting-started-001'),
    question: 'How do I upload my CV to CVPlus?',
    answer: `You can upload your CV in several ways:

**Upload Methods:**
1. **Drag and Drop**: Simply drag your PDF, Word, or text file onto the upload area
2. **Browse Files**: Click the "Browse Files" button and select your CV from your computer
3. **Paste Text**: Copy and paste your CV content directly into the text area

**Supported Formats:**
• PDF files (recommended for best formatting preservation)
• Microsoft Word (.doc, .docx)
• Plain text (.txt)
• Rich text format (.rtf)

**Technical Specifications:**
• Maximum file size: 10MB
• Processing time: Usually under 30 seconds
• Supported languages: English, Spanish, French, German, and more

Once uploaded, our AI will analyze your CV structure, content quality, and provide personalized recommendations for improvement based on industry standards and ATS optimization.`,
    category: createCategoryId('getting-started'),
    tags: ['upload', 'file formats', 'PDF', 'Word', 'drag and drop'],
    priority: 'high',
    lastUpdated: '2024-08-15',
  },
  {
    id: createFAQId('getting-started-002'),
    question: 'What happens after I upload my CV?',
    answer: `After uploading your CV, CVPlus AI performs comprehensive analysis:

**Immediate Processing (0-30 seconds):**
• Text extraction and structure analysis
• Grammar and spelling check
• Format and layout evaluation
• ATS compatibility assessment

**AI Analysis Phase (30-60 seconds):**
• Industry-specific keyword analysis
• Skills gap identification
• Achievement quantification suggestions
• Professional tone assessment
• Content optimization recommendations

**Results Delivery:**
• Detailed analysis report with scores
• Personalized improvement suggestions
• Industry benchmarking insights
• ATS optimization recommendations
• Interactive CV preview with enhancements

You'll receive email notifications at each stage, and can track progress in real-time through the processing dashboard.`,
    category: createCategoryId('getting-started'),
    tags: ['processing', 'analysis', 'AI', 'timeline', 'results'],
    priority: 'high',
    lastUpdated: '2024-08-12',
  },
  {
    id: createFAQId('getting-started-003'),
    question: 'How long does CV analysis take?',
    answer: `CVPlus analysis times vary by CV complexity and features selected:

**Standard Analysis:** 30-90 seconds
• Basic text analysis and suggestions
• Grammar and formatting improvements
• ATS compatibility check

**Advanced Analysis:** 2-5 minutes
• Industry-specific optimization
• Skills matching and gap analysis
• Achievement quantification
• Comprehensive benchmarking

**Premium Features:** 3-10 minutes
• Video introduction generation
• Podcast creation
• Interactive timeline creation
• Portfolio gallery optimization

**Factors Affecting Processing Time:**
• CV length and complexity
• Number of jobs and achievements
• Selected enhancement features
• Current system load (usually minimal impact)

You'll see real-time progress updates and can continue browsing while processing completes.`,
    category: createCategoryId('getting-started'),
    tags: ['processing time', 'analysis', 'timeline', 'premium features'],
    priority: 'medium',
    lastUpdated: '2024-08-10',
  },

  // AI Features Category
  {
    id: createFAQId('ai-features-001'),
    question: 'What AI features are available in CVPlus?',
    answer: `CVPlus offers comprehensive AI-powered features to transform your CV:

**Content Analysis & Enhancement:**
• Grammar and spell checking with context awareness
• Professional tone analysis and improvement suggestions
• Keyword optimization for ATS systems
• Skills gap identification based on industry standards
• Achievement quantification and impact measurement

**Industry Intelligence:**
• Industry-specific content recommendations
• Role-based keyword optimization
• Salary benchmarking and market insights
• Career progression pathway analysis
• Competitive positioning assessment

**Interactive Features:**
• Dynamic QR code generation for digital profiles
• Interactive timeline of career progression
• Multimedia portfolio gallery integration
• Video introduction script and generation
• Professional podcast creation from CV content

**ATS Optimization:**
• Applicant Tracking System compatibility analysis
• Keyword density optimization
• Format structure recommendations
• Parsing success probability scoring
• Multi-ATS testing and validation

All features use advanced machine learning models to provide CV enhancement recommendations.`,
    category: createCategoryId('ai-features'),
    tags: ['AI analysis', 'ATS optimization', 'content enhancement', 'machine learning'],
    priority: 'high',
    lastUpdated: '2024-08-16',
  },
  {
    id: createFAQId('ai-features-002'),
    question: 'How accurate is the AI analysis?',
    answer: `CVPlus uses advanced AI analysis to provide CV enhancement recommendations through machine learning:

CVPlus uses advanced AI analysis to provide CV enhancement recommendations. Our system analyzes content structure, formatting, and provides suggestions for improvement based on industry best practices and ATS compatibility requirements.

The AI analysis includes grammar checking, professional tone assessment, keyword optimization, and skills identification to help improve your CV's effectiveness.`,
    category: createCategoryId('ai-features'),
    tags: ['accuracy', 'machine learning', 'validation', 'success rates'],
    priority: 'high',
    lastUpdated: '2024-08-14',
  },

  // Privacy & Security Category
  {
    id: createFAQId('privacy-security-001'),
    question: 'How is my CV data protected and stored?',
    answer: `CVPlus implements enterprise-grade security to protect your sensitive career information:

**Data Encryption:**
• AES-256 encryption for data at rest
• TLS 1.3 for data in transit
• End-to-end encryption for sensitive documents
• Zero-knowledge architecture for premium users
• Encrypted backup systems with geographic distribution

**Access Controls:**
• Multi-factor authentication (MFA) required
• Role-based access control (RBAC)
• IP allowlisting for enterprise accounts
• Session management with automatic timeout
• Audit logging for all data access

**Data Storage & Retention:**
• Data stored in SOC 2 Type II certified facilities
• Geographic data residency options available
• Automated data retention policy enforcement
• Secure data deletion with cryptographic wiping
• Regular security penetration testing

**Compliance Standards:**
• GDPR compliant with data portability rights
• CCPA compliant for California residents
• SOC 2 Type II certified security controls
• ISO 27001 information security standards
• Regular third-party security audits

**Privacy Guarantees:**
• Your data is never sold to third parties
• No advertising or marketing use of CV content
• Optional anonymous mode for analysis
• Complete data export and deletion available
• Transparent privacy policy with plain language explanations`,
    category: createCategoryId('privacy-security'),
    tags: ['data protection', 'encryption', 'GDPR', 'SOC2', 'privacy'],
    priority: 'high',
    lastUpdated: '2024-08-18',
  },

  // File Formats Category
  {
    id: createFAQId('file-formats-001'),
    question: 'What file formats does CVPlus support?',
    answer: `CVPlus supports a wide range of file formats for maximum compatibility:

**Primary Formats (Recommended):**
• **PDF (.pdf)** - Best format preservation, recommended for final CVs
• **Microsoft Word (.docx, .doc)** - Full formatting and style support
• **Rich Text Format (.rtf)** - Cross-platform formatting compatibility

**Text Formats:**
• **Plain Text (.txt)** - Universal compatibility, basic formatting
• **Markdown (.md)** - Structured text with formatting syntax
• **LaTeX (.tex)** - Academic and technical document format

**Emerging Formats:**
• **JSON Resume** - Structured data format for tech professionals
• **XML formats** - Various structured document formats
• **Google Docs** - Direct import via shareable link

**File Size & Quality Requirements:**
• Maximum file size: 10MB per document
• Minimum text content: 50 words
• Maximum pages: 15 pages (automatically optimized)
• Image resolution: 300 DPI minimum for embedded images

**Optimization Features:**
• Automatic format conversion and cleanup
• Font standardization and embedding
• Image compression without quality loss
• ATS-friendly format generation
• Multi-format export options (PDF, Word, HTML, JSON)

**Unsupported Formats:**
• Scanned images without OCR (we provide OCR conversion)
• Password-protected files (remove protection before upload)
• Corrupted or incomplete files
• Proprietary formats from legacy software

Upload tip: For best results, use PDF or Word formats with standard fonts and clear formatting.`,
    category: createCategoryId('file-formats'),
    tags: ['PDF', 'Word', 'file formats', 'compatibility', 'upload requirements'],
    priority: 'medium',
    lastUpdated: '2024-08-11',
  },

  // Pricing Category
  {
    id: createFAQId('pricing-billing-001'),
    question: 'What are the different pricing plans available?',
    answer: `CVPlus offers flexible pricing plans to meet various professional needs:

**Free Plan - $0:**
• Up to 3 CV uploads per month
• Light parsing with basic AI suggestions (clarity, grammar, structure)
• Basic formatting only
• Always free
• Exports are limited (plain text or watermarked)
• Intended for personal use only

**Lifetime Premium - $49 One-time:**
• Unlimited refinements on your own CV
• Up to 3 unique CVs per month (unlimited iterations of each)
• Full parsing + ATS optimization
• Premium templates & layouts
• AI-generated tailored cover letters
• Career insights & industry-specific keyword suggestions
• Full document history & downloads
• Export to PDF and HTML formats
• Personal Web Portal (Custom URL)
• AI Chat Assistant (RAG-powered)
• AI Career Podcast Generation
• Advanced Analytics Dashboard
• Priority Customer Support
• Remove CVPlus Branding

**Payment Options:**
• One-time payment for lifetime premium access
• All major credit cards accepted via Stripe
• PayPal support available
• Secure payment processing via Stripe`,
    category: createCategoryId('pricing-billing'),
    tags: ['pricing', 'plans', 'lifetime', 'free trial', 'premium'],
    priority: 'high',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-002'),
    question: 'Can I use my account to improve a friend\'s CV?',
    answer: `No. Each account is licensed for personal use only. Uploading CVs that belong to someone else is against our Fair Use Policy. If you're a recruiter or coach, please explore our Professional Plan.

**Why This Policy Exists:**
• Ensures fair usage for all users
• Protects privacy and data security
• Maintains service quality and availability
• Prevents account sharing and misuse

**For Professional Use:**
If you are a career coach, recruiter, or agency, please contact us about a Professional Plan. This ensures fair usage and provides higher-volume tools designed for professional needs.`,
    category: createCategoryId('pricing-billing'),
    tags: ['fair use', 'personal use', 'professional plan', 'policy'],
    priority: 'high',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-003'),
    question: 'What does "3 unique CVs per month" mean?',
    answer: `This means you can work on up to 3 completely different CV versions per month. For example:
• One tailored for marketing roles
• One for project management positions  
• One for tech roles

**Key Points:**
• **Unlimited refinements** within each CV - polish endlessly
• **3 different versions/identities** per month maximum
• **Resets monthly** - you get 3 fresh slots each month
• **Fair use enforcement** - prevents account sharing

**Examples of "Unique CVs":**
✅ Marketing CV vs. Sales CV vs. Product Management CV
✅ Senior Developer CV vs. Tech Lead CV vs. Engineering Manager CV
✅ Different career focuses or major role changes

**Not Considered "Unique":**
❌ Minor tweaks to the same CV
❌ Updating contact information only
❌ Small formatting changes
❌ Adding one new job to existing CV`,
    category: createCategoryId('pricing-billing'),
    tags: ['unique CVs', 'monthly limit', 'refinements', 'fair use'],
    priority: 'high',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-004'),
    question: 'Why not just use ChatGPT for CV improvements?',
    answer: `ChatGPT is general-purpose. Our AI is built specifically for CVs with specialized features:

**CVPlus Advantages:**
• **ATS Optimization** - Score and optimize for Applicant Tracking Systems
• **Industry-Specific Keywords** - Tailored recommendations by field
• **Professional Templates** - ATS-friendly, modern designs
• **Format Preservation** - Maintains your CV structure and styling
• **Career Insights** - Industry benchmarking and salary data
• **Unlimited Refinements** - Perfect your CV over time
• **Export Options** - PDF, HTML, and multiple formats
• **One-Time Payment** - $49 lifetime vs. ongoing ChatGPT costs

**What ChatGPT Can't Do:**
❌ ATS compatibility scoring
❌ Industry-specific optimization
❌ Professional template application
❌ Format-aware editing
❌ Career progression analysis
❌ Direct export to job-ready formats
❌ Unlimited iterations without ongoing costs

**Bottom Line:**
ChatGPT rewrites text. CVPlus optimizes careers.`,
    category: createCategoryId('pricing-billing'),
    tags: ['ChatGPT comparison', 'ATS optimization', 'specialized AI', 'value proposition'],
    priority: 'medium',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-005'),
    question: 'Can I edit the PDF or HTML after I download it?',
    answer: `Yes, technically you can edit exported files — but they are licensed for your personal use only.

**Usage Rights:**
✅ **Personal use** - Edit for your own job applications
✅ **Format adjustments** - Modify layout, fonts, colors for personal preference
✅ **Content updates** - Add new experiences, update contact information
✅ **Multiple versions** - Create variations for different job applications

**Prohibited Uses:**
❌ **Representing others** - Editing to represent another person violates policy
❌ **Commercial redistribution** - Sharing edited files as a service
❌ **Template reselling** - Using our designs commercially
❌ **Account sharing** - Letting others use files as if they created them

**Consequences:**
Violating usage terms may result in account suspension and loss of access to your data and premium features.

**For Professional Use:**
If you need to create CVs for clients, please contact us about our Professional Plan which includes appropriate licensing for business use.`,
    category: createCategoryId('pricing-billing'),
    tags: ['file editing', 'usage rights', 'personal use', 'licensing'],
    priority: 'medium',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-006'),
    question: 'Why are free exports limited?',
    answer: `Because parsing and exporting CVs costs us money every time. To keep the Free Plan available for everyone, we limit exports and reserve full PDF/HTML downloads for Premium users.

**Free Plan Export Options:**
• Plain text format
• Watermarked PDF (CVPlus branding)
• Basic formatting only
• Limited to 3 exports per month

**Premium Plan Export Options:**
• Full PDF with complete formatting
• Professional HTML version
• Multiple format options
• Unlimited exports
• No watermarks or branding
• High-resolution output

**Why This Model Works:**
• **Sustainable Service** - Covers processing costs
• **Fair Access** - Everyone gets basic features
• **Premium Value** - Advanced users get full features
• **No Ads** - Clean experience for all users

**Running AI on CVs costs us money every time** — which is why we limit free usage. Our Lifetime Premium plan removes those limits for a single $49 payment.`,
    category: createCategoryId('pricing-billing'),
    tags: ['export limitations', 'free plan', 'premium features', 'sustainability'],
    priority: 'medium',
    lastUpdated: '2024-08-24',
  },
  {
    id: createFAQId('pricing-billing-007'),
    question: 'What does "lifetime access" mean?',
    answer: `Pay once, own forever. Your premium features are permanently tied to your Google account. No recurring charges, no expiration dates, no subscriptions to manage.

**Lifetime Access Benefits:**
• **One-Time Payment** - Single $49 payment, no recurring charges
• **Permanent Access** - Features never expire or get revoked
• **Account Binding** - Tied to your Google account for security
• **No Subscription Management** - Set it and forget it
• **Future Updates Included** - New premium features added automatically

**What's Guaranteed:**
✅ All current premium features forever
✅ New premium features as we add them
✅ No surprise billing or renewals
✅ Access from any device with your Google account
✅ Data preserved indefinitely

**Account Security:**
• Tied specifically to your Google account
• Cannot be transferred to different accounts
• Secure authentication prevents unauthorized access
• Account recovery through Google's systems

**Future-Proof Investment:**
As CVPlus grows and adds new premium features, your lifetime access automatically includes them. This means your $49 investment continues to provide more value over time without additional costs.`,
    category: createCategoryId('pricing-billing'),
    tags: ['lifetime access', 'one-time payment', 'no subscription', 'Google account', 'permanent'],
    priority: 'high',
    lastUpdated: '2024-08-25',
  },
  {
    id: createFAQId('pricing-billing-008'),
    question: 'Can I access premium features on multiple devices?',
    answer: `Yes! Once you upgrade, simply sign in with your Google account on any device to instantly access all premium features. Works on desktop, tablet, and mobile.

**Multi-Device Access:**
• **Desktop Computers** - Windows, Mac, Linux support
• **Tablets** - iPad, Android tablets with full functionality
• **Mobile Phones** - iOS and Android mobile optimization
• **Web Browsers** - Chrome, Firefox, Safari, Edge compatibility
• **Operating Systems** - Platform independent, works everywhere

**Seamless Synchronization:**
• **Cloud Storage** - All your CVs and data sync automatically
• **Real-Time Updates** - Changes on one device appear instantly on others
• **Progress Preservation** - Never lose work when switching devices
• **Settings Sync** - Preferences and customizations carry over
• **Download History** - Access all your exports from any device

**Device Management:**
• **Unlimited Devices** - No limit on number of devices
• **Automatic Sign-In** - Stay logged in across trusted devices
• **Security Controls** - Secure Google authentication on each device
• **Remote Access** - Work on your CV from anywhere with internet

**Technical Requirements:**
• Modern web browser (Chrome, Firefox, Safari, Edge)
• Internet connection for cloud sync
• JavaScript enabled
• Minimum screen resolution: 768px width

**Privacy & Security:**
• Each device uses secure Google authentication
• No device-specific data storage of sensitive information
• End-to-end encryption for data transmission
• Easy remote logout from compromised devices

Perfect for professionals who work across multiple devices or travel frequently.`,
    category: createCategoryId('pricing-billing'),
    tags: ['multi-device', 'mobile access', 'synchronization', 'cloud storage', 'Google account'],
    priority: 'high',
    lastUpdated: '2024-08-25',
  },
  {
    id: createFAQId('pricing-billing-009'),
    question: 'What payment methods do you accept?',
    answer: `We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. All payments are processed securely through Stripe.

**Accepted Payment Methods:**
• **Credit Cards** - Visa, Mastercard, American Express, Discover
• **Debit Cards** - Visa Debit, Mastercard Debit, international debit cards
• **Digital Wallets** - Apple Pay, Google Pay, PayPal (coming soon)
• **Bank Transfers** - Available for enterprise customers
• **International Cards** - Accepted from 195+ countries

**Payment Security:**
• **Stripe Processing** - Industry-leading payment security (PCI DSS Level 1)
• **SSL Encryption** - 256-bit encryption for all payment data
• **Zero Data Storage** - We never store your payment information
• **Fraud Protection** - Advanced fraud detection and prevention
• **3D Secure** - Additional security layer for supported cards

**Payment Process:**
1. **Select Plan** - Choose Lifetime Premium ($49)
2. **Secure Checkout** - Stripe-powered payment form
3. **Payment Verification** - Real-time card verification
4. **Instant Activation** - Premium features activate immediately
5. **Email Confirmation** - Receipt and activation confirmation sent

**International Support:**
• **Currency Conversion** - Automatic conversion to local currency
• **Tax Handling** - VAT/GST calculated automatically where applicable
• **Global Support** - 24/7 payment support in multiple languages
• **Regional Compliance** - Meets local payment regulations

**Refund Policy:**
• **30-Day Money-Back Guarantee** - Full refund if not satisfied
• **Instant Refund Processing** - Refunds processed within 1-2 business days
• **No Questions Asked** - Simple refund request process
• **Partial Usage OK** - Refund available even after using premium features

**Payment Support:**
If you encounter any payment issues, our support team can assist with alternative payment arrangements or troubleshoot declined transactions.`,
    category: createCategoryId('pricing-billing'),
    tags: ['payment methods', 'credit cards', 'Stripe', 'payment security', 'international payments'],
    priority: 'medium',
    lastUpdated: '2024-08-25',
  },

  // Integrations Category
  {
    id: createFAQId('integrations-001'),
    question: 'What calendar and scheduling integrations are available?',
    answer: `CVPlus seamlessly integrates with popular calendar and scheduling platforms:

**Supported Calendar Platforms:**
• **Google Calendar** - Full two-way sync with event creation
• **Calendly** - Automatic scheduling link generation
• **Microsoft Outlook** - Calendar integration and meeting scheduling
• **Apple Calendar** - iCloud sync for Mac and iOS users
• **Zoom** - Direct meeting link generation
• **Teams** - Microsoft Teams meeting integration

**Integration Features:**
• **Automatic Scheduling Links** - Generate personalized scheduling links for your CV
• **Interview Booking** - Allow employers to book interviews directly
• **Availability Display** - Show real-time availability on your digital CV
• **Time Zone Management** - Automatic time zone detection and conversion
• **Meeting Preparation** - Send CV summaries before scheduled meetings
• **Follow-up Automation** - Automated thank-you messages and CV updates

**Setup Process:**
1. Navigate to Integrations in your CVPlus dashboard
2. Select your preferred calendar platform
3. Authorize CVPlus access (read/write permissions)
4. Configure availability preferences and buffer times
5. Customize scheduling link appearance and messaging
6. Test integration with a sample booking

**Privacy & Security:**
• OAuth 2.0 secure authentication
• Minimal permissions requested (only calendar access)
• No access to email content or other personal data
• Easy revocation of access at any time
• Data sync can be paused or disabled
• All calendar data encrypted in transit and at rest

**Professional Benefits:**
• Stand out with interactive scheduling capabilities
• Reduce back-and-forth email coordination
• Show professionalism and tech-savvy approach
• Streamline the hiring process for employers
• Streamline the hiring process for employers`,
    category: createCategoryId('integrations'),
    tags: ['calendar', 'scheduling', 'Calendly', 'Google Calendar', 'interviews'],
    priority: 'medium',
    lastUpdated: '2024-08-13',
  },

  // Troubleshooting Category
  {
    id: createFAQId('troubleshooting-001'),
    question: 'Why is my CV processing taking longer than expected?',
    answer: `Several factors can affect CV processing time. Here's how to diagnose and resolve delays:

**Common Causes & Solutions:**

**Large File Size:**
• Problem: Files over 5MB process slower
• Solution: Compress images, remove unnecessary elements
• Tip: PDF files typically process faster than Word docs

**Complex Formatting:**
• Problem: Heavy graphics, tables, and custom layouts slow processing
• Solution: Use standard formatting, convert complex elements to text
• Tip: Academic CVs with publications lists may take longer

**High System Load:**
• Problem: Peak usage times (evenings, weekends) may cause delays
• Solution: Try processing during off-peak hours (early morning, weekdays)
• Status: Check our system status page for current load information

**Network Connectivity:**
• Problem: Slow or unstable internet connection
• Solution: Check connection speed, try different network
• Tip: Use incognito/private browsing to rule out browser issues

**Troubleshooting Steps:**
1. **Refresh the page** - Sometimes progress isn't updating visually
2. **Check file size** - Ensure under 10MB limit
3. **Try different format** - Convert to PDF if using Word
4. **Clear browser cache** - Refresh browser data and cookies
5. **Disable browser extensions** - Ad blockers can interfere
6. **Try different browser** - Chrome and Firefox work best

**When to Contact Support:**
• Processing stuck for more than 10 minutes
• Error messages appear during upload
• File meets all requirements but won't process
• Repeated processing failures

**Expected Processing Times:**
• Simple CV (1-2 pages): 30-60 seconds
• Standard CV (2-3 pages): 1-2 minutes
• Complex CV (3+ pages, graphics): 2-5 minutes
• Premium features enabled: Additional 2-5 minutes

Contact support if processing exceeds these timeframes significantly.`,
    category: createCategoryId('troubleshooting'),
    tags: ['processing delays', 'file size', 'formatting', 'troubleshooting'],
    priority: 'high',
    lastUpdated: '2024-08-09',
  },

  // Multimedia Features Category
  {
    id: createFAQId('multimedia-001'),
    question: 'How does the video introduction feature work?',
    answer: `CVPlus creates professional video introductions to make your CV stand out:

**Video Generation Process:**
1. **Content Analysis** - AI analyzes your CV for key talking points
2. **Script Creation** - Personalized script highlighting your strengths
3. **Visual Design** - Professional graphics and branding elements
4. **Voice Synthesis** - Natural-sounding AI voice or upload your own
5. **Video Assembly** - Combines all elements into polished video

**Customization Options:**
• **Voice Selection** - Choose from 20+ professional AI voices
• **Background Themes** - Professional, creative, or industry-specific
• **Duration Control** - 30 seconds to 3 minutes
• **Brand Colors** - Match your personal or company branding
• **Text Overlays** - Key achievements and contact information
• **Music Tracks** - Subtle background audio options

**Technical Specifications:**
• Output Format: MP4, WebM compatible
• Resolution: 1080p HD quality
• File Size: Optimized for web (typically 10-50MB)
• Aspect Ratios: 16:9 widescreen, 9:16 mobile, 1:1 square
• Subtitles: Auto-generated with editing capability
• Download Options: Direct download, social media formats

**Professional Benefits:**
• **Increased Engagement** - Video CVs provide personal connection
• **Personal Connection** - Employers see your personality
• **Modern Approach** - Shows tech-savvy and innovation
• **Accessibility** - Subtitles for hearing-impaired viewers
• **Versatility** - Use across LinkedIn, websites, email signatures

**Usage Scenarios:**
• Email signatures and networking outreach
• LinkedIn profile video and posts
• Personal website homepage
• Job application supplements
• Conference and networking events
• Social media professional content

**Privacy & Control:**
• Videos stored securely in your account
• Share only when and where you choose
• Easy regeneration with updated content
• Download for offline use
• Delete anytime from our servers

The video introduction typically generates within 5-10 minutes and can be regenerated unlimited times with Premium plans.`,
    category: createCategoryId('multimedia'),
    tags: ['video introduction', 'AI voice', 'personal branding', 'multimedia'],
    priority: 'medium',
    lastUpdated: '2024-08-16',
  }
];

// Search optimization data
export const SEARCH_KEYWORDS = [
  'upload', 'CV', 'resume', 'PDF', 'Word', 'file', 'format', 'analysis', 'AI', 'processing',
  'privacy', 'security', 'data', 'protection', 'GDPR', 'pricing', 'plans', 'free', 'premium',
  'integration', 'calendar', 'scheduling', 'video', 'multimedia', 'troubleshooting', 'help',
  'ATS', 'optimization', 'keywords', 'skills', 'job search', 'hiring', 'employers'
];

// Popular tags for quick access
export const POPULAR_TAGS = [
  'upload', 'PDF', 'AI analysis', 'pricing', 'privacy', 'ATS optimization',
  'calendar integration', 'troubleshooting', 'premium features', 'video introduction'
];

// Quick action shortcuts
export const QUICK_ACTIONS = [
  {
    id: 'try-now',
    label: 'Try CVPlus Now',
    description: 'Upload your CV and get instant AI analysis',
    category: 'getting-started',
    priority: 'high'
  },
  {
    id: 'view-pricing',
    label: 'View Pricing Plans',
    description: 'Compare features and choose the right plan',
    category: 'pricing-billing',
    priority: 'high'
  },
  {
    id: 'contact-support',
    label: 'Contact Support',
    description: 'Get help from our expert team',
    category: 'troubleshooting',
    priority: 'medium'
  }
];

// Export total counts for statistics
export const FAQ_STATS = {
  totalQuestions: FAQ_DATA.length,
  totalCategories: FAQ_CATEGORIES.length,
  lastUpdated: '2024-08-18'
};