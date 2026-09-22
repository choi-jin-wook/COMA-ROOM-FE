import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Notice {
  id: number;
  title: string;
  type: "일반" | "중요";
  category: "운영" | "일정" | "행사" | "안내";
  author: string;
  date: string;
  content: string;
  isPinned: boolean;
  isPublic: boolean;
}

interface NoticeContextType {
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id'>) => void;
  updateNotice: (id: number, notice: Partial<Notice>) => void;
  deleteNotice: (id: number) => void;
  togglePin: (id: number) => void;
  togglePublic: (id: number) => void;
}

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

// 초기 공지사항 데이터
const initialNotices: Notice[] = [];

export const NoticeProvider = ({ children }: { children: ReactNode }) => {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);

  const addNotice = (notice: Omit<Notice, 'id'>) => {
    const newNotice: Notice = {
      ...notice,
      id: Date.now(),
    };
    setNotices(prev => [newNotice, ...prev]);
  };

  const updateNotice = (id: number, updatedFields: Partial<Notice>) => {
    setNotices(prev => prev.map(notice => 
      notice.id === id ? { ...notice, ...updatedFields } : notice
    ));
  };

  const deleteNotice = (id: number) => {
    setNotices(prev => prev.filter(notice => notice.id !== id));
  };

  const togglePin = (id: number) => {
    setNotices(prev => prev.map(notice => 
      notice.id === id ? { ...notice, isPinned: !notice.isPinned } : notice
    ));
  };

  const togglePublic = (id: number) => {
    setNotices(prev => prev.map(notice => 
      notice.id === id ? { ...notice, isPublic: !notice.isPublic } : notice
    ));
  };

  return (
    <NoticeContext.Provider value={{ notices, addNotice, updateNotice, deleteNotice, togglePin, togglePublic }}>
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const context = useContext(NoticeContext);
  if (context === undefined) {
    throw new Error('useNotice must be used within a NoticeProvider');
  }
  return context;
};
