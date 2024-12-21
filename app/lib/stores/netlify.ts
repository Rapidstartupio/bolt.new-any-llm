import { atom } from 'nanostores';
import { workbenchStore } from './workbench';
import { toast } from 'react-toastify';
import JSZip from 'jszip';
import Cookies from 'js-cookie';

interface NetlifyDeployment {
  siteId: string;
  deployId: string;
  url: string;
  status: 'pending' | 'building' | 'ready' | 'error';
}

interface NetlifyDeployResponse {
  site_id: string;
  id: string;
  deploy_url: string;
  state: 'building' | 'ready' | 'error';
}

interface NetlifyProjectConfig {
  siteId: string;
  siteName: string;
}

class NetlifyStore {
  deployment = atom<NetlifyDeployment | null>(null);
  token = atom<string>('');

  constructor() {
    // Initialize token from cookie
    const savedToken = Cookies.get('netlifyToken');

    if (savedToken) {
      this.token.set(savedToken);
    }
  }

  setToken(token: string) {
    this.token.set(token);
    Cookies.set('netlifyToken', token);
  }

  getProjectConfig(): NetlifyProjectConfig | null {
    const configStr = localStorage.getItem('netlifyProjectConfig');
    return configStr ? JSON.parse(configStr) : null;
  }

  saveProjectConfig(config: NetlifyProjectConfig) {
    localStorage.setItem('netlifyProjectConfig', JSON.stringify(config));
  }

  async deploy(token: string, siteName: string): Promise<NetlifyDeployResponse> {
    try {
      // Create a zip file of the project
      const zip = new JSZip();
      const files = workbenchStore.files.get();

      // Add files to zip
      Object.entries(files).forEach(([path, content]) => {
        if (content && typeof content === 'string') {
          zip.file(path, content);
        }
      });

      // Generate zip blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Check if we have existing project config
      const projectConfig = this.getProjectConfig();
      const deployUrl = projectConfig?.siteId
        ? `https://api.netlify.com/api/v1/sites/${projectConfig.siteId}/deploys`
        : `https://api.netlify.com/api/v1/sites/${siteName}/deploys`;

      // Deploy to Netlify
      const response = await fetch(deployUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/zip',
          Authorization: `Bearer ${token}`,
        },
        body: zipBlob,
      });

      if (!response.ok) {
        throw new Error(`Netlify API error: ${response.statusText}`);
      }

      const deployData = (await response.json()) as NetlifyDeployResponse;

      // Save project config if it's a new deployment
      if (!projectConfig) {
        this.saveProjectConfig({
          siteId: deployData.site_id,
          siteName,
        });
      }

      this.deployment.set({
        siteId: deployData.site_id,
        deployId: deployData.id,
        url: deployData.deploy_url,
        status: 'building',
      });

      // Save token for future use
      this.setToken(token);

      // Start polling for deployment status
      this._pollDeploymentStatus(token);

      return deployData;
    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    }
  }

  private async _pollDeploymentStatus(token: string): Promise<void> {
    const deployment = this.deployment.get();

    if (!deployment) {
      return;
    }

    try {
      const response = await fetch(
        `https://api.netlify.com/api/v1/sites/${deployment.siteId}/deploys/${deployment.deployId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to get deployment status: ${response.statusText}`);
      }

      const data = (await response.json()) as NetlifyDeployResponse;

      if (data.state === 'ready') {
        this.deployment.set({ ...deployment, status: 'ready' });
        toast.success('Deployment completed successfully!');
      } else if (data.state === 'error') {
        this.deployment.set({ ...deployment, status: 'error' });
        toast.error('Deployment failed');
      } else {
        // Continue polling
        setTimeout(() => this._pollDeploymentStatus(token), 5000);
      }
    } catch (error) {
      console.error('Error polling deployment status:', error);
      this.deployment.set({ ...deployment, status: 'error' });
      toast.error('Failed to get deployment status');
    }
  }
}

export const netlifyStore = new NetlifyStore();
