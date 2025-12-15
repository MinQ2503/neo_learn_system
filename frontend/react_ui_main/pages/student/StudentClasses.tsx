import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, ClassGroup } from '../../types';
import { classService } from '../../services/api/classService';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded for demo: "s1" is the current logged-in student
  const CURRENT_STUDENT_ID = "s1";

  useEffect(() => {
    const loadClasses = async () => {
        const data = await classService.getStudentClasses(CURRENT_STUDENT_ID);
        setClasses(data);
        setLoading(false);
    };
    loadClasses();
  }, []);

  return (
    <Layout role={Role.STUDENT} title="My Classes">
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading your schedule...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
                <ClayCard 
                    key={cls.id} 
                    className="p-6 group cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => navigate(`/student/classes/${cls.id}`)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 font-bold text-xl">
                            {cls.subject.substring(0,2).toUpperCase()}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-colors">
                            <ChevronRight size={18} />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{cls.subject}</p>
                    
                    <div className="space-y-2 border-t border-gray-100 pt-3">
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{cls.schedule}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <BookOpen size={16} className="text-gray-400" />
                            <span>{cls.lessons?.length || 0} Lessons</span>
                        </div>
                    </div>
                </ClayCard>
            ))}
            {classes.length === 0 && (
                <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-3xl shadow-clay-inset">
                    You are not enrolled in any classes yet.
                </div>
            )}
        </div>
      )}
    </Layout>
  );
};

export default StudentClasses;
