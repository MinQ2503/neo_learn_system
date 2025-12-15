import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import { Role, StudentStatus, Violation, ViolationType, Severity } from '../types';
import { MOCK_STUDENTS, generateMockViolation } from '../services/mockService';
import { AlertTriangle, User, Eye, Battery, Monitor, MoreVertical, X } from 'lucide-react';

// Sub-components for better organization
const StudentTile: React.FC<{ 
    student: StudentStatus, 
    onClick: () => void 
}> = ({ student, onClick }) => {
    const isFlagged = student.status === 'flagged';
    const isIdle = student.status === 'idle';
    
    return (
        <div 
            onClick={onClick}
            className={`
                relative p-4 rounded-3xl transition-all duration-300 cursor-pointer group
                ${isFlagged ? 'bg-red-50 shadow-[inset_0_0_0_2px_#fca5a5] shadow-clay' : 'bg-gray-100 shadow-clay hover:scale-[1.02]'}
            `}
        >
            <div className="relative aspect-[4/3] bg-gray-300 rounded-2xl overflow-hidden mb-3">
                <img 
                    src={`https://picsum.photos/300/225?random=${student.id}`} 
                    alt="Student Camera" 
                    className={`w-full h-full object-cover transition-opacity ${student.status === 'offline' ? 'opacity-50 grayscale' : ''}`} 
                />
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2 flex gap-1">
                     {isFlagged && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse flex items-center gap-1">
                            <AlertTriangle size={10} /> {student.currentViolation?.type || "FLAGGED"}
                        </span>
                     )}
                     {!isFlagged && student.status === 'active' && (
                        <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">LIVE</span>
                     )}
                </div>

                {/* Risk Score */}
                <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${student.riskScore > 50 ? 'bg-red-500/80 text-white' : 'bg-black/50 text-white'}`}>
                    Risk: {student.riskScore}%
                </div>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-800 text-sm">{student.name}</h4>
                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>
    );
};

const StudentDetailPanel: React.FC<{ student: StudentStatus, onClose: () => void }> = ({ student, onClose }) => {
    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto border-l border-gray-200">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Student Detail</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-clay overflow-hidden mb-4">
                        <img src={`https://picsum.photos/200/200?random=${student.id}`} alt="Profile" />
                    </div>
                    <h3 className="text-xl font-bold">{student.name}</h3>
                    <p className="text-gray-500 text-sm">ID: {student.id}</p>
                    <div className="flex gap-2 mt-3">
                         <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">Risk Score: {student.riskScore}</span>
                         <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">{student.status.toUpperCase()}</span>
                    </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} /> Recent Flags
                </h4>
                
                <div className="space-y-4">
                    {/* Simulated Timeline */}
                    <TimelineItem 
                        type={ViolationType.MOBILE_DETECTED} 
                        time="10:42 AM" 
                        severity={Severity.HIGH} 
                        image={`https://picsum.photos/200/120?random=1`}
                    />
                     <TimelineItem 
                        type={ViolationType.GAZE_AWAY} 
                        time="10:35 AM" 
                        severity={Severity.LOW} 
                    />
                    <TimelineItem 
                        type={ViolationType.MULTI_FACE} 
                        time="10:15 AM" 
                        severity={Severity.HIGH} 
                        image={`https://picsum.photos/200/120?random=2`}
                    />
                </div>

                <div className="mt-8">
                     <h4 className="font-bold text-gray-700 mb-2">Proctor Notes</h4>
                     <textarea className="w-full h-24 p-3 rounded-xl bg-white border border-gray-200 shadow-inner text-sm" placeholder="Add observation notes..." />
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100">Terminate Exam</button>
                    <button className="py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50">Pause Exam</button>
                </div>
            </div>
        </div>
    );
};

const TimelineItem = ({ type, time, severity, image }: { type: string, time: string, severity: Severity, image?: string }) => (
    <div className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-0 last:pb-0">
        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${severity === Severity.HIGH ? 'bg-red-500' : 'bg-orange-400'}`}></div>
        <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-gray-800 text-sm">{type}</span>
            <span className="text-xs text-gray-400">{time}</span>
        </div>
        {image && (
            <div className="mb-2 rounded-lg overflow-hidden border border-gray-200">
                <img src={image} alt="Evidence" className="w-full h-auto object-cover" />
            </div>
        )}
        <div className="flex gap-2">
             <button className="text-[10px] text-blue-500 hover:underline">View Clip</button>
             <button className="text-[10px] text-gray-400 hover:text-gray-600">Mark False Positive</button>
        </div>
    </div>
);

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentStatus[]>(MOCK_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null);

  // Simulate Realtime WebSocket Updates
  useEffect(() => {
    const interval = setInterval(() => {
        setStudents(currentStudents => {
            return currentStudents.map(student => {
                // Randomly trigger an event for a student
                if (Math.random() > 0.95 && student.status !== 'offline') {
                     const violation = generateMockViolation(student.id);
                     return {
                         ...student,
                         status: 'flagged',
                         riskScore: Math.min(100, student.riskScore + 15),
                         currentViolation: violation
                     };
                }
                // Randomly resolve
                if (student.status === 'flagged' && Math.random() > 0.8) {
                    return { ...student, status: 'active', currentViolation: undefined };
                }
                return student;
            });
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout role={Role.TEACHER} title="Exam Monitor">
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 mb-6">
            <ClayCard className="px-4 py-2 flex items-center gap-2 !rounded-xl">
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <span className="text-sm font-bold">Active: {students.filter(s => s.status === 'active').length}</span>
            </ClayCard>
            <ClayCard className="px-4 py-2 flex items-center gap-2 !rounded-xl">
                 <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                 <span className="text-sm font-bold">Flagged: {students.filter(s => s.status === 'flagged').length}</span>
            </ClayCard>
             <ClayCard className="px-4 py-2 flex items-center gap-2 !rounded-xl ml-auto cursor-pointer hover:bg-gray-200">
                 <span className="text-sm">Filter: </span>
                 <span className="font-bold text-sm">High Risk First</span>
            </ClayCard>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {students
             .sort((a, b) => b.riskScore - a.riskScore) // Sort by risk
             .map(student => (
                <StudentTile 
                    key={student.id} 
                    student={student} 
                    onClick={() => setSelectedStudent(student)} 
                />
            ))}
        </div>

        {/* Detail Panel */}
        {selectedStudent && (
            <StudentDetailPanel student={selectedStudent} onClose={() => setSelectedStudent(null)} />
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
