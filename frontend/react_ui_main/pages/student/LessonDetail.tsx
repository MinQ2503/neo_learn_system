
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, Lesson, ClassGroup } from '../../types';
import { lessonService } from '../../services/api/lessonService';
import { classService } from '../../services/api/classService';
import { ArrowLeft, PlayCircle, Download, FileText, Calendar, User } from 'lucide-react';

const LessonDetail: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (lessonId) loadData();
  }, [lessonId]);

  const loadData = async () => {
    setLoading(true);
    const allLessons = await lessonService.getAllGlobal();
    const found = allLessons.find(l => l.id === lessonId);
    if (found) setLesson(found);
    setLoading(false);
  };

  if (loading) return <Layout role={Role.STUDENT} title="Học tập"><div className="p-20 text-center animate-pulse">Đang tải bài học...</div></Layout>;
  if (!lesson) return <Layout role={Role.STUDENT} title="Lỗi"><div className="p-20 text-center">Không tìm thấy nội dung bài học.</div></Layout>;

  return (
    <Layout role={Role.STUDENT} title="Bài giảng">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-8 font-bold text-sm group transition-all">
        <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" /> Quay lại khóa học
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ClayCard className="p-8">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded uppercase tracking-widest">Nội dung chính</span>
                   <h2 className="text-3xl font-black text-gray-800 mt-2">{lesson.title}</h2>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-clay-sm ${lesson.type === 'video' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'}`}>
                   {lesson.type === 'video' ? <PlayCircle size={32} /> : <FileText size={32} />}
                </div>
             </div>

             <div className="prose prose-indigo max-w-none mb-10">
                <div className="p-6 rounded-3xl bg-gray-50 shadow-clay-inset text-gray-700 leading-relaxed italic border border-white">
                    {lesson.description || "Không có mô tả cho bài học này."}
                </div>
                <div className="mt-8 text-gray-800 space-y-4">
                    {lesson.content ? (
                       <p className="whitespace-pre-wrap">{lesson.content}</p>
                    ) : (
                       <p className="text-gray-400 italic">Vui lòng tải xuống tài liệu đi kèm để xem nội dung chi tiết bài học.</p>
                    )}
                </div>
             </div>
          </ClayCard>
        </div>

        <div className="space-y-6">
           <ClayCard className="p-6">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Thông tin bài giảng</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <User size={18} className="text-primary-500" />
                    <div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Giảng viên</p>
                       <p className="text-xs font-black text-gray-700">{lesson.teacherName}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <Calendar size={18} className="text-primary-500" />
                    <div>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Ngày cập nhật</p>
                       <p className="text-xs font-black text-gray-700">{new Date(lesson.dateAdded).toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
           </ClayCard>

           <ClayCard className="p-6 bg-primary-500 text-white shadow-clay">
              <h3 className="text-sm font-black text-primary-100 uppercase tracking-widest mb-6">Tài liệu đính kèm</h3>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white text-primary-600 flex items-center justify-center font-black text-xs uppercase">
                       {lesson.format}
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-xs font-black truncate">{lesson.title}</p>
                       <p className="text-[9px] opacity-70">Dung lượng: 2.4 MB</p>
                    </div>
                 </div>
                 <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-50 transition-colors">
                    <Download size={14} /> Tải tài liệu về máy
                 </button>
              </div>
           </ClayCard>
        </div>
      </div>
    </Layout>
  );
};

export default LessonDetail;
