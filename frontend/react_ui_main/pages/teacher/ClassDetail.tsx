import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import ClayModal from '../../components/ClayModal';
import { Role, ClassGroup, User, Lesson, Assignment, Exam } from '../../types';
import { classService } from '../../services/api/classService';
import { studentService } from '../../services/api/studentService';
import { examService } from '../../services/api/examService';
import { ArrowLeft, Users, BookOpen, FileText, Plus, Trash2, Calendar, FileCheck, CheckCircle2, Circle } from 'lucide-react';

const ClassDetail: React.FC = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'lessons' | 'homework' | 'exams'>('students');
  const [loading, setLoading] = useState(true);

  // Data Selectors
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddHW, setShowAddHW] = useState(false);
  const [showAssignExam, setShowAssignExam] = useState(false);

  // Forms
  const [lessonForm, setLessonForm] = useState<Partial<Lesson>>({ title: '', type: 'document', format: 'pdf', url: '' });
  const [hwForm, setHwForm] = useState<Partial<Assignment>>({ title: '', description: '', dueDate: '' });
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<string>('');
  const [selectedExamToAssign, setSelectedExamToAssign] = useState<string>('');

  useEffect(() => {
    if (classId) loadClass();
  }, [classId]);

  const loadClass = async () => {
    setLoading(true);
    const classes = await classService.getAll();
    const found = classes.find(c => c.id === classId);
    if (found) setCls(found);

    // Pre-fetch resources
    const [sData, eData] = await Promise.all([studentService.getAll(), examService.getAll()]);
    setAllStudents(sData);
    setAllExams(eData);
    setLoading(false);
  };

  const handleUpdateClass = async (updated: ClassGroup) => {
    await classService.update(updated.id, updated);
    setCls(updated);
  };

  // --- Students Logic ---
  const handleAddStudent = async () => {
    if (!cls || !selectedStudentToAdd) return;
    const newIds = [...(cls.studentIds || []), selectedStudentToAdd];
    await handleUpdateClass({ ...cls, studentIds: newIds });
    setShowAddStudent(false);
  };

  const handleRemoveStudent = async (sid: string) => {
    if (!cls || !confirm('Remove student from class?')) return;
    const newIds = cls.studentIds.filter(id => id !== sid);
    await handleUpdateClass({ ...cls, studentIds: newIds });
  };

  // --- Lessons Logic ---
  const handleAddLesson = async () => {
    if (!cls || !lessonForm.title) return;
    const newLesson: Lesson = {
        ...lessonForm as Lesson,
        id: `l-${Date.now()}`,
        dateAdded: new Date().toISOString()
    };
    await handleUpdateClass({ ...cls, lessons: [...(cls.lessons || []), newLesson] });
    setShowAddLesson(false);
    setLessonForm({ title: '', type: 'document', format: 'pdf', url: '' });
  };

  // --- Assignments Logic ---
  const handleAddHW = async () => {
    if (!cls || !hwForm.title) return;
    const newHW: Assignment = {
        ...hwForm as Assignment,
        id: `a-${Date.now()}`
    };
    await handleUpdateClass({ ...cls, assignments: [...(cls.assignments || []), newHW] });
    setShowAddHW(false);
    setHwForm({ title: '', description: '', dueDate: '' });
  };

  // --- Exams Logic ---
  const handleAssignExam = async () => {
    if (!cls || !selectedExamToAssign) return;
    await examService.toggleClassAssignment(selectedExamToAssign, cls.id, true);
    await loadClass(); // Reload to refresh exams list (as exam data source is external)
    setShowAssignExam(false);
  };

  const handleUnassignExam = async (eid: string) => {
    if (!cls || !confirm('Unassign this exam from the class?')) return;
    await examService.toggleClassAssignment(eid, cls.id, false);
    await loadClass();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!cls) return <div className="p-8">Class not found</div>;

  const assignedExams = allExams.filter(e => e.assignedClassIds?.includes(cls.id));
  const enrolledStudents = allStudents.filter(s => cls.studentIds?.includes(s.id));
  const availableStudents = allStudents.filter(s => !cls.studentIds?.includes(s.id));
  const availableExams = allExams.filter(e => !e.assignedClassIds?.includes(cls.id));

  return (
    <Layout role={Role.TEACHER} title="Class Details">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/teacher/classes')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800">{cls.name}</h2>
            <p className="text-gray-500">{cls.subject} • {cls.schedule}</p>
        </div>
      </div>

      <div className="flex mb-6 bg-white p-1 rounded-2xl shadow-sm max-w-2xl">
          {[
              { id: 'students', label: 'Students', icon: <Users size={16} /> },
              { id: 'lessons', label: 'Materials', icon: <BookOpen size={16} /> },
              { id: 'homework', label: 'Homework', icon: <FileText size={16} /> },
              { id: 'exams', label: 'Exams', icon: <FileCheck size={16} /> }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                  {tab.icon} {tab.label}
              </button>
          ))}
      </div>

      {/* --- STUDENTS TAB --- */}
      {activeTab === 'students' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">{enrolledStudents.length} Enrolled</h3>
                  <ClayButton className="py-2 px-4 text-sm" onClick={() => setShowAddStudent(true)}><Plus size={16} /> Add Student</ClayButton>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrolledStudents.map(student => (
                      <ClayCard key={student.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                                  {student.name.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-bold text-sm text-gray-800">{student.name}</p>
                                  <p className="text-xs text-gray-500">{student.studentId}</p>
                              </div>
                          </div>
                          <button onClick={() => handleRemoveStudent(student.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </ClayCard>
                  ))}
                  {enrolledStudents.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No students enrolled yet.</p>}
              </div>
          </div>
      )}

      {/* --- LESSONS TAB --- */}
      {activeTab === 'lessons' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Learning Materials</h3>
                  <ClayButton className="py-2 px-4 text-sm" onClick={() => setShowAddLesson(true)}><Plus size={16} /> Add Material</ClayButton>
              </div>
              <div className="space-y-3">
                  {cls.lessons?.map(lesson => (
                      <ClayCard key={lesson.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold uppercase text-xs border border-blue-100">
                                  {lesson.format}
                              </div>
                              <div>
                                  <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                                  <p className="text-xs text-gray-500 capitalize">{lesson.type} • Added {new Date(lesson.dateAdded).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <button className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </ClayCard>
                  ))}
                   {(!cls.lessons || cls.lessons.length === 0) && <p className="text-gray-500 text-center py-8">No materials added.</p>}
              </div>
          </div>
      )}

      {/* --- HOMEWORK TAB --- */}
      {activeTab === 'homework' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Assignments</h3>
                  <ClayButton className="py-2 px-4 text-sm" onClick={() => setShowAddHW(true)}><Plus size={16} /> Create Assignment</ClayButton>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  {cls.assignments?.map(hw => (
                      <ClayCard key={hw.id} className="p-6">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg text-gray-800">{hw.title}</h4>
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">Due {hw.dueDate}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{hw.description}</p>
                          <div className="flex justify-end border-t border-gray-100 pt-3">
                              <button className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                          </div>
                      </ClayCard>
                  ))}
                  {(!cls.assignments || cls.assignments.length === 0) && <p className="text-gray-500 text-center py-8 col-span-2">No assignments yet.</p>}
              </div>
          </div>
      )}

      {/* --- EXAMS TAB --- */}
      {activeTab === 'exams' && (
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Assigned Exams</h3>
                  <ClayButton className="py-2 px-4 text-sm" onClick={() => setShowAssignExam(true)}><Plus size={16} /> Assign Exam</ClayButton>
              </div>
              <div className="space-y-3">
                  {assignedExams.map(exam => (
                      <ClayCard key={exam.id} className="p-4 flex items-center justify-between border-l-4 border-primary-500">
                          <div>
                              <h4 className="font-bold text-gray-800">{exam.title}</h4>
                              <p className="text-xs text-gray-500">Duration: {exam.durationMinutes}m • Questions: {exam.questionIds.length}</p>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${exam.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                                  {exam.status.toUpperCase()}
                              </span>
                              <button onClick={() => handleUnassignExam(exam.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                          </div>
                      </ClayCard>
                  ))}
                  {assignedExams.length === 0 && <p className="text-gray-500 text-center py-8">No exams assigned to this class.</p>}
              </div>
          </div>
      )}

      {/* --- MODALS --- */}

      {/* Add Student Modal */}
      <ClayModal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} title="Enrol Student">
          <div className="space-y-4">
              <p className="text-sm text-gray-500">Select a student from the directory to add to <b>{cls.name}</b>.</p>
              <select 
                  className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                  value={selectedStudentToAdd}
                  onChange={(e) => setSelectedStudentToAdd(e.target.value)}
              >
                  <option value="">-- Select Student --</option>
                  {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>)}
              </select>
              <ClayButton className="w-full" onClick={handleAddStudent} disabled={!selectedStudentToAdd}>Add to Class</ClayButton>
          </div>
      </ClayModal>

      {/* Add Lesson Modal */}
      <ClayModal isOpen={showAddLesson} onClose={() => setShowAddLesson(false)} title="Upload Material">
          <div className="space-y-4">
              <input 
                  className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" 
                  placeholder="Lesson Title" 
                  value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                  <select 
                      className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                      value={lessonForm.type}
                      onChange={e => setLessonForm({...lessonForm, type: e.target.value as any})}
                  >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="link">External Link</option>
                  </select>
                  <select 
                      className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                      value={lessonForm.format}
                      onChange={e => setLessonForm({...lessonForm, format: e.target.value as any})}
                  >
                      <option value="pdf">PDF</option>
                      <option value="docx">Word</option>
                      <option value="xlsx">Excel</option>
                      <option value="mp4">MP4</option>
                      <option value="url">URL</option>
                  </select>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 cursor-pointer hover:border-primary-400 hover:text-primary-500 transition-colors">
                   <p className="text-sm">Drag & drop file here or click to browse</p>
                   <p className="text-xs mt-1 opacity-60">(Simulated Upload)</p>
              </div>
              <ClayButton className="w-full" onClick={handleAddLesson}>Upload</ClayButton>
          </div>
      </ClayModal>

      {/* Add Assignment Modal */}
      <ClayModal isOpen={showAddHW} onClose={() => setShowAddHW(false)} title="New Assignment">
           <div className="space-y-4">
              <input 
                  className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" 
                  placeholder="Assignment Title" 
                  value={hwForm.title} onChange={e => setHwForm({...hwForm, title: e.target.value})} 
              />
              <textarea 
                  className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none h-24 resize-none" 
                  placeholder="Instructions..." 
                  value={hwForm.description} onChange={e => setHwForm({...hwForm, description: e.target.value})} 
              />
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                  <input 
                      type="date"
                      className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none" 
                      value={hwForm.dueDate} onChange={e => setHwForm({...hwForm, dueDate: e.target.value})} 
                  />
              </div>
              <ClayButton className="w-full" onClick={handleAddHW}>Create Assignment</ClayButton>
           </div>
      </ClayModal>

      {/* Assign Exam Modal */}
      <ClayModal isOpen={showAssignExam} onClose={() => setShowAssignExam(false)} title="Assign Exam">
          <div className="space-y-4">
              <p className="text-sm text-gray-500">Select an existing exam to assign to this class. This will make the exam visible to all enrolled students.</p>
              <select 
                  className="w-full p-3 rounded-xl bg-gray-50 shadow-clay-inset outline-none"
                  value={selectedExamToAssign}
                  onChange={(e) => setSelectedExamToAssign(e.target.value)}
              >
                  <option value="">-- Select Exam --</option>
                  {availableExams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
              <ClayButton className="w-full" onClick={handleAssignExam} disabled={!selectedExamToAssign}>Assign</ClayButton>
          </div>
      </ClayModal>

    </Layout>
  );
};

export default ClassDetail;
