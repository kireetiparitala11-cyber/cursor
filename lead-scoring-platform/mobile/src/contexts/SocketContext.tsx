import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import Toast from 'react-native-toast-message';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Join user-specific room
        newSocket.emit('join-room', `user_${user.id}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Lead-related events
      newSocket.on('new_lead', (lead) => {
        Toast.show({
          type: 'success',
          text1: 'New Lead',
          text2: `${lead.firstName} ${lead.lastName}`,
        });
      });

      newSocket.on('lead_updated', (lead) => {
        Toast.show({
          type: 'info',
          text1: 'Lead Updated',
          text2: `${lead.firstName} ${lead.lastName}`,
        });
      });

      newSocket.on('lead_deleted', (data) => {
        Toast.show({
          type: 'info',
          text1: 'Lead Deleted',
          text2: 'Lead has been removed',
        });
      });

      newSocket.on('lead_note_added', (data) => {
        Toast.show({
          type: 'info',
          text1: 'Note Added',
          text2: 'A note has been added to a lead',
        });
      });

      newSocket.on('lead_interaction_added', (data) => {
        Toast.show({
          type: 'info',
          text1: 'Interaction Recorded',
          text2: 'New interaction has been logged',
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, token]);

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('join-room', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leave-room', room);
    }
  };

  const value: SocketContextType = {
    socket,
    connected,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};