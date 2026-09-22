import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface XPActivity {
  id: number;
  title: string;
  type: "출석" | "행사" | "투표";
  date: string;
  xp: number;
}

interface XPContextType {
  totalXP: number;
  activities: XPActivity[];
  addXP: (amount: number, title: string, type: "출석" | "행사" | "투표") => void;
  setTotalXP: (amount: number) => void;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

const initialActivities: XPActivity[] = [];

const initialTotalXP = initialActivities.reduce((sum, a) => sum + a.xp, 0);

export const XPProvider = ({ children }: { children: ReactNode }) => {
  const [totalXP, setTotalXPState] = useState(initialTotalXP);
  const [activities, setActivities] = useState<XPActivity[]>(initialActivities);

  const addXP = useCallback((amount: number, title: string, type: "출석" | "행사" | "투표") => {
    const today = new Date();
    const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
    
    const newActivity: XPActivity = {
      id: Date.now(),
      title,
      type,
      date: dateStr,
      xp: amount,
    };

    setActivities(prev => [newActivity, ...prev]);
    setTotalXPState(prev => prev + amount);
  }, []);

  // 관리자가 직접 XP를 설정할 때 사용
  const setTotalXP = useCallback((amount: number) => {
    setTotalXPState(amount);
  }, []);

  return (
    <XPContext.Provider value={{ totalXP, activities, addXP, setTotalXP }}>
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error("useXP must be used within an XPProvider");
  }
  return context;
};
