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
  private authToken: string | null = null;

  constructor() {
    // ConnectWise Manage API v3 uses Basic Auth with publicKey:privateKey
    const authString = btoa(`${API_CONFIG.publicKey}:${API_CONFIG.privateKey}`);
    
    this.api = axios.create({
      baseURL: `${API_CONFIG.baseURL}/v${API_CONFIG.apiVersion.replace('.', '_')}/apis/3.0`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
        'clientId': API_CONFIG.clientId,
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
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
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

