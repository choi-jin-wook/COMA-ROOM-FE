import { createContext, useContext, useState, ReactNode } from "react";

interface ScheduleEvent {
  id: number;
  title: string;
  date: string;
  participants: number;
  xp: number;
  isJoined?: boolean;
}

interface ScheduleContextType {
  upcomingEvents: ScheduleEvent[];
  pastEvents: ScheduleEvent[];
  toggleEventJoin: (eventId: number) => void;
  mainScheduleJoined: boolean;
  toggleMainSchedule: () => void;
  mainScheduleParticipants: number;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [upcomingEvents, setUpcomingEvents] = useState<ScheduleEvent[]>([]);

  const [pastEvents] = useState<ScheduleEvent[]>([]);

  // Main page schedule
  const [mainScheduleJoined, setMainScheduleJoined] = useState(false);
  const [mainScheduleParticipants, setMainScheduleParticipants] = useState(0);

  const toggleEventJoin = (eventId: number) => {
    setUpcomingEvents(prev =>
      prev.map(event => {
        if (event.id === eventId) {
          return {
            ...event,
            isJoined: !event.isJoined,
            participants: event.isJoined ? event.participants - 1 : event.participants + 1,
          };
        }
        return event;
      })
    );
  };

  const toggleMainSchedule = () => {
    setMainScheduleJoined(prev => !prev);
    setMainScheduleParticipants(prev => mainScheduleJoined ? prev - 1 : prev + 1);
  };

  return (
    <ScheduleContext.Provider
      value={{
        upcomingEvents,
        pastEvents,
        toggleEventJoin,
        mainScheduleJoined,
        toggleMainSchedule,
        mainScheduleParticipants,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};
