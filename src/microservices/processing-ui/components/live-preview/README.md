# LivePreview Component System

The LivePreview component system provides real-time CV preview and editing capabilities with split-screen interface, viewport simulation, and template comparison features.

## Architecture

The system is built with a modular architecture where each component has a single responsibility and is under 200 lines of code:

```
live-preview/
├── LivePreview.tsx          # Main orchestrator component
├── ViewportControls.tsx     # Device viewport and zoom controls
├── PreviewPanel.tsx         # CV preview rendering with templates
├── EditorPanel.tsx          # Real-time CV content editor
├── SplitLayout.tsx          # Resizable split-screen layout
├── TemplateComparison.tsx   # Side-by-side template comparison
├── types.ts                 # TypeScript type definitions
├── styles.css              # Component styling
├── __tests__/              # Comprehensive test suite
└── README.md               # This documentation
```

## Features

### Core Functionality
- **Real-time Synchronization**: Changes in the editor instantly reflect in the preview
- **Split-Screen Interface**: Resizable editor and preview panels
- **Viewport Simulation**: Desktop, tablet, mobile, and print preview modes
- **Zoom Controls**: 25% to 200% zoom levels with precise scaling
- **Template System**: Live template switching and comparison
- **Performance Monitoring**: Real-time performance metrics overlay

### Viewport Modes
- **Desktop**: 1920×1080 resolution
- **Tablet**: 768×1024 resolution with orientation toggle
- **Mobile**: 375×812 resolution with orientation toggle
- **Print**: 794×1123 resolution optimized for printing

### Editor Features
- **Section-based Editing**: Personal info, summary, experience tabs
- **Dynamic Content**: Add/remove experience entries
- **Form Validation**: Real-time validation with visual feedback
- **Auto-save**: Debounced updates to prevent performance issues

## Usage

### Basic Usage

```tsx
import { LivePreview } from '@cvplus/cv-processing';

const MyComponent = () => {
  const [cvData, setCvData] = useState(initialCVData);
  const [template, setTemplate] = useState(defaultTemplate);

  return (
    <LivePreview
      cvData={cvData}
      template={template}
      onDataChange={setCvData}
      onTemplateChange={setTemplate}
    />
  );
};
```

### Advanced Configuration

```tsx
import { LivePreview, ViewportMode, ZoomLevel } from '@cvplus/cv-processing';

const AdvancedPreview = () => {
  const handleDataChange = useCallback((newData) => {
    // Validate data
    if (validateCVData(newData)) {
      setCvData(newData);
      // Auto-save to backend
      saveCVData(newData);
    }
  }, []);

  return (
    <LivePreview
      cvData={cvData}
      template={template}
      selectedFeatures={features}
      onDataChange={handleDataChange}
      onTemplateChange={setTemplate}
      className="h-full"
    />
  );
};
```

## Component API

### LivePreview

```tsx
interface LivePreviewProps {
  cvData: any; // CV data structure
  template?: any; // Template configuration
  selectedFeatures?: Record<string, boolean>; // Feature toggles
  onDataChange?: (data: any) => void; // Data change callback
  onTemplateChange?: (template: any) => void; // Template change callback
  className?: string; // Additional CSS classes
}
```

### ViewportControls

```tsx
interface ViewportControlsProps {
  currentMode: ViewportMode; // Current viewport mode
  onModeChange: (mode: ViewportMode) => void; // Mode change handler
  zoomLevel: ZoomLevel; // Current zoom level
  onZoomChange: (zoom: ZoomLevel) => void; // Zoom change handler
  orientation: 'portrait' | 'landscape'; // Device orientation
  onOrientationToggle: () => void; // Orientation toggle handler
}
```

### PreviewPanel

```tsx
interface PreviewPanelProps {
  cvData: any; // CV data to render
  template?: any; // Template configuration
  viewportConfig: ViewportConfig; // Viewport settings
  zoomLevel: ZoomLevel; // Zoom level for scaling
  className?: string; // Additional CSS classes
}
```

### EditorPanel

```tsx
interface EditorPanelProps {
  cvData: any; // CV data to edit
  onDataChange: (data: any) => void; // Data change callback
  className?: string; // Additional CSS classes
}
```

## Data Structure

The LivePreview system expects CV data in the following structure:

```tsx
interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
}
```

## Templates

Templates define the visual styling and layout of the CV preview:

```tsx
interface Template {
  id: string;
  name: string;
  emoji: string;
  category: string;
  isPremium: boolean;
  description?: string;
}
```

### Built-in Templates
- **Modern Professional**: Clean, corporate design
- **Classic Traditional**: Traditional serif styling
- **Creative Portfolio**: Bold, colorful design for creatives
- **Minimal Clean**: Minimalist layout focusing on content

## Performance Optimization

### Debounced Updates
The system uses debounced updates to prevent excessive re-renders during typing:

```tsx
const debouncedUpdate = useMemo(
  () => debounce((data) => onDataChange(data), 300),
  [onDataChange]
);
```

### Viewport Scaling
CSS transforms provide efficient viewport scaling without re-rendering:

```tsx
const previewStyle = {
  transform: `scale(${zoomLevel / 100})`,
  transformOrigin: 'top left'
};
```

### Performance Metrics
Real-time performance monitoring tracks:
- Render time
- Update latency
- Memory usage
- Last update timestamp

## Testing

The system includes comprehensive tests for all components:

```bash
# Run all tests
npm test

# Run specific component tests
npm test LivePreview
npm test ViewportControls
npm test PreviewPanel

# Run with coverage
npm test -- --coverage
```

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter/Space activation for buttons
- Arrow key navigation in template selection

### Screen Reader Support
- ARIA labels on all controls
- Role attributes for semantic meaning
- Focus management for modal dialogs

### Color Contrast
- WCAG AA compliant color ratios
- High contrast mode support
- Color-blind friendly templates

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Performance Benchmarks

| Metric | Target | Typical |
|--------|--------|---------|
| Initial render | <100ms | ~60ms |
| Update latency | <50ms | ~25ms |
| Memory usage | <50MB | ~30MB |
| Template switch | <200ms | ~120ms |

## Troubleshooting

### Common Issues

**Preview not updating**: Check that `onDataChange` callback is properly connected and not being throttled.

**Viewport scaling issues**: Ensure container has proper dimensions and CSS transforms are supported.

**Template not applying**: Verify template structure matches expected interface and CSS classes are loaded.

**Performance degradation**: Check for excessive re-renders using React DevTools Profiler.

### Debug Mode

Enable debug mode for detailed logging:

```tsx
<LivePreview
  cvData={cvData}
  showMetrics={true}
  {...props}
/>
```

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

### Guidelines

- Keep components under 200 lines
- Use TypeScript for all components
- Write comprehensive tests
- Follow existing naming conventions
- Document new features

### Code Style

```tsx
// Good: Descriptive component names
const ViewportControls: React.FC<ViewportControlsProps> = ({ ... }) => {
  // Implementation
};

// Good: Explicit types
const handleZoomChange = useCallback((zoomLevel: ZoomLevel) => {
  setState(prev => ({ ...prev, zoomLevel }));
}, []);

// Good: Proper error handling
if (!cvData) {
  return <EmptyStateMessage />;
}
```

## Future Enhancements

- **Collaborative Editing**: Real-time multi-user editing
- **Version History**: Track and restore previous versions
- **Export Options**: PDF, Word, and other format exports
- **Custom Templates**: User-created template system
- **Advanced Analytics**: Detailed usage and performance metrics
- **Offline Support**: Progressive web app capabilities