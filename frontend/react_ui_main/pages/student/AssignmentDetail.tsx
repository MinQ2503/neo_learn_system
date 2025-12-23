
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ClayCard from '../../components/ClayCard';
import ClayButton from '../../components/ClayButton';
import { Role, Assignment } from '../../types';
import { assignmentService } from '../../services/api/assignmentService';
import { ArrowLeft, Clock, Upload, FileText, CheckCircle, AlertCircle, Save, Send } from 'lucide-react';

const AssignmentDetail: React.FC = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [hw, setHw] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assignmentId) loadData();
  }, [assignmentId]);

  const loadData = async () => {
    setLoading(true);
    const allHw = await assignmentService.getAllGlobal();
    const found = allHw.find(a => a.id === assignmentId);
    if (found) setHw(found);
    setLoading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return alert('Vui lòng nhập nội dung bài làm hoặc đính kèm tệp.');
    
    setLoading(true);
    // Giả lập nộp bài
    setTimeout(() => {
        setSubmitted(true);
        setLoading(false);
    }, 1500);
  };

  if (loading && !hw) return <Layout role={Role.STUDENT} title="Bài tập"><div className="p-20 text-center animate-pulse">Đang tải...</div></Layout>;
  if (!hw) return <Layout role={Role.STUDENT} title="Lỗi"><div className="p-20 text-center">Không tìm thấy thông tin bài tập.</div></Layout>;

  return (
    <Layout role={Role.STUDENT} title="Chi tiết Bài tập">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-8 font-bold text-sm group transition-all">
        <ArrowLeft size={18} className="group-hover:translate-x-[-4px] transition-transform" /> Quay lại khóa học
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <ClayCard className="p-8">
             <div className="flex items-center gap-2 mb-4">
                <FileText className="text-orange-500" size={20} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yêu cầu từ giáo viên</span>
             </div>
             <h2 className="text-2xl font-black text-gray-800 mb-6 leading-tight">{hw.title}</h2>
             
             <div className="p-6 rounded-3xl bg-gray-50 shadow-clay-inset text-gray-700 leading-relaxed mb-8 border border-white min-h-[200px] whitespace-pre-wrap">
                {hw.description}
             </div>

             <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                <div className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-xs font-black uppercase">
                   <Clock size={16} /> Hạn chót: {hw.dueDate}
                </div>
                <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-2xl flex items-center gap-2 text-xs font-black uppercase">
                   <User size={16} /> GV: {hw.teacherName}
                </div>
             </div>
          </ClayCard>
        </div>

        <div className="lg:col-span-2">
           {!submitted ? (
             <ClayCard className="p-8 border-2 border-primary-100 animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                   <Upload size={20} className="text-primary-500" /> Nộp bài làm
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nội dung văn bản / Ghi chú</label>
                       <textarea 
                          className="w-full h-48 p-4 rounded-3xl bg-gray-50 border-none shadow-clay-inset focus:ring-2 focus:ring-primary-200 outline-none text-sm transition-all"
                          placeholder="Nhập bài trả lời của bạn hoặc ghi chú đi kèm file đính kèm..."
                          value={content}
                          onChange={e => setContent(e.target.value)}
                       />
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Tệp đính kèm (PDF, DOCX...)</label>
                       <div 
                          onClick={handleUploadClick}
                          className="w-full py-8 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 hover:border-primary-400 transition-all text-gray-400 hover:text-primary-500"
                       >
                          <Upload size={32} />
                          <span className="text-xs font-black uppercase">Chọn tệp từ máy tính</span>
                          <span className="text-[10px] opacity-60">Tối đa 25MB</span>
                       </div>
                       <input type="file" ref={fileInputRef} className="hidden" />
                    </div>

                    <ClayButton type="submit" className="w-full py-4 text-sm uppercase tracking-widest font-black" disabled={loading}>
                        {loading ? 'Đang gửi bài...' : <><Send size={20} /> Xác nhận nộp bài</>}
                    </ClayButton>
                </form>
             </ClayCard>
           ) : (
             <ClayCard className="p-10 text-center border-2 border-green-200 bg-green-50/30 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-clay-sm border-4 border-white">
                   <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Đã nộp bài!</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">Bài làm của bạn đã được ghi nhận vào hệ thống lúc {new Date().toLocaleTimeString()}. Giáo viên sẽ chấm điểm sớm nhất có thể.</p>
                
                <div className="space-y-3">
                   <button onClick={() => setSubmitted(false)} className="w-full py-3 bg-white text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary-500 transition-colors">
                      Chỉnh sửa bài nộp
                   </button>
                   <button onClick={() => navigate(-1)} className="w-full py-4 bg-primary-500 text-white rounded-2xl shadow-clay font-black text-[10px] uppercase tracking-widest">
                      Quay lại Khóa học
                   </button>
                </div>
             </ClayCard>
           )}
        </div>
      </div>
    </Layout>
  );
};

const User = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export default AssignmentDetail;
