'use client';

import { notificationService } from './notificationService';

interface IssueSyncConfig {
  system: 'Jira' | 'GitHub' | 'Linear';
  apiKey: string;
  projectId: string;
  syncInterval: number; // in milliseconds
}

interface IssueStatus {
  id: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastUpdated: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

class IssueSyncService {
  private static instance: IssueSyncService;
  private configs: Map<string, IssueSyncConfig> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private statusCallbacks: Map<string, (status: IssueStatus) => void> = new Map();

  private constructor() {}

  static getInstance(): IssueSyncService {
    if (!IssueSyncService.instance) {
      IssueSyncService.instance = new IssueSyncService();
    }
    return IssueSyncService.instance;
  }

  async configureSync(issueId: string, config: IssueSyncConfig) {
    this.configs.set(issueId, config);
    
    // Clear existing interval if any
    if (this.syncIntervals.has(issueId)) {
      clearInterval(this.syncIntervals.get(issueId));
    }

    // Start new sync interval
    const interval = setInterval(() => this.syncIssue(issueId), config.syncInterval);
    this.syncIntervals.set(issueId, interval);

    // Initial sync
    await this.syncIssue(issueId);
  }

  private async syncIssue(issueId: string) {
    const config = this.configs.get(issueId);
    if (!config) return;

    try {
      const status = await this.fetchIssueStatus(issueId, config);
      const callback = this.statusCallbacks.get(issueId);
      if (callback) {
        callback(status);
      }

      // Notify if status changed
      notificationService.notify(
        'info',
        `Issue durumu güncellendi: ${issueId} (${status.status})`,
        'issueUpdates'
      );
    } catch (error) {
      console.error(`Failed to sync issue ${issueId}:`, error);
      notificationService.notify(
        'error',
        `Issue senkronizasyon hatası: ${issueId}`,
        'criticalErrors'
      );
    }
  }

  private async fetchIssueStatus(issueId: string, config: IssueSyncConfig): Promise<IssueStatus> {
    // Simulate API call - replace with actual API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: issueId,
          status: 'in_progress',
          lastUpdated: new Date().toISOString(),
          assignee: 'John Doe',
          priority: 'high'
        });
      }, 500);
    });
  }

  onStatusChange(issueId: string, callback: (status: IssueStatus) => void) {
    this.statusCallbacks.set(issueId, callback);
  }

  stopSync(issueId: string) {
    if (this.syncIntervals.has(issueId)) {
      clearInterval(this.syncIntervals.get(issueId));
      this.syncIntervals.delete(issueId);
    }
    this.configs.delete(issueId);
    this.statusCallbacks.delete(issueId);
  }

  getConfig(issueId: string): IssueSyncConfig | undefined {
    return this.configs.get(issueId);
  }
}

export const issueSyncService = IssueSyncService.getInstance(); 