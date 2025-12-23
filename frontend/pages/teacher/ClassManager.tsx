import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, ClassGroup } from '../../types';
import { classService } from '../../services/api/classService';
import { Plus, Edit2, Trash2, Calendar, Users, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassManager: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [formData, setFormData] = useState({ name: '', subject: '', schedule: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const data = await classService.getAll();
    setClasses(data);
  };

  const handleSubmit = async () => {
    if (editingClass) {
        await classService.update(editingClass.id, formData);
    } else {
        await classService.create({ ...formData, studentCount: 0, studentIds: [], lessons: [], assignments: [] });
    }
    setIsModalOpen(false);
    fetchClasses();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this class?')) {
        await classService.delete(id);
        fetchClasses();
    }
  };

  const openModal = (e?: React.MouseEvent, cls?: ClassGroup) => {
    e?.stopPropagation();
    if (cls) {
        setEditingClass(cls);
        setFormData({ name: cls.name, subject: cls.subject, schedule: cls.schedule });
    } else {
        setEditingClass(null);
        setFormData({ name: '', subject: '', schedule: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <Layout role={Role.TEACHER} title="Class Management">
        <div className="flex justify-end mb-6">
            <ClayButton onClick={(e) => openModal(e)}><Plus size={20} /> Create Class</ClayButton>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
                <ClayCard 
                    key={cls.id} 
                    className="p-6 group cursor-pointer hover:scale-[1.01] transition-transform"
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600 font-bold text-xl">
                            {cls.subject.substring(0,2).toUpperCase()}
                        </div>
                        <div className="flex gap-1">
                             <button onClick={(e) => openModal(e, cls)} className="p-2 hover:bg-gray-200 rounded-full"><Edit2 size={16} /></button>
                             <button onClick={(e) => handleDelete(cls.id, e)} className="p-2 hover:bg-red-100 text-red-500 rounded-full"><Trash2 size={16} /></button>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{cls.subject}</p>
                    
                    <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span>{cls.studentIds?.length || 0} Students</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{cls.schedule}</span>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Manage Details</span>
                        <ExternalLink size={16} />
                    </div>
                </ClayCard>
            ))}
        </div>

        <ClayModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingClass ? "Edit Class" : "Create New Class"}
            footer={
                <div className="flex justify-end gap-3">
                    <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Cancel</ClayButton>
                    <ClayButton onClick={handleSubmit}>Save Class</ClayButton>
                </div>
            }
        >
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Class Name</label>
                    <input className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Calculus 101" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                    <input className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="e.g. Mathematics" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Schedule</label>
                    <input className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})} placeholder="e.g. Mon/Wed 10 AM" />
                </div>
            </div>
        </ClayModal>
    </Layout>
  );
};

export default ClassManager;
