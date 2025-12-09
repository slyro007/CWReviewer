import axios, { AxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import type {
  ConnectWiseMember,
  ConnectWiseTimeEntry,
  ConnectWiseTicket,
  ConnectWiseProject,
  ConnectWiseNote,
  ConnectWiseBoard,
} from '../types';

class ConnectWiseService {
  private baseURL: string;
  private authString: string;
  private headers: Record<string, string>;

  constructor() {
    // ConnectWise Manage API v3 uses Basic Auth with companyId+publicKey:privateKey
    // Format: Basic base64(companyId+publicKey:privateKey)
    // This is the correct format based on working implementation
    this.authString = btoa(`${API_CONFIG.companyId}+${API_CONFIG.publicKey}:${API_CONFIG.privateKey}`);
    
    // Use proxy to avoid CORS issues
    // In development: Vite proxy (vite.config.ts)
    // In production: Vercel serverless function (api/connectwise/[...path].ts)
    const isDev = import.meta.env.DEV;
    const isBrowser = typeof window !== 'undefined';
    
    // Always use proxy path in browser to avoid CORS
    // The proxy will route through Vite dev server (dev) or Vercel function (production)
    const apiBase = isBrowser
      ? '/api/connectwise'  // Use proxy (Vite dev server or Vercel function)
      : API_CONFIG.baseURL; // Use direct URL only in Node.js/server environments
    
    // ConnectWise API format: https://api-na.myconnectwise.net/v4_6_release/apis/3.0
    // Build full URLs by combining base URL with endpoint path directly
    this.baseURL = `${apiBase}/v4_6_release/apis/3.0`;
    
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.authString}`,
      'clientId': API_CONFIG.clientId, // clientId as header (not in URL)
    };
    
    console.log('ConnectWise API Config:', {
      baseURL: this.baseURL,
      companyId: API_CONFIG.companyId,
      clientId: API_CONFIG.clientId ? `${API_CONFIG.clientId.substring(0, 8)}...` : 'MISSING',
      publicKey: API_CONFIG.publicKey ? 'SET' : 'MISSING',
      privateKey: API_CONFIG.privateKey ? 'SET' : 'MISSING',
      authFormat: 'companyId+publicKey:privateKey',
      usingProxy: isBrowser,
      isDev: isDev,
      isBrowser: isBrowser,
    });
  }

  /**
   * Make a request to the ConnectWise API
   * Builds full URL by combining base URL with endpoint path
   */
  private async makeRequest<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T[]> {
    // Build full URL: baseURL + endpoint
    const fullURL = `${this.baseURL}${endpoint}`;
    
    console.log(`Making request to: ${fullURL}`);
    console.log('Request headers:', {
      ...this.headers,
      Authorization: 'Basic [REDACTED]',
    });
    
    try {
      const response = await axios.get<T[]>(fullURL, {
        ...config,
        headers: {
          ...this.headers,
          ...config?.headers,
        },
        timeout: 30000, // 30 second timeout
      });
      console.log(`✅ Success: ${fullURL} - Status: ${response.status}`);
      return response.data || [];
    } catch (error: any) {
      console.error(`❌ Error fetching ${fullURL}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        console.error('Request URL:', fullURL);
      } else if (error.request) {
        console.error('No response received - Network Error');
        console.error('Request details:', {
          url: fullURL,
          method: 'GET',
          headers: this.headers,
        });
        console.error('This might be a CORS issue or the proxy is not working.');
      } else {
        console.error('Error setting up request:', error.message);
        console.error('Error code:', error.code);
      }
      throw error;
    }
  }

  /**
   * Try to discover the correct company identifier
   * This might help if the company ID format is incorrect
   */
  async discoverCompanyInfo(): Promise<any> {
    try {
      // Try system/info endpoint which might not need company
      const fullURL = `${this.baseURL}/system/info`;
      const response = await axios.get(fullURL, { headers: this.headers });
      return response.data;
    } catch (error: any) {
      console.error('Could not discover company info:', error);
      return null;
    }
  }

  async getMembers(): Promise<ConnectWiseMember[]> {
    // System endpoints don't need company ID in the path
    // Use: /v4_6_release/apis/3.0/system/members (no /company/{companyId})
    return this.makeRequest<ConnectWiseMember>(API_ENDPOINTS.members, {
      params: {
        pageSize: 1000,
        conditions: 'inactiveFlag=false',
      },
    });
  }

  async getTimeEntries(
    memberId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<ConnectWiseTimeEntry[]> {
    const params: Record<string, any> = {
      pageSize: 1000,
    };

    if (memberId) {
      params.conditions = `member/id=${memberId}`;
    }

    if (startDate) {
      params.conditions = params.conditions
        ? `${params.conditions} AND timeStart>=[${startDate}]`
        : `timeStart>=[${startDate}]`;
    }

    if (endDate) {
      params.conditions = params.conditions
        ? `${params.conditions} AND timeEnd<=[${endDate}]`
        : `timeEnd<=[${endDate}]`;
    }

    // Time entries endpoint (no company ID in path)
    return this.makeRequest<ConnectWiseTimeEntry>(API_ENDPOINTS.timeEntries, {
      params,
    });
  }

  async getTickets(ticketIds?: number[]): Promise<ConnectWiseTicket[]> {
    const params: Record<string, any> = {
      pageSize: 1000,
    };

    if (ticketIds && ticketIds.length > 0) {
      params.conditions = ticketIds.map((id) => `id=${id}`).join(' OR ');
    }

    return this.makeRequest<ConnectWiseTicket>(API_ENDPOINTS.tickets, {
      params,
    });
  }

  async getProjects(projectIds?: number[]): Promise<ConnectWiseProject[]> {
    const params: Record<string, any> = {
      pageSize: 1000,
    };

    if (projectIds && projectIds.length > 0) {
      params.conditions = projectIds.map((id) => `id=${id}`).join(' OR ');
    }

    return this.makeRequest<ConnectWiseProject>(API_ENDPOINTS.projects, {
      params,
    });
  }

  async getBoards(): Promise<ConnectWiseBoard[]> {
    return this.makeRequest<ConnectWiseBoard>(API_ENDPOINTS.boards, {
      params: {
        pageSize: 1000,
        conditions: 'inactiveFlag=false',
      },
    });
  }

  async getTicketNotes(ticketId: number): Promise<ConnectWiseNote[]> {
    return this.makeRequest<ConnectWiseNote>(API_ENDPOINTS.ticketNotes(ticketId), {
      params: {
        pageSize: 1000,
      },
    });
  }

  async getProjectNotes(projectId: number): Promise<ConnectWiseNote[]> {
    return this.makeRequest<ConnectWiseNote>(API_ENDPOINTS.projectNotes(projectId), {
      params: {
        pageSize: 1000,
      },
    });
  }
}

export const connectwiseService = new ConnectWiseService();

