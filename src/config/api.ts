export const API_CONFIG = {
  baseURL: import.meta.env.VITE_CW_BASE_URL || 'https://na.myconnectwise.net',
  companyId: import.meta.env.VITE_CW_COMPANY_ID || 'wolfflogics',
  clientId: import.meta.env.VITE_CW_CLIENT_ID || '',
  publicKey: import.meta.env.VITE_CW_PUBLIC_KEY || '',
  privateKey: import.meta.env.VITE_CW_PRIVATE_KEY || '',
  apiVersion: '2023.1', // ConnectWise API version
};

export const AI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  enabled: !!import.meta.env.VITE_OPENAI_API_KEY,
};

export const API_ENDPOINTS = {
  timeEntries: '/time/entries',
  tickets: '/service/tickets',
  projects: '/project/projects',
  members: '/system/members',
  boards: '/service/boards',
  ticketNotes: (ticketId: number) => `/service/tickets/${ticketId}/notes`,
  projectNotes: (projectId: number) => `/project/projects/${projectId}/notes`,
};

