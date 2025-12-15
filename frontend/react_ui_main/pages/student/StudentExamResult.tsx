import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import { Role, Exam, ExamResult } from '../../types';
import { reportService } from '../../services/api/reportService';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, FileText, Lock } from 'lucide-react';

const StudentExamResult: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded current student for demo
  const CURRENT_STUDENT_ID = "s1"; 

  useEffect(() => {
    if (examId) loadData();
  }, [examId]);

  const loadData = async () => {
    setLoading(true);
    // Fetch Exam Info
    const e = await reportService.getExamById(examId!);
    // Fetch Results (filtering mock data for current student)
    const allResults = await reportService.getExamResults(examId!);
    const myResult = allResults.find(r => r.studentId === CURRENT_STUDENT_ID);
    
    setExam(e || null);
    setResult(myResult || null);
    setLoading(false);
  };

  if (loading) return <div className="p-8">Loading result...</div>;
  
  if (!exam || !result) return (
      <Layout role={Role.STUDENT} title="Exam Result">
          <div className="p-8 text-center text-gray-500">Result not found.</div>
      </Layout>
  );

  if (!exam.showResults) return (
      <Layout role={Role.STUDENT} title="Exam Result">
          <ClayCard className="p-12 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                  <Lock size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Results Hidden</h2>
              <p className="text-gray-500">The teacher has not released the results for this exam yet.</p>
              <button onClick={() => navigate(-1)} className="mt-6 text-primary-600 font-bold hover:underline">Go Back</button>
          </ClayCard>
      </Layout>
  );

  return (
    <Layout role={Role.STUDENT} title="Exam Result">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 font-medium">
        <ArrowLeft size={18} /> Back to Class
      </button>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <ClayCard className="p-8 text-center bg-white">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-2">Your Score</p>
              <div className="text-6xl font-extrabold text-primary-600 mb-2">{result.score}<span className="text-2xl text-gray-300">/100</span></div>
              <span className={`px-4 py-1 rounded-full text-sm font-bold ${result.grade === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  Grade: {result.grade}
              </span>
          </ClayCard>

          {/* Exam Info */}
          <ClayCard className="p-8">
              <h3 className="font-bold text-lg text-gray-800 mb-4">{exam.title}</h3>
              <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span>Status</span>
                      <span className="font-bold text-green-600">Submitted</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span>Subject</span>
                      <span className="font-bold">{exam.subject}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-bold">{new Date(exam.startTime).toLocaleDateString()}</span>
                  </div>
              </div>
          </ClayCard>
          
          {/* Proctor Status */}
          <ClayCard className="p-8">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Proctor Report</h3>
              {result.violations.length === 0 ? (
                  <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl">
                      <CheckCircle size={24} />
                      <span className="font-bold text-sm">Clean Record. Great job!</span>
                  </div>
              ) : (
                  <div className="space-y-2">
                      <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-xl mb-2">
                          <AlertTriangle size={20} />
                          <span className="font-bold text-sm">{result.violations.length} Flags Detected</span>
                      </div>
                      {result.violations.map((v, i) => (
                          <div key={i} className="text-xs text-gray-500 pl-2 border-l-2 border-red-200">
                              {v.type} ({new Date(v.timestamp).toLocaleTimeString()})
                          </div>
                      ))}
                  </div>
              )}
          </ClayCard>
      </div>

      <ClayCard className="p-8">
          <div className="flex items-center gap-2 mb-6">
              <FileText className="text-gray-400" />
              <h3 className="text-lg font-bold text-gray-800">Answer Sheet</h3>
          </div>
          
          {/* Simulated Questions List */}
          <div className="space-y-6">
              {[1, 2, 3, 4].map((qNum) => {
                  // Simulate correct/incorrect roughly based on score
                  const isCorrect = qNum <= 3 && result.score > 50; 
                  return (
                      <div key={qNum} className="border-b border-gray-100 last:border-0 pb-6">
                          <div className="flex gap-3">
                              <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              </div>
                              <div className="flex-1">
                                  <p className="font-bold text-gray-700 mb-2">Question {qNum}</p>
                                  <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600 mb-2">
                                      This is the question text placeholder. In a real scenario, this would be fetched from the question bank.
                                  </div>
                                  <div className="flex gap-4 text-sm">
                                      <div>
                                          <span className="text-gray-400 text-xs uppercase font-bold">Your Answer</span>
                                          <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                              {isCorrect ? 'Option B (Correct)' : 'Option A (Incorrect)'}
                                          </p>
                                      </div>
                                      {!isCorrect && (
                                          <div>
                                              <span className="text-gray-400 text-xs uppercase font-bold">Correct Answer</span>
                                              <p className="font-medium text-green-600">Option B</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </ClayCard>
    </Layout>
  );
};

export default StudentExamResult;
