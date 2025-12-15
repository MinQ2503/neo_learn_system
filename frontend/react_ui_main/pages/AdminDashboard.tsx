import React from 'react';
import Layout from '../components/Layout';
import ClayCard from '../components/ClayCard';
import { Role } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, FileText, Settings, Users } from 'lucide-react';

const MOCK_DATA = [
  { name: '09:00', flags: 4 },
  { name: '09:30', flags: 12 },
  { name: '10:00', flags: 28 },
  { name: '10:30', flags: 15 },
  { name: '11:00', flags: 8 },
];

const VIOLATION_STATS = [
  { name: 'Mobile', count: 45 },
  { name: 'Gaze', count: 120 },
  { name: 'Multi-face', count: 12 },
  { name: 'Audio', count: 34 },
];

const AdminDashboard: React.FC = () => {
  return (
    <Layout role={Role.ADMIN} title="System Overview">
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <ClayCard className="p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">Active Exams</p>
                <h3 className="text-3xl font-bold text-gray-800">4</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <FileText />
            </div>
        </ClayCard>
        <ClayCard className="p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">Active Students</p>
                <h3 className="text-3xl font-bold text-gray-800">1,248</h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <Users />
            </div>
        </ClayCard>
         <ClayCard className="p-6 flex items-center justify-between">
            <div>
                <p className="text-gray-500 text-sm font-medium">Flags Today</p>
                <h3 className="text-3xl font-bold text-gray-800">189</h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                <Settings />
            </div>
        </ClayCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <ClayCard className="p-8">
            <h3 className="text-lg font-bold mb-6">Violation Timeline (Today)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="flags" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </ClayCard>

        <ClayCard className="p-8">
            <h3 className="text-lg font-bold mb-6">Violation Distribution</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={VIOLATION_STATS}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                         <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                         <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                         <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ClayCard>
      </div>

      <ClayCard className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Exam Reports</h3>
            <button className="flex items-center gap-2 text-sm text-primary-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors">
                <Download size={16} /> Export CSV
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm text-gray-400 border-b border-gray-200">
                        <th className="pb-3 pl-2 font-medium">Exam Name</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Participants</th>
                        <th className="pb-3 font-medium">Flags Avg</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right pr-2">Action</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {[1, 2, 3].map((i) => (
                        <tr key={i} className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-4 pl-2 font-bold text-gray-700">Calculus Midterm 2024</td>
                            <td className="py-4 text-gray-500">Oct 12, 2023</td>
                            <td className="py-4 text-gray-500">145</td>
                            <td className="py-4 text-gray-500">2.4</td>
                            <td className="py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">COMPLETED</span></td>
                            <td className="py-4 text-right pr-2">
                                <button className="text-blue-500 font-medium hover:underline">Download PDF</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </ClayCard>
    </Layout>
  );
};

export default AdminDashboard;
