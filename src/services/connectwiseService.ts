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
    
    // Use proxy in development to avoid CORS issues
    // In production, you may need a backend proxy or CORS configuration
    const isDev = import.meta.env.DEV;
    const apiBase = isDev 
      ? '/api/connectwise'  // Use Vite proxy in development
      : API_CONFIG.baseURL; // Use direct URL in production
    
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
      usingProxy: isDev,
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
    
    try {
      const response = await axios.get<T[]>(fullURL, {
        ...config,
        headers: {
          ...this.headers,
          ...config?.headers,
        },
      });
      return response.data || [];
    } catch (error: any) {
      console.error(`Error fetching ${fullURL}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Request URL:', fullURL);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
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

