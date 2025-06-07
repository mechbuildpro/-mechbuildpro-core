interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: {
    dataSource: string;
    refreshInterval: number;
    visualization: {
      type: string;
      options: Record<string, any>;
    };
    filters: {
      field: string;
      operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
      value: any;
    }[];
  };
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

class DashboardService {
  private layouts: Map<string, DashboardLayout> = new Map();
  private activeLayout: string | null = null;

  constructor() {
    this.loadLayouts();
  }

  private loadLayouts(): void {
    const savedLayouts = localStorage.getItem('dashboardLayouts');
    if (savedLayouts) {
      const layouts = JSON.parse(savedLayouts);
      Object.entries(layouts).forEach(([id, layout]) => {
        this.layouts.set(id, layout as DashboardLayout);
      });
    }
  }

  private saveLayouts(): void {
    const layouts = Object.fromEntries(this.layouts);
    localStorage.setItem('dashboardLayouts', JSON.stringify(layouts));
  }

  public createLayout(name: string, description: string): string {
    const id = `layout_${Date.now()}`;
    const layout: DashboardLayout = {
      id,
      name,
      description,
      widgets: [],
      theme: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#ffffff',
        text: '#000000'
      }
    };

    this.layouts.set(id, layout);
    this.saveLayouts();
    return id;
  }

  public getLayout(id: string): DashboardLayout | undefined {
    return this.layouts.get(id);
  }

  public getAllLayouts(): DashboardLayout[] {
    return Array.from(this.layouts.values());
  }

  public updateLayout(id: string, updates: Partial<DashboardLayout>): boolean {
    const layout = this.layouts.get(id);
    if (!layout) return false;

    const updatedLayout = { ...layout, ...updates };
    this.layouts.set(id, updatedLayout);
    this.saveLayouts();
    return true;
  }

  public deleteLayout(id: string): boolean {
    const success = this.layouts.delete(id);
    if (success) {
      this.saveLayouts();
    }
    return success;
  }

  public addWidget(layoutId: string, widget: Omit<DashboardWidget, 'id'>): string {
    const layout = this.layouts.get(layoutId);
    if (!layout) throw new Error('Layout not found');

    const id = `widget_${Date.now()}`;
    const newWidget: DashboardWidget = { ...widget, id };
    
    layout.widgets.push(newWidget);
    this.saveLayouts();
    return id;
  }

  public updateWidget(layoutId: string, widgetId: string, updates: Partial<DashboardWidget>): boolean {
    const layout = this.layouts.get(layoutId);
    if (!layout) return false;

    const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return false;

    layout.widgets[widgetIndex] = {
      ...layout.widgets[widgetIndex],
      ...updates
    };

    this.saveLayouts();
    return true;
  }

  public removeWidget(layoutId: string, widgetId: string): boolean {
    const layout = this.layouts.get(layoutId);
    if (!layout) return false;

    const initialLength = layout.widgets.length;
    layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
    
    if (layout.widgets.length !== initialLength) {
      this.saveLayouts();
      return true;
    }
    return false;
  }

  public updateWidgetPosition(
    layoutId: string,
    widgetId: string,
    position: { x: number; y: number; w: number; h: number }
  ): boolean {
    return this.updateWidget(layoutId, widgetId, { position });
  }

  public updateWidgetConfig(
    layoutId: string,
    widgetId: string,
    config: DashboardWidget['config']
  ): boolean {
    return this.updateWidget(layoutId, widgetId, { config });
  }

  public updateTheme(
    layoutId: string,
    theme: DashboardLayout['theme']
  ): boolean {
    return this.updateLayout(layoutId, { theme });
  }

  public setActiveLayout(id: string): boolean {
    if (this.layouts.has(id)) {
      this.activeLayout = id;
      return true;
    }
    return false;
  }

  public getActiveLayout(): DashboardLayout | undefined {
    return this.activeLayout ? this.layouts.get(this.activeLayout) : undefined;
  }

  public exportLayout(id: string): string {
    const layout = this.layouts.get(id);
    if (!layout) throw new Error('Layout not found');
    return JSON.stringify(layout, null, 2);
  }

  public importLayout(json: string): string {
    const layout = JSON.parse(json) as DashboardLayout;
    const id = `layout_${Date.now()}`;
    layout.id = id;
    
    this.layouts.set(id, layout);
    this.saveLayouts();
    return id;
  }
}

export const dashboardService = new DashboardService(); 