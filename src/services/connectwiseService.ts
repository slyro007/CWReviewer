import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
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
  private api: AxiosInstance;

  constructor() {
    // ConnectWise Manage API v3 uses Basic Auth with publicKey:privateKey
    // Format: Basic base64(publicKey:privateKey)
    const authString = btoa(`${API_CONFIG.publicKey}:${API_CONFIG.privateKey}`);
    
    // ConnectWise API format: https://na.myconnectwise.net/v4_6_release/apis/3.0
    const baseURL = `${API_CONFIG.baseURL}/v4_6_release/apis/3.0`;
    
    console.log('ConnectWise API Config:', {
      baseURL,
      companyId: API_CONFIG.companyId,
      clientId: API_CONFIG.clientId ? `${API_CONFIG.clientId.substring(0, 8)}...` : 'MISSING',
      publicKey: API_CONFIG.publicKey ? 'SET' : 'MISSING',
      privateKey: API_CONFIG.privateKey ? 'SET' : 'MISSING',
    });
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': API_CONFIG.clientId, // clientId as header (not in URL)
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.error('ConnectWise authentication failed. Please check your API credentials.');
        }
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T[]> {
    try {
      const response = await this.api.get<T[]>(endpoint, config);
      return response.data || [];
    } catch (error: any) {
      console.error(`Error fetching ${endpoint}:`, error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        console.error('Request URL:', error.config?.url);
        console.error('Request headers:', error.config?.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  }

  async getMembers(): Promise<ConnectWiseMember[]> {
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
    return this.makeRequest<ConnectWiseNote>(
      API_ENDPOINTS.ticketNotes(ticketId),
      {
        params: {
          pageSize: 1000,
        },
      }
    );
  }

  async getProjectNotes(projectId: number): Promise<ConnectWiseNote[]> {
    return this.makeRequest<ConnectWiseNote>(
      API_ENDPOINTS.projectNotes(projectId),
      {
        params: {
          pageSize: 1000,
        },
      }
    );
  }
}

export const connectwiseService = new ConnectWiseService();

