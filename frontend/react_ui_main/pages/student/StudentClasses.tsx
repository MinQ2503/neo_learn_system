
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, ClassGroup } from '../../types';
import { classService } from '../../services/api/classService';
import { getCurrentUser } from '../../services/mockService';
import { BookOpen, Calendar, ChevronRight, GraduationCap, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentClasses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    if (user) {
        const loadClasses = async () => {
            const data = await classService.getStudentClasses(user.id);
            setCourses(data);
            setLoading(false);
        };
        loadClasses();
    }
  }, [user]);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (course.teacherName && course.teacherName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout role={Role.STUDENT} title="Khóa học của tôi">
      <div className="mb-8 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo tên khóa học hoặc tên giáo viên..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Đang tải danh sách khóa học...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
                <ClayCard 
                    key={course.id} 
                    className="p-6 group cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-600 shadow-clay-sm">
                            <BookOpen size={24} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white shadow-clay flex items-center justify-center text-gray-300 group-hover:text-primary-500 transition-colors">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-800 mb-1 leading-tight">{course.name}</h3>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-6">{course.subject}</p>
                    
                    <div className="space-y-3 border-t border-gray-100 pt-5">
                        <div className="flex items-center text-[10px] font-bold text-gray-500 gap-2 uppercase tracking-tight">
                            <GraduationCap size={14} className="text-primary-400" />
                            <span>GV: <span className="text-gray-800">{course.teacherName}</span></span>
                        </div>
                        <div className="flex items-center text-[10px] font-bold text-gray-500 gap-2 uppercase tracking-tight">
                            <Calendar size={14} className="text-primary-400" />
                            <span>{course.schedule}</span>
                        </div>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                </ClayCard>
            ))}
            {filteredCourses.length === 0 && (
                <div className="col-span-full p-20 text-center text-gray-400 bg-white/50 rounded-[40px] shadow-clay-inset border-2 border-dashed border-gray-200">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold italic">
                        {courses.length === 0 ? "Bạn chưa được gán vào khóa học nào." : "Không tìm thấy khóa học phù hợp với từ khóa."}
                    </p>
                </div>
            )}
        </div>
      )}
    </Layout>
  );
};

export default StudentClasses;
