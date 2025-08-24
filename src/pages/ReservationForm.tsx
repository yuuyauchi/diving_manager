import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

interface Reservation {
  id?: number;
  user_name: string;
  course_title: string;
  reservation_datetime_1: string;
  participants: number;
  status: string;
  staff: string;
}

const ReservationForm = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Reservation>({
    user_name: '',
    course_title: '',
    reservation_datetime_1: '',
    participants: 1,
    status: '未確認',
    staff: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<string[]>([]);

  const isEditMode = !!id;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      // Fetch courses first
      const { data: coursesData, error: coursesError } = await supabase
        .from('diving_courses')
        .select('title');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError.message);
        setError('コースの取得に失敗しました。');
        setLoading(false);
        return;
      }
      if (coursesData) {
        setCourses(coursesData.map(course => course.title));
      }

      // If in edit mode, fetch reservation data
      if (isEditMode) {
        const { data: reservationData, error: reservationError } = await supabase
          .from('reservations')
          .select('*')
          .eq('id', id)
          .single();

        if (reservationError) {
          setError(reservationError.message);
          setLoading(false);
          return;
        }
        if (reservationData) {
          const formattedDateTime = reservationData.reservation_datetime_1 ? new Date(reservationData.reservation_datetime_1).toISOString().slice(0, 16) : '';
          setFormData({ ...reservationData, reservation_datetime_1: formattedDateTime });
        }
      }
      setLoading(false);
    };

    fetchInitialData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'participants' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let operation;
    if (isEditMode) {
      operation = supabase.from('reservations').update(formData).eq('id', id);
    } else {
      operation = supabase.from('reservations').insert(formData);
    }

    const { error } = await operation;

    if (error) {
      setError(error.message);
    } else {
      navigate('/reservations');
    }
    setLoading(false);
  };

  if (loading) return <div className="text-center py-4">読み込み中...</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{isEditMode ? '予約編集' : '新規予約追加'}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {error && <p className="text-red-500 mb-4">エラー: {error}</p>}

        <div className="mb-4">
          <label htmlFor="user_name" className="block text-gray-700 text-sm font-bold mb-2">ユーザー名</label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="course_title" className="block text-gray-700 text-sm font-bold mb-2">コース名</label>
          <select
            id="course_title"
            name="course_title"
            value={formData.course_title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">コースを選択してください</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="reservation_datetime_1" className="block text-gray-700 text-sm font-bold mb-2">予約日時</label>
          <input
            type="datetime-local"
            id="reservation_datetime_1"
            name="reservation_datetime_1"
            value={formData.reservation_datetime_1}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="participants" className="block text-gray-700 text-sm font-bold mb-2">参加人数</label>
          <input
            type="number"
            id="participants"
            name="participants"
            value={formData.participants}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">ステータス</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="未確認">未確認</option>
            <option value="確認済">確認済</option>
            <option value="完了">完了</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="staff" className="block text-gray-700 text-sm font-bold mb-2">担当スタッフ</label>
          <input
            type="text"
            id="staff"
            name="staff"
            value={formData.staff}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? '保存中...' : (isEditMode ? '更新' : '追加')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
