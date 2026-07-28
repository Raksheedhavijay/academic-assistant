import React, { useState } from 'react';
import { Search as SearchIcon, Users, FileText, GraduationCap, Calendar, BookOpen, CheckSquare, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function SearchModal() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin';

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.get(`/search?q=${encodeURIComponent(q)}`);
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Global Search Portal</h1>
        <p className="text-xs text-slate-400">
          {isStaffOrAdmin
            ? "Faculty Search Mode: Full student access including Attendance Rate, Study Planner, Timetable, & Assignments."
            : "Student Search Mode: Restricted to Student Name, Roll Number, and Department Name."}
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="w-5 h-5 absolute left-4 top-3.5 text-primary" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type to search e.g. 'Artificial Intelligence', 'Radha', 'CS601'..."
          className="w-full glass-input pl-12 text-sm py-3 font-medium"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {['all', 'students', 'staff', 'assignments', 'exams', 'timetable'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider capitalize transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-slate-800/40 text-slate-400 border border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          {(activeTab === 'all' || activeTab === 'students') && results.students?.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-xs uppercase text-primary mb-3 flex items-center space-x-1">
                <Users className="w-4 h-4" /> <span>Students ({results.students.length})</span>
              </h3>
              <div className="space-y-3">
                {results.students.map(s => (
                  <div key={s._id} className="p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</span>
                        <span className="text-slate-400 font-mono ml-2">({s.rollNumber})</span>
                      </div>
                      <span className="text-primary font-semibold">{s.department}</span>
                    </div>

                    {/* Staff View: Full Detailed Student Metrics */}
                    {isStaffOrAdmin && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded bg-slate-900/60">
                          <span className="text-slate-400 block text-[10px]">Attendance Rate</span>
                          <span className={`font-bold ${s.attendanceRate < 75 ? 'text-danger' : 'text-success'}`}>
                            {s.attendanceRate !== undefined ? `${s.attendanceRate}%` : 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60">
                          <span className="text-slate-400 block text-[10px]">Study Planner</span>
                          <span className="font-bold text-accent">
                            {s.studyPlannerCount !== undefined ? `${s.studyPlannerCount} Goals` : 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60">
                          <span className="text-slate-400 block text-[10px]">Timetable Slots</span>
                          <span className="font-bold text-secondary">
                            {s.timetableSlotsCount !== undefined ? `${s.timetableSlotsCount} Slots` : 'N/A'}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-slate-900/60">
                          <span className="text-slate-400 block text-[10px]">Assignments</span>
                          <span className="font-bold text-primary">
                            {s.assignmentsCount !== undefined ? `${s.assignmentsCount} Coursework` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'assignments') && results.assignments?.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-xs uppercase text-accent mb-2 flex items-center space-x-1">
                <FileText className="w-4 h-4" /> <span>Assignments</span>
              </h3>
              {results.assignments.map(a => (
                <div key={a._id} className="p-2 border-b border-slate-800 text-xs flex justify-between">
                  <span>{a.assignmentTitle}</span>
                  <span className="text-slate-400">{a.subjectCode}</span>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'exams') && results.exams?.length > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <h3 className="font-bold text-xs uppercase text-secondary mb-2 flex items-center space-x-1">
                <GraduationCap className="w-4 h-4" /> <span>Exams</span>
              </h3>
              {results.exams.map(e => (
                <div key={e._id} className="p-2 border-b border-slate-800 text-xs flex justify-between">
                  <span>{e.examName} ({e.subject})</span>
                  <span className="text-slate-400">{e.examDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
