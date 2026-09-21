import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface RankingMember {
  rank: number;
  name: string;
  anonymousName: string;
  department: string;
  xp: number;
  isMe?: boolean;
}

interface LeaderboardContextType {
  rankings: RankingMember[];
  myRanking: RankingMember | null;
  updateMemberXP: (name: string, xpDelta: number) => void;
  setMemberXP: (name: string, newXP: number) => void;
  updateMemberInfo: (name: string, updates: Partial<RankingMember>) => void;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

// 초기 랭킹 데이터
const initialRankings: RankingMember[] = [];

export const LeaderboardProvider = ({ children }: { children: ReactNode }) => {
  const [rankings, setRankings] = useState<RankingMember[]>(initialRankings);

  // 내 랭킹 찾기
  const myRanking = rankings.find(r => r.isMe) || null;

  // XP 델타 업데이트 및 랭킹 재계산
  const updateMemberXP = (name: string, xpDelta: number) => {
    setRankings(prev => {
      const updated = prev.map(member => 
        member.name === name 
          ? { ...member, xp: Math.max(0, member.xp + xpDelta) }
          : member
      );
      
      return updated
        .sort((a, b) => b.xp - a.xp)
        .map((member, index) => ({ ...member, rank: index + 1 }));
    });
  };

  // XP 직접 설정 (관리자용)
  const setMemberXP = (name: string, newXP: number) => {
    setRankings(prev => {
      const updated = prev.map(member => 
        member.name === name 
          ? { ...member, xp: Math.max(0, newXP) }
          : member
      );
      
      return updated
        .sort((a, b) => b.xp - a.xp)
        .map((member, index) => ({ ...member, rank: index + 1 }));
    });
  };

  // 멤버 정보 업데이트 (관리자용)
  const updateMemberInfo = (name: string, updates: Partial<RankingMember>) => {
    setRankings(prev => {
      const updated = prev.map(member => 
        member.name === name 
          ? { ...member, ...updates }
          : member
      );
      
      return updated
        .sort((a, b) => b.xp - a.xp)
        .map((member, index) => ({ ...member, rank: index + 1 }));
    });
  };

  return (
    <LeaderboardContext.Provider value={{ rankings, myRanking, updateMemberXP, setMemberXP, updateMemberInfo }}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};
