import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

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

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(''); // '' for all statuses

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('reservations')
        .select('id, user_name, course_title, reservation_datetime_1, participants, status, staff, created_at');

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setReservations(data as Reservation[]);
      setLoading(false);
    };

    fetchReservations();
  }, [filterStatus]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '未確認':
        return 'bg-blue-200 text-blue-800';
      case '確認済':
        return 'bg-green-200 text-green-800';
      case '完了':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-4">読み込み中...</div>;
  if (error) return <div className="text-center py-4 text-red-500">エラー: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">予約一覧</h1>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-gray-700">ステータスで絞り込み:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={handleFilterChange}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">すべて</option>
            <option value="未確認">未確認</option>
            <option value="確認済">確認済</option>
            <option value="完了">完了</option>
          </select>
        </div>
        <Link to="/reservations/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          新規予約追加
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full md:min-w-max bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ユーザー名</th>
              <th className="py-3 px-4 text-left">コース名</th>
              <th className="py-3 px-4 text-left">予約日時</th>
              <th className="py-3 px-4 text-left">参加人数</th>
              <th className="py-3 px-4 text-left">ステータス</th>
              <th className="py-3 px-4 text-left">担当スタッフ</th>
              <th className="py-3 px-4 text-left">作成日時</th>
              <th className="py-3 px-4 text-left">アクション</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">{reservation.user_name}</td>
                <td className="py-3 px-4">{reservation.course_title}</td>
                <td className="py-3 px-4">{new Date(reservation.reservation_datetime_1).toLocaleString()}</td>
                <td className="py-3 px-4">{reservation.participants}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                </td>
                <td className="py-3 px-4">{reservation.staff}</td>
                <td className="py-3 px-4">{new Date(reservation.created_at).toLocaleString()}</td>
                <td className="py-3 px-4">
                  <Link
                    to={`/reservations/${reservation.id}`}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reservations.length === 0 && !loading && !error && (
        <p className="text-center py-8 text-gray-500">予約データがありません。</p>
      )}
    </div>
  );
};

export default Reservations;
