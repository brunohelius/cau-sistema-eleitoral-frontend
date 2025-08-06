import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../../hooks/useAuth';
import { communicationApi } from '../../services/api/communicationApi';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error' | 'System';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // Configurar SignalR
  useEffect(() => {
    if (token && user) {
      const newConnection = new HubConnectionBuilder()
        .withUrl('/api/notificationHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      newConnection.start()
        .then(() => {
          console.log('Conectado ao NotificationHub');
          
          // Escutar notificações
          newConnection.on('ReceiveNotification', (notification: any) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Mostrar notificação do browser se permitido
            if (Notification.permission === 'granted') {
              new Notification(notification.message, {
                icon: '/favicon.ico',
                tag: `notification_${notification.id}`
              });
            }
          });

          // Escutar quando notificação é marcada como lida
          newConnection.on('NotificationMarkedAsRead', (notificationId: number) => {
            setNotifications(prev => 
              prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
          });

          // Escutar quando todas são marcadas como lidas
          newConnection.on('AllNotificationsMarkedAsRead', () => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
          });

        })
        .catch(console.error);

      setConnection(newConnection);

      return () => {
        newConnection.stop();
      };
    }
  }, [token, user]);

  // Carregar notificações iniciais
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    // Solicitar permissão para notificações do browser
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await communicationApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await communicationApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Erro ao carregar contador:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await communicationApi.markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      await communicationApi.markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string, iconName?: string) => {
    if (iconName) {
      // Mapeamento de ícones personalizados
      const iconMap: { [key: string]: React.ReactNode } = {
        'status-change': <AlertTriangle className="w-4 h-4" />,
        'gavel': <Info className="w-4 h-4" />,
        'clock': <AlertTriangle className="w-4 h-4" />,
        'alert-triangle': <AlertTriangle className="w-4 h-4" />
      };
      
      if (iconMap[iconName]) return iconMap[iconName];
    }

    // Ícones padrão por tipo
    switch (type) {
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'Error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'Success':
        return 'border-l-green-500 bg-green-50';
      case 'Warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'Error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Notificações</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getNotificationStyles(notification.type)} ${
                    !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                  } border-b last:border-b-0 hover:bg-opacity-75 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type, notification.icon)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                        {notification.actionUrl && notification.actionText && (
                          <a
                            href={notification.actionUrl}
                            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                          >
                            {notification.actionText} →
                          </a>
                        )}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <a
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ver todas as notificações
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;