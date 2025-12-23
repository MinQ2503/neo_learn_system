import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, User } from '../../types';
import { studentService } from '../../services/api/studentService';
import { Plus, Edit2, Trash2, Search, Mail, Hash } from 'lucide-react';

const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', studentId: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const data = await studentService.getAll();
    setStudents(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, formData);
      } else {
        await studentService.create({ ...formData, role: Role.STUDENT });
      }
      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
        await studentService.delete(id);
        fetchStudents();
    }
  };

  const openEdit = (student: User) => {
    setEditingStudent(student);
    setFormData({ 
        name: student.name, 
        email: student.email || '', 
        studentId: student.studentId || '' 
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', studentId: '' });
  };

  return (
    <Layout role={Role.TEACHER} title="Student Management">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Search students..." 
                className="w-full pl-10 pr-4 py-3 rounded-2xl border-none shadow-clay-inset bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
        </div>
        <ClayButton onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={20} /> Add Student
        </ClayButton>
      </div>

      {loading && !isModalOpen ? (
        <div className="text-center py-10 text-gray-500">Loading directory...</div>
      ) : (
        <div className="grid gap-4">
            {students.map(student => (
                <ClayCard key={student.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">{student.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Hash size={14} /> {student.studentId}</span>
                                <span className="flex items-center gap-1"><Mail size={14} /> {student.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => openEdit(student)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                </ClayCard>
            ))}
            {students.length === 0 && <div className="text-center text-gray-500">No students found.</div>}
        </div>
      )}

      <ClayModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudent ? "Edit Student" : "Add New Student"}
        footer={
            <div className="flex justify-end gap-3">
                <ClayButton variant="neutral" onClick={() => setIsModalOpen(false)}>Cancel</ClayButton>
                <ClayButton onClick={handleSubmit}>{editingStudent ? 'Save Changes' : 'Create Student'}</ClayButton>
            </div>
        }
      >
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                    type="text" 
                    className="w-full p-3 rounded-xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Student ID</label>
                <input 
                    type="text" 
                    className="w-full p-3 rounded-xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none" 
                    value={formData.studentId}
                    onChange={e => setFormData({...formData, studentId: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                <input 
                    type="email" 
                    className="w-full p-3 rounded-xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                />
            </div>
        </form>
      </ClayModal>
    </Layout>
  );
};

export default StudentManager;
