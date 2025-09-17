# ProfileService Documentation

The ProfileService is a comprehensive frontend API service that provides a clean interface for all public profile management operations in the CVPlus public-profiles module.

## Overview

The ProfileService acts as a bridge between frontend components and Firebase Functions backend services, providing:

- Profile CRUD operations with caching
- Template management and customization
- SEO optimization and meta tag management
- Social sharing and embedding functionality
- Real-time analytics integration
- Privacy controls and access management
- Custom domain support
- Version control capabilities

## Installation & Setup

The ProfileService is automatically available through the public-profiles module:

```typescript
import { ProfileService, profileService } from '@cvplus/public-profiles';
// or
import { useProfileService } from '@cvplus/public-profiles';
```

## Core Features

### 1. Profile Management

#### Creating Profiles
```typescript
import { profileService } from '@cvplus/public-profiles';

const profileData = {
  name: 'John Doe',
  title: 'Software Engineer',
  bio: 'Passionate developer...',
  // ... other profile data
};

const options = {
  templateId: 'professional',
  publishImmediately: true,
  seoOptimization: true
};

const result = await profileService.createProfile(profileData, options);
```

#### Updating Profiles
```typescript
const updates = {
  basicInfo: {
    title: 'Senior Software Engineer',
    location: 'New York, NY'
  },
  skills: [
    { name: 'React', proficiency: 'expert' }
  ]
};

const result = await profileService.updateProfile('profile-id', updates);
```

#### Retrieving Profiles
```typescript
// Get single profile
const profile = await profileService.getProfile('profile-id');

// Get all user profiles
const profiles = await profileService.getUserProfiles();
```

### 2. Template Operations

#### Getting Available Templates
```typescript
const templates = await profileService.getTemplates();
```

#### Applying Templates
```typescript
const result = await profileService.applyTemplate('profile-id', 'template-id');
```

#### Customizing Templates
```typescript
const customizations = {
  colorScheme: {
    primary: '#3B82F6',
    secondary: '#10B981'
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter'
  }
};

const result = await profileService.customizeTemplate('profile-id', customizations);
```

### 3. SEO Optimization

#### Generating SEO Data
```typescript
const seoData = await profileService.generateSEOData('profile-id');
```

#### Updating Meta Tags
```typescript
const metaTags = {
  title: 'John Doe - Software Engineer',
  description: 'Experienced software engineer specializing in...',
  keywords: ['software engineer', 'react', 'javascript']
};

await profileService.updateMetaTags('profile-id', metaTags);
```

#### Structured Data
```typescript
const structuredData = await profileService.generateStructuredData('profile-id');
```

### 4. Social Sharing & Embedding

#### Generate Share URLs
```typescript
const linkedinUrl = await profileService.generateShareURL('profile-id', 'linkedin');
const twitterUrl = await profileService.generateShareURL('profile-id', 'twitter');
```

#### Generate QR Codes
```typescript
const qrOptions = {
  size: 200,
  format: 'png',
  errorCorrection: 'M'
};

const qrResult = await profileService.generateQRCode('profile-id', qrOptions);
console.log(qrResult.qrCode); // Base64 encoded image
```

#### Generate Embed Codes
```typescript
const embedOptions = {
  width: 400,
  height: 600,
  theme: 'light',
  responsive: true
};

const embedCode = await profileService.generateEmbedCode('profile-id', embedOptions);
```

### 5. Analytics Integration

#### Track Profile Views
```typescript
const viewData = {
  sessionId: 'unique-session-id',
  visitorId: 'unique-visitor-id',
  country: 'US',
  device: 'desktop',
  source: 'direct'
};

await profileService.trackProfileView('profile-id', viewData);
```

#### Get Profile Analytics
```typescript
const dateRange = { days: 30 };
const analytics = await profileService.getProfileAnalytics('profile-id', dateRange);

console.log(analytics.summary.totalViews);
console.log(analytics.traffic.dailyViews);
console.log(analytics.engagement.averageScrollDepth);
```

#### Track User Engagement
```typescript
const engagement = {
  type: 'click',
  section: 'portfolio',
  element: 'project-1',
  duration: 5000
};

await profileService.trackEngagement('profile-id', engagement);
```

### 6. Privacy & Access Control

#### Update Privacy Settings
```typescript
const privacySettings = {
  level: 'unlisted',
  allowSearch: false,
  showContactInfo: true,
  allowDownload: false
};

await profileService.updatePrivacySettings('profile-id', privacySettings);
```

#### Manage Access Controls
```typescript
const accessControls = await profileService.getAccessControls('profile-id');
const token = await profileService.generateAccessToken('profile-id', ['view', 'contact']);
```

### 7. Custom Domains

#### Map Custom Domain
```typescript
const domainMapping = await profileService.mapCustomDomain('profile-id', 'johndoe.dev');
```

#### Validate Domain
```typescript
const validation = await profileService.validateDomain('johndoe.dev');
console.log(validation.valid);
console.log(validation.requirements);
```

### 8. Version Control

#### Save Profile Version
```typescript
const versionData = {
  description: 'Added new portfolio projects',
  changes: [
    {
      section: 'portfolio',
      type: 'added',
      description: 'Added 3 new projects'
    }
  ],
  major: false
};

const version = await profileService.saveProfileVersion('profile-id', versionData);
```

#### Get Profile Versions
```typescript
const versions = await profileService.getProfileVersions('profile-id');
```

#### Rollback to Version
```typescript
const result = await profileService.rollbackToVersion('profile-id', 'version-id');
```

## React Hooks

### useProfileService Hook

The `useProfileService` hook provides state management and easy access to all ProfileService operations:

```typescript
import { useProfileService } from '@cvplus/public-profiles';

function ProfileManager() {
  const {
    loading,
    error,
    profiles,
    templates,
    createProfile,
    updateProfile,
    deleteProfile,
    loadUserProfiles,
    loadTemplates,
    generateShareURL,
    trackView
  } = useProfileService();

  useEffect(() => {
    loadUserProfiles();
    loadTemplates();
  }, []);

  // Use the hook methods...
}
```

### useProfile Hook

The `useProfile` hook is optimized for profile-specific operations:

```typescript
import { useProfile } from '@cvplus/public-profiles';

function ProfileView({ profileId }: { profileId: string }) {
  const {
    profile,
    loading,
    error,
    updateProfile,
    trackView,
    generateShareURL,
    loadAnalytics
  } = useProfile(profileId);

  useEffect(() => {
    if (profile) {
      trackView({
        sessionId: 'session-123',
        device: 'desktop'
      });
    }
  }, [profile, trackView]);

  // Use profile data and methods...
}
```

### useProfileAnalytics Hook

The `useProfileAnalytics` hook is specialized for analytics operations:

```typescript
import { useProfileAnalytics } from '@cvplus/public-profiles';

function AnalyticsDashboard({ profileId }: { profileId: string }) {
  const {
    analytics,
    loading,
    error,
    reload
  } = useProfileAnalytics(profileId, { days: 30 });

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Analytics for {profileId}</h2>
      <p>Total Views: {analytics?.summary.totalViews}</p>
      <p>Unique Visitors: {analytics?.summary.uniqueVisitors}</p>
      <button onClick={reload}>Refresh Analytics</button>
    </div>
  );
}
```

## Caching

The ProfileService includes intelligent caching to improve performance:

### Cache Duration
- Profile data: 5 minutes
- Templates: 30 minutes
- SEO data: 1 hour
- Analytics: 10 minutes

### Cache Management
```typescript
// Clear all cache
profileService.clearAllCache();

// Get cache statistics
const stats = profileService.getCacheStats();
console.log('Cache entries:', stats.size);
console.log('Cached keys:', stats.entries);
```

### Automatic Cache Invalidation

The service automatically clears related caches when:
- Profiles are updated or deleted
- Template customizations are applied
- Privacy settings are changed
- Profile versions are created or restored

## Error Handling

The ProfileService provides comprehensive error handling:

### Authentication Errors
```typescript
try {
  await profileService.createProfile(data);
} catch (error) {
  if (error.message.includes('authenticated')) {
    // Handle authentication error
    redirectToLogin();
  }
}
```

### Validation Errors
```typescript
const result = await profileService.createProfile(data);
if (!result.success) {
  console.error('Validation errors:', result.errors);
  // Handle validation errors
}
```

### Network Errors
All network errors are caught and wrapped with descriptive messages:
```typescript
// Error message format: "Operation failed: [original error message]"
```

## Performance Optimizations

### Intelligent Caching
- Automatic cache invalidation
- Configurable cache durations
- Memory-efficient storage

### Lazy Loading
- Analytics tracking doesn't block UI
- Background operations for non-critical features

### Request Batching
- Multiple operations can be batched when possible
- Reduces Firebase Function calls

## Integration with Firebase

The ProfileService integrates with Firebase Functions for backend operations:

### Required Firebase Functions
- `createPublicProfile`
- `updatePublicProfile`
- `deletePublicProfile`
- `getProfileTemplates`
- `applyProfileTemplate`
- `generateProfileSEO`
- `generateShareURL`
- `generateProfileQR`
- `trackProfileView`
- `getProfileAnalytics`

### Firebase Authentication
The service automatically uses the current authenticated user for operations that require authentication.

### Firestore Integration
Direct Firestore queries are used for:
- Reading public profile data
- Querying user profiles
- Real-time data when needed

## Type Safety

The ProfileService is fully typed with TypeScript, providing:

- Comprehensive interface definitions
- Type-safe method parameters
- Intellisense support
- Compile-time error checking

## Testing

The ProfileService includes comprehensive tests:

```bash
# Run ProfileService tests
npm test -- ProfileService.test.ts

# Run with coverage
npm test -- --coverage ProfileService.test.ts
```

Test coverage includes:
- All CRUD operations
- Error handling scenarios
- Caching behavior
- Authentication flows
- Analytics tracking
- Social sharing
- Privacy controls

## Best Practices

### 1. Use Hooks in React Components
```typescript
// ✅ Good
function ProfileComponent({ profileId }) {
  const { profile, loading, updateProfile } = useProfile(profileId);
  // ...
}

// ❌ Avoid direct service usage in components
function ProfileComponent({ profileId }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    profileService.getProfile(profileId).then(setProfile);
  }, []);
  // ...
}
```

### 2. Handle Loading and Error States
```typescript
const { loading, error, profiles, loadUserProfiles } = useProfileService();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Track Analytics Appropriately
```typescript
// ✅ Track meaningful interactions
onClick={() => {
  trackEngagement(profileId, {
    type: 'click',
    section: 'contact',
    element: 'email-button'
  });
  openEmailClient();
}}

// ❌ Don't over-track
onMouseMove={() => trackEngagement(...)} // Too frequent
```

### 4. Use Caching Effectively
```typescript
// ✅ Cache is automatic, just use the service
const profile = await profileService.getProfile(profileId);

// ❌ Don't implement your own caching
const cachedProfile = localStorage.getItem(`profile-${profileId}`);
```

### 5. Handle Privacy Settings
```typescript
// ✅ Respect privacy levels
if (profile.privacy.level === 'private') {
  return <PrivateProfileMessage />;
}

// Show contact info based on privacy settings
{profile.privacy.showContactInfo && (
  <ContactSection contact={profile.contact} />
)}
```

## Migration Guide

### From Legacy ProfileService

If migrating from an older version:

```typescript
// Old API
import { ProfileService } from './old-profile-service';
const service = new ProfileService();
const profile = await service.getProfile(id);

// New API
import { profileService } from '@cvplus/public-profiles';
const profile = await profileService.getProfile(id);

// Or use hooks
import { useProfile } from '@cvplus/public-profiles';
const { profile, loading, error } = useProfile(id);
```

### Breaking Changes

- Service is now a singleton instance
- All methods are async
- Error handling is standardized
- Cache management is automatic

## Contributing

When contributing to ProfileService:

1. Add comprehensive tests for new features
2. Update TypeScript interfaces
3. Document new methods and parameters
4. Ensure backward compatibility
5. Update this documentation

## Support

For issues or questions about ProfileService:

1. Check the test files for usage examples
2. Review the TypeScript interfaces for parameter details
3. Look at the example component for comprehensive usage
4. Check Firebase Function logs for backend issues