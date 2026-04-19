import { GitBranch, ExternalLink } from 'lucide-react';
import { Card } from '../ui/card';

interface GitHubCardProps {
  githubUrl: string;
  username: string;
}

export function GitHubCard({ githubUrl, username }: GitHubCardProps) {
  return (
    <Card className="p-6 bg-white shadow-sm border border-sky-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">GitHub Profile</h3>
            <p className="text-gray-900">@{username}</p>
          </div>
        </div>
        <button
          className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
          aria-label="Open GitHub profile"
        >
          <ExternalLink className="w-4 h-4 text-sky-500" />
        </button>
      </div>
      
      <a
        href={githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sky-600 hover:text-sky-700 hover:underline break-all"
      >
        {githubUrl}
      </a>
    </Card>
  );
}