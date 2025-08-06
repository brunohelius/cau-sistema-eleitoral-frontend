import { ApiResponse } from '../../types/api';
import { apiClient } from './client';

export interface EmailTemplate {
  id: number;
  name: string;
  displayName: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  category: string;
  isActive: boolean;
  variables?: string;
  description?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error' | 'System';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  expiresAt: string;
  icon?: string;
  data?: string;
}

export interface EmailLog {
  id: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  status: 'Pending' | 'Sent' | 'Failed' | 'Queued';
  sentAt?: string;
  errorMessage?: string;
  attempts: number;
  jobType?: string;
  referenceId?: string;
  createdAt: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export interface SendTemplateEmailRequest {
  to: string;
  templateName: string;
  model: any;
  cc?: string;
  bcc?: string;
}

export interface BulkEmailRequest {
  recipients: string[];
  templateName: string;
  model: any;
}

export interface ConviteMembroChapaRequest {
  chapaId: number;
  membroId: number;
  conviteToken: string;
  baseUrl: string;
  prazoConfirmacao: string;
}

export interface JulgamentoFinalRequest {
  julgamentoId: number;
  tipo: string;
  baseUrl: string;
}

export interface ExtratoProfissionaisRequest {
  ufId: number;
  formato: 'PDF' | 'EXCEL' | 'CSV';
}

export interface SendNotificationRequest {
  userId?: number;
  userIds?: number[];
  groupName?: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error' | 'System';
}

class CommunicationApi {
  // Email Management
  async sendEmail(request: SendEmailRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/communication/email/send', request);
  }

  async sendTemplateEmail(request: SendTemplateEmailRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/communication/email/send-template', request);
  }

  async queueEmail(message: any): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/communication/email/queue', message);
  }

  async sendBulkEmail(request: BulkEmailRequest): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/communication/email/bulk', request);
  }

  async getEmailLogs(filters?: {
    userId?: number;
    from?: string;
    to?: string;
  }): Promise<EmailLog[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const response = await apiClient.get(`/communication/email/logs?${params.toString()}`);
    return response.data;
  }

  // Email Templates
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    const response = await apiClient.get(`/communication/templates${params}`);
    return response.data;
  }

  async getTemplate(name: string): Promise<EmailTemplate> {
    const response = await apiClient.get(`/communication/templates/${encodeURIComponent(name)}`);
    return response.data;
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const response = await apiClient.post('/communication/templates', template);
    return response.data;
  }

  async updateTemplate(id: number, template: EmailTemplate): Promise<EmailTemplate> {
    const response = await apiClient.put(`/communication/templates/${id}`, template);
    return response.data;
  }

  async deleteTemplate(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/communication/templates/${id}`);
    return response.data;
  }

  async previewTemplate(name: string, model: any): Promise<{
    subject: string;
    htmlBody: string;
    template: string;
  }> {
    const response = await apiClient.post(`/communication/templates/${encodeURIComponent(name)}/preview`, model);
    return response.data;
  }

  // Notifications
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await apiClient.get(`/communication/notifications${params}`);
    return response.data;
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/communication/notifications/unread-count');
    return response.data;
  }

  async markAsRead(notificationId: number): Promise<{ success: boolean }> {
    const response = await apiClient.post(`/communication/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await apiClient.post('/communication/notifications/read-all');
    return response.data;
  }

  async sendNotification(request: SendNotificationRequest): Promise<{ success: boolean }> {
    const response = await apiClient.post('/communication/notifications/send', request);
    return response.data;
  }

  // Electoral Jobs
  async enviarConviteMembroChapa(request: ConviteMembroChapaRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/communication/jobs/convite-membro-chapa', request);
    return response.data;
  }

  async enviarJulgamentoFinal(request: JulgamentoFinalRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/communication/jobs/julgamento-final', request);
    return response.data;
  }

  async gerarExtratoProfissionais(request: ExtratoProfissionaisRequest): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/communication/jobs/extrato-profissionais', request);
    return response.data;
  }

  // Template Categories
  getTemplateCategories(): string[] {
    return [
      'Chapa',
      'Julgamento', 
      'Relatório',
      'Denúncia',
      'Impugnação',
      'Sistema',
      'Geral'
    ];
  }

  // Notification Types
  getNotificationTypes(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'Info', label: 'Informação', color: 'blue' },
      { value: 'Success', label: 'Sucesso', color: 'green' },
      { value: 'Warning', label: 'Aviso', color: 'yellow' },
      { value: 'Error', label: 'Erro', color: 'red' },
      { value: 'System', label: 'Sistema', color: 'gray' }
    ];
  }

  // Email Status Types  
  getEmailStatusTypes(): Array<{ value: string; label: string; color: string }> {
    return [
      { value: 'Pending', label: 'Pendente', color: 'yellow' },
      { value: 'Sent', label: 'Enviado', color: 'green' },
      { value: 'Failed', label: 'Falha', color: 'red' },
      { value: 'Queued', label: 'Na Fila', color: 'blue' }
    ];
  }
}

export const communicationApi = new CommunicationApi();