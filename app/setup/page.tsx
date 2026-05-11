'use client';

import { useState, useEffect } from 'react';
import type { Class, Subject, Mentor, MentorCategory } from '@/lib/types';
import {
  getClasses, getSubjects, getMentors,
  saveSubjects, addMentor, updateMentor, deleteMentor,
} from '@/lib/client-store';

const CATEGORIES: MentorCategory[] = ['CS', 'MTECH', 'MANAGEMENT', 'ENGLISH', 'MATH', 'COMMERCE', 'APTITUDE'];
const CAT_LABELS: Record<MentorCategory, string> = {
  CS: 'CS (B.Sc.)', MTECH: 'M.Tech (B.Tech)', MANAGEMENT: 'Management',
  ENGLISH: 'English', MATH: 'Mathematics', COMMERCE: 'Commerce', APTITUDE: 'Aptitude',
};
const CAT_COLORS: Record<MentorCategory, string> = {
  CS: 'bg-blue-100 text-blue-700', MTECH: 'bg-indigo-100 text-indigo-700',
  MANAGEMENT: 'bg-green-100 text-green-700', ENGLISH: 'bg-yellow-100 text-yellow-800',
  MATH: 'bg-purple-100 text-purple-700', COMMERCE: 'bg-orange-100 text-orange-700',
  APTITUDE: 'bg-pink-100 text-pink-700',
};

export default function SetupPage() {
  const [classes,     setClasses]     = useState<Class[]>([]);
  const [subjects,    setSubjects]    = useState<Subject[]>([]);
  const [mentors,     setMentors]     = useState<Mentor[]>([]);
  const [activeClass, setActiveClass] = useState('');
  const [tab,         setTab]         = useState<'subjects' | 'mentors'>('subjects');
  const [saved,       setSaved]       = useState(false);
  const [mentorModal, setMentorModal] = useState<Partial<Mentor> | null>(null);
  const [isNew,       setIsNew]       = useState(false);

  useEffect(() => {
    const cls = getClasses();
    setClasses(cls);
    setSubjects(getSubjects());
    setMentors(getMentors());
    if (cls.length) setActiveClass(cls[0].id);
  }, []);

  const classSubjects = subjects.filter(s => s.classId === activeClass);
  const totalHours    = classSubjects.reduce((a, s) => a + s.hoursPerWeek, 0);

  const handleHoursChange = (id: string, val: number) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, hoursPerWeek: Math.max(1, Math.min(7, val)) } : s));
    setSaved(false);
  };

  const handleSave = () => {
    saveSubjects(subjects);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveMentor = () => {
    if (!mentorModal?.code || !mentorModal?.name) return;
    const m = mentorModal as Mentor;
    if (isNew) {
      const newM: Mentor = { ...m, id: `m_${Date.now()}` };
      addMentor(newM);
      setMentors(getMentors());
    } else {
      updateMentor(m);
      setMentors(getMentors());
    }
    setMentorModal(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this mentor?')) return;
    deleteMentor(id);
    setMentors(getMentors());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Setup</h1>
        <div className="flex gap-2">
          {(['subjects', 'mentors'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === 'subjects' ? 'Subjects & Hours' : `Mentors (${mentors.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUBJECTS ─────────────────────────────────────────────────── */}
      {tab === 'subjects' && (
        <div className="flex gap-4">
          <div className="w-56 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">Classes</div>
            {classes.map(c => (
              <button key={c.id} onClick={() => setActiveClass(c.id)}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 transition ${activeClass === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                <div>{c.shortName}</div>
                <div className="text-xs text-gray-400">{c.departmentId} · Sem {c.semester}</div>
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold">{classes.find(c => c.id === activeClass)?.name}</p>
                <p className={`text-xs mt-0.5 ${totalHours > 35 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  Total: {totalHours}/35 hrs/wk {totalHours > 35 ? '⚠️ exceeds limit' : '✓'}
                </p>
              </div>
              <button onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lab?</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Hrs/Wk</th>
                </tr>
              </thead>
              <tbody>
                {classSubjects.map((sub, i) => (
                  <tr key={sub.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-3 font-medium text-gray-800">{sub.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[sub.category]}`}>{sub.category}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{sub.isLab ? 'Lab' : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="number" min={1} max={7} value={sub.hoursPerWeek}
                        onChange={e => handleHoursChange(sub.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-2 focus:ring-blue-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MENTORS ──────────────────────────────────────────────────── */}
      {tab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setIsNew(true); setMentorModal({ category: 'CS', maxHoursPerWeek: 20, departmentId: null, qualification: null }); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              + Add Mentor
            </button>
          </div>
          {CATEGORIES.map(cat => {
            const catMentors = mentors.filter(m => m.category === cat);
            if (!catMentors.length) return null;
            return (
              <div key={cat} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLORS[cat]}`}>{cat}</span>
                  <span className="text-sm font-medium text-gray-700">{CAT_LABELS[cat]}</span>
                  <span className="ml-auto text-xs text-gray-400">{catMentors.length} mentor(s)</span>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium text-gray-500">Code</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Qualification</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Dept</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-500">Max Hrs</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {catMentors.map((m, i) => (
                      <tr key={m.id} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="px-5 py-2 font-mono font-semibold text-blue-700">{m.code}</td>
                        <td className="px-4 py-2">{m.name}</td>
                        <td className="px-4 py-2 text-gray-500">{m.qualification ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-500">{m.departmentId ?? 'Cross-dept'}</td>
                        <td className="px-4 py-2 text-center">{m.maxHoursPerWeek}</td>
                        <td className="px-4 py-2 flex gap-2 justify-end">
                          <button onClick={() => { setIsNew(false); setMentorModal({ ...m }); }} className="text-blue-600 hover:underline text-xs">Edit</button>
                          <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      {mentorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">{isNew ? 'Add Mentor' : 'Edit Mentor'}</h2>
            {[
              { label: 'Code',           key: 'code',           type: 'text',   ph: 'e.g. CS6'      },
              { label: 'Name',           key: 'name',           type: 'text',   ph: 'Display name'   },
              { label: 'Qualification',  key: 'qualification',  type: 'text',   ph: 'e.g. M.Tech'   },
              { label: 'Max Hrs / Week', key: 'maxHoursPerWeek', type: 'number', ph: '20'            },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input type={f.type} placeholder={f.ph}
                  value={(mentorModal as Record<string, unknown>)[f.key] as string ?? ''}
                  onChange={e => setMentorModal(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 1 : e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={mentorModal.category ?? 'CS'} onChange={e => setMentorModal(p => ({ ...p, category: e.target.value as MentorCategory }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400">
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select value={mentorModal.departmentId ?? ''} onChange={e => setMentorModal(p => ({ ...p, departmentId: (e.target.value || null) as 'ACS' | 'PCOM' | 'PBF' | null }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400">
                <option value="">Cross-department</option>
                <option value="ACS">ACS</option>
                <option value="PCOM">PCOM</option>
                <option value="PBF">PBF</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveMentor} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                {isNew ? 'Add' : 'Save'}
              </button>
              <button onClick={() => setMentorModal(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
