import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, type View } from 'react-big-calendar';
import moment from 'moment';
import { supabase } from '../lib/supabaseClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Removed custom View type definition

interface Reservation {
  id: number;
  user_name: string;
  course_title: string;
  reservation_datetime_1: string;
  participants: number;
  status: string;
  staff: string;
  created_at: string;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  // Add all reservation fields to the event object for display in modal
  reservationDetails: Reservation;
}

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('month'); // Use imported View type
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('reservations')
        .select('id, user_name, course_title, reservation_datetime_1, participants, status, staff, created_at'); // Fetch all fields

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const calendarEvents: CalendarEvent[] = data.map((res: Reservation) => {
          const reservationTime = new Date(res.reservation_datetime_1);
          const endTime = new Date(reservationTime.getTime() + 60 * 60 * 1000); // Assuming 1 hour duration
          return {
            title: `${res.user_name} - ${res.course_title}`,
            start: reservationTime,
            end: endTime,
            reservationDetails: res, // Store full reservation details
          };
        });
        setEvents(calendarEvents);
      }
      setLoading(false);
    };

    fetchReservations();
  }, []);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  if (loading) return <div className="text-center py-4">読み込み中...</div>;
  if (error) return <div className="text-center py-4 text-red-500">エラー: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">予約カレンダー</h1>
      <div style={{ height: 700 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: '次',
            previous: '前',
            today: '今日',
            month: '月',
            week: '週',
            day: '日',
            agenda: '予定',
            date: '日付',
            time: '時間',
            event: 'イベント',
            noEventsInRange: 'この期間にイベントはありません。',
          }}
        />
      </div>

      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">予約詳細</h2>
            <p><strong>ユーザー名:</strong> {selectedEvent.reservationDetails.user_name}</p>
            <p><strong>コース名:</strong> {selectedEvent.reservationDetails.course_title}</p>
            <p><strong>予約日時:</strong> {new Date(selectedEvent.reservationDetails.reservation_datetime_1).toLocaleString()}</p>
            <p><strong>参加人数:</strong> {selectedEvent.reservationDetails.participants}</p>
            <p><strong>ステータス:</strong> {selectedEvent.reservationDetails.status}</p>
            <p><strong>担当スタッフ:</strong> {selectedEvent.reservationDetails.staff}</p>
            <p><strong>作成日時:</strong> {new Date(selectedEvent.reservationDetails.created_at).toLocaleString()}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
