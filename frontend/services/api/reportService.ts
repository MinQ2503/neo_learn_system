import { Exam, ExamResult, ExamStatistics } from '../../types';
import { INITIAL_EXAMS, MOCK_EXAM_RESULTS } from '../mockData';
import { delay } from './base';

export const reportService = {
  // Get all exams that are marked as completed
  getCompletedExams: async (): Promise<Exam[]> => {
    await delay(300);
    // In a real app, you might fetch from API. Here we filter mock data.
    return INITIAL_EXAMS.filter(e => e.status === 'completed');
  },

  // Get specific exam details
  getExamById: async (examId: string): Promise<Exam | undefined> => {
    await delay(200);
    return INITIAL_EXAMS.find(e => e.id === examId);
  },

  // Calculate statistics for a specific exam
  getExamStatistics: async (examId: string): Promise<ExamStatistics> => {
    await delay(500);
    const results = MOCK_EXAM_RESULTS; // In real app, filter by examId
    const totalStudents = results.length;
    
    // Calculate Average
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = Math.round(totalScore / totalStudents);

    // Calculate Violation Rate (Students with at least one violation)
    const violators = results.filter(r => r.violations.length > 0).length;
    const violationRate = Math.round((violators / totalStudents) * 100);

    // Score Distribution
    const distribution = [
      { range: '0-40', count: 0 },
      { range: '40-60', count: 0 },
      { range: '60-80', count: 0 },
      { range: '80-100', count: 0 },
    ];

    results.forEach(r => {
      if (r.score < 40) distribution[0].count++;
      else if (r.score < 60) distribution[1].count++;
      else if (r.score < 80) distribution[2].count++;
      else distribution[3].count++;
    });

    // Violation Type Distribution
    const violationCounts: Record<string, number> = {};
    results.forEach(r => {
      r.violations.forEach(v => {
        violationCounts[v.type] = (violationCounts[v.type] || 0) + 1;
      });
    });
    
    const violationDistribution = Object.keys(violationCounts).map(key => ({
      type: key,
      count: violationCounts[key]
    }));

    return {
      examId,
      totalStudents,
      averageScore,
      violationRate,
      scoreDistribution: distribution,
      violationDistribution
    };
  },

  // Get list of students specifically for the report table
  getExamResults: async (examId: string): Promise<ExamResult[]> => {
    await delay(400);
    return MOCK_EXAM_RESULTS;
  }
};
