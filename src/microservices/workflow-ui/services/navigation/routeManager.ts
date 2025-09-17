// Route Manager - Core routing and URL state management
import { CVStep, NavigationState } from '../../types/session';

export interface RouteDefinition {
  step: CVStep;
  path: string;
  title: string;
  description: string;
  icon: string;
  requiredData: string[];
  estimatedTime: number;
}

export class RouteManager {
  private routeDefinitions = new Map<CVStep, RouteDefinition>();
  
  constructor() {
    this.initializeRoutes();
  }

  public generateStateUrl(
    sessionId: string, 
    step: CVStep, 
    substep?: string,
    parameters?: Record<string, unknown>
  ): string {
    const baseUrl = window.location.origin;
    const routeDef = this.routeDefinitions.get(step);
    
    if (!routeDef) {
      return `${baseUrl}/session/${sessionId}`;
    }

    let path = routeDef.path.replace(':sessionId', sessionId);
    
    if (substep) {
      path += `/${substep}`;
    }

    const queryParams = new URLSearchParams();
    queryParams.set('sessionId', sessionId);
    queryParams.set('step', step);
    
    if (substep) queryParams.set('substep', substep);
    if (parameters) queryParams.set('state', btoa(JSON.stringify(parameters)));
    
    queryParams.set('timestamp', Date.now().toString());

    return `${baseUrl}${path}?${queryParams.toString()}`;
  }

  public parseStateFromUrl(url: string): NavigationState | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const sessionId = params.get('sessionId');
      const step = params.get('step') as CVStep;
      const substep = params.get('substep');
      const timestamp = params.get('timestamp');
      const stateParam = params.get('state');
      
      if (!sessionId || !step) return null;

      let parameters: Record<string, unknown> | undefined;
      if (stateParam) {
        try {
          parameters = JSON.parse(atob(stateParam));
        } catch (error) {
          console.warn('Error parsing state parameters:', error);
        }
      }

      return {
        sessionId,
        step,
        substep,
        parameters,
        timestamp: timestamp ? new Date(parseInt(timestamp)) : new Date(),
        url,
        transition: 'push'
      };
    } catch (error) {
      console.error('Error parsing navigation state:', error);
      return null;
    }
  }

  public getRouteDefinition(step: CVStep): RouteDefinition | undefined {
    return this.routeDefinitions.get(step);
  }

  public getAllRoutes(): RouteDefinition[] {
    return Array.from(this.routeDefinitions.values());
  }

  private initializeRoutes(): void {
    const routes: RouteDefinition[] = [
      {
        step: 'upload',
        path: '/upload/:sessionId',
        title: 'Upload CV',
        description: 'Upload your CV file',
        icon: 'upload',
        requiredData: [],
        estimatedTime: 2
      },
      {
        step: 'processing',
        path: '/processing/:sessionId',
        title: 'Processing',
        description: 'AI is analyzing your CV',
        icon: 'processing',
        requiredData: ['fileData'],
        estimatedTime: 3
      },
      {
        step: 'analysis',
        path: '/analysis/:sessionId',
        title: 'Analysis Results',
        description: 'Review AI analysis',
        icon: 'analysis',
        requiredData: ['cvData', 'analysisResults'],
        estimatedTime: 5
      },
      {
        step: 'features',
        path: '/features/:sessionId',
        title: 'Select Features',
        description: 'Choose enhancement features',
        icon: 'features',
        requiredData: ['analysisResults'],
        estimatedTime: 4
      },
      {
        step: 'templates',
        path: '/templates/:sessionId',
        title: 'Choose Template',
        description: 'Select CV template',
        icon: 'template',
        requiredData: ['selectedFeatures'],
        estimatedTime: 3
      },
      {
        step: 'preview',
        path: '/preview/:sessionId',
        title: 'Preview CV',
        description: 'Review your enhanced CV',
        icon: 'preview',
        requiredData: ['templateSelection', 'featureConfiguration'],
        estimatedTime: 5
      },
      {
        step: 'results',
        path: '/results/:sessionId',
        title: 'Final Results',
        description: 'Download and share your CV',
        icon: 'results',
        requiredData: ['generatedCV'],
        estimatedTime: 2
      },
      {
        step: 'keywords',
        path: '/keywords/:sessionId',
        title: 'Keyword Optimization',
        description: 'Optimize keywords for ATS',
        icon: 'keywords',
        requiredData: ['analysisResults'],
        estimatedTime: 4
      },
      {
        step: 'completed',
        path: '/completed/:sessionId',
        title: 'Completed',
        description: 'CV enhancement completed',
        icon: 'completed',
        requiredData: ['finalResults'],
        estimatedTime: 1
      }
    ];

    routes.forEach(route => {
      this.routeDefinitions.set(route.step, route);
    });
  }
}