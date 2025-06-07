'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { errorLogger } from './services/errorLogger';
import { notificationService } from './services/notificationService';
import { issueSyncService } from './services/issueSyncService';

interface ErrorIssueIntegrationProps {
  errorCode: string;
}

interface IssueLink {
  system: 'Jira' | 'GitHub' | 'Linear';
  url: string;
  issueId: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  lastSynced?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
}

const SUGGESTIONS: Record<string, string[]> = {
  '500': [
    'Check backend service health and logs.',
    'Review recent deployments for breaking changes.',
    'Ensure database connections are stable.'
  ],
  '400': [
    'Validate client request payloads.',
    'Check for missing or invalid parameters.',
    'Review API documentation for required fields.'
  ],
  'auth': [
    'Verify authentication tokens and user permissions.',
    'Check for expired or revoked credentials.'
  ]
};

export function ErrorIssueIntegration({ errorCode }: ErrorIssueIntegrationProps) {
  const [issueLinks, setIssueLinks] = useState<IssueLink[]>([]);
  const [newIssueUrl, setNewIssueUrl] = useState('');
  const [newIssueSystem, setNewIssueSystem] = useState<IssueLink['system']>('Jira');
  const [showForm, setShowForm] = useState(false);

  const logs = errorLogger.getRecentLogs();
  const error = useMemo(() => logs.find(log => log.code === errorCode), [logs, errorCode]);

  const suggestions = useMemo(() => {
    if (!error) return [];
    const code = error.statusCode ? String(error.statusCode) : error.code;
    return SUGGESTIONS[code] || SUGGESTIONS[error.code] || ['Check logs and investigate the error context.'];
  }, [error]);

  useEffect(() => {
    // Set up sync for each issue
    issueLinks.forEach(link => {
      issueSyncService.onStatusChange(link.issueId, (status) => {
        setIssueLinks(current =>
          current.map(issue =>
            issue.issueId === link.issueId
              ? {
                  ...issue,
                  status: status.status,
                  lastSynced: status.lastUpdated,
                  assignee: status.assignee,
                  priority: status.priority,
                }
              : issue
          )
        );
      });

      // Configure sync if not already configured
      if (!issueSyncService.getConfig(link.issueId)) {
        issueSyncService.configureSync(link.issueId, {
          system: link.system,
          apiKey: process.env.NEXT_PUBLIC_ISSUE_API_KEY || '',
          projectId: link.issueId.split('-')[0],
          syncInterval: 30000, // Sync every 30 seconds
        });
      }
    });

    // Cleanup
    return () => {
      issueLinks.forEach(link => {
        issueSyncService.stopSync(link.issueId);
      });
    };
  }, [issueLinks]);

  const handleAddIssue = () => {
    if (!newIssueUrl) return;
    const newIssue: IssueLink = {
      system: newIssueSystem,
      url: newIssueUrl,
      issueId: newIssueUrl.split('/').pop() || newIssueUrl,
      status: 'open' // Default status
    };
    setIssueLinks([...issueLinks, newIssue]);
    setNewIssueUrl('');
    setShowForm(false);
  };

  const handleStatusChange = (issueId: string, newStatus: IssueLink['status']) => {
    setIssueLinks(current => 
      current.map(issue => {
        if (issue.issueId === issueId) {
          const oldStatus = issue.status;
          issue.status = newStatus;
          // Notify on status change
          if (oldStatus !== newStatus) {
            notificationService.notify(
              'info',
              `Issue durumu güncellendi: ${issueId} (${oldStatus || 'unknown'} → ${newStatus})`,
              'statusChanges'
            );
          }
        }
        return issue;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Issue Takip ve Çözüm Önerileri</h3>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Otomatik Çözüm Önerileri</h4>
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-1">Bağlı Issue'lar</h4>
        {issueLinks.length === 0 ? (
          <p className="text-xs text-gray-500">Henüz bağlı bir issue yok.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm">
            {issueLinks.map((link, i) => (
              <li key={i} className="flex items-center space-x-2">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  [{link.system}] {link.issueId}
                </a>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  link.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  link.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {link.status || 'open'}
                </span>
                {link.assignee && (
                  <span className="text-xs text-gray-500">
                    {link.assignee}
                  </span>
                )}
                {link.priority && (
                  <span className={`px-1.5 py-0.5 text-xs rounded ${
                    link.priority === 'high' ? 'bg-red-100 text-red-800' :
                    link.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {link.priority}
                  </span>
                )}
                {link.lastSynced && (
                  <span className="text-xs text-gray-400">
                    Son güncelleme: {new Date(link.lastSynced).toLocaleTimeString()}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {showForm ? (
        <div className="mb-2 flex items-center space-x-2">
          <select
            value={newIssueSystem}
            onChange={e => setNewIssueSystem(e.target.value as IssueLink['system'])}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="Jira">Jira</option>
            <option value="GitHub">GitHub</option>
            <option value="Linear">Linear</option>
          </select>
          <input
            type="text"
            placeholder="Issue URL"
            value={newIssueUrl}
            onChange={e => setNewIssueUrl(e.target.value)}
            className="px-2 py-1 border rounded text-sm flex-1"
          />
          <button
            onClick={handleAddIssue}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Ekle
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            İptal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
        >
          Issue Bağla
        </button>
      )}
    </div>
  );
} 