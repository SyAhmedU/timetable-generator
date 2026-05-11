'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Class, Subject, Mentor, MentorCategory } from '@/lib/types';

// ── Server Actions (inline for simplicity) ───────────────────────────────────
async function fetchAll() {
  const [cRes, sRes, mRes] = await Promise.all([
    fetch('/api/data/classes'),
    fetch('/api/data/subjects'),
    fetch('/api/data/mentors'),
  ]);
  return {
    classes:  (await cRes.json()) as Class[],
    subjects: (await sRes.json()) as Subject[],
    mentors:  (await mRes.json()) as Mentor[],
  };
}

const CATEGORIES: MentorCategory[] = ['CS', 'MTECH', 'MANAGEMENT', 'ENGLISH', 'MATH', 'COMMERCE', 'APTITUDE'];
const CAT_LABELS: Record<MentorCategory, string> = {
  CS: 'CS (B.Sc.)', MTECH: 'M.Tech (B.Tech)', MANAGEMENT: 'Management',
  ENGLISH: 'English', MATH: 'Mathematics', COMMERCE: 'Commerce', APTITUDE: 'Aptitude',
};

export default function SetupPage() {
  const [classes, setClasses]   = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mentors, setMentors]   = useState<Mentor[]>([]);
  const [activeClass, setActiveClass] = useState<string>('');
  const [tab, setTab]           = useState<'subjects' | 'mentors'>('subjects');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [, startTransition]     = useTransition();

  // Mentor modal state
  const [mentorModal, setMentorModal] = useState<Partial<Mentor> | null>(null);
  const [isNewMentor, setIsNewMentor] = useState(false);

  useEffect(() => {
    fetchAll().then(({ classes, subjects, mentors }) => {
      setClasses(classes);
      setSubjects(subjects);
      setMentors(mentors);
      if (classes.length) setActiveClass(classes[0].id);
    });
  }, []);

  const classSubjects = subjects.filter(s => s.classId === activeClass);
  const totalHours = classSubjects.reduce((a, s) => a + s.hoursPerWeek, 0);

  const handleHoursChange = (subjectId: string, val: number) => {
    setSubjects(prev =>
      prev.map(s => s.id === subjectId ? { ...s, hoursPerWeek: Math.max(1, Math.min(7, val)) } : s)
    );
    setSaved(false);
  };

  const saveSubjects = async () => {
    setSaving(true);
    await fetch('/api/data/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjects),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveMentor = async () => {
    if (!mentorModal) return;
    const m = mentorModal as Mentor;
    if (isNewMentor) {
      const newM: Mentor = { ...m, id: `m_${Date.now()}` };
      await fetch('/api/data/mentors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newM) });
      setMentors(prev => [...prev, newM]);
    } else {
      await fetch('/api/data/mentors', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
      setMentors(prev => prev.map(x => x.id === m.id ? m : x));
    }
    setMentorModal(null);
  };

  const deleteMentor = async (id: string) => {
    if (!confirm('Delete this mentor?')) return;
    await fetch(`/api/data/mentors?id=${id}`, { method: 'DELETE' });
    setMentors(prev => prev.filter(m => m.id !== id));
  };

  const CAT_COLORS: Record<MentorCategory, string> = {
    CS: 'bg-blue-100 text-blue-700', MTECH: 'bg-indigo-100 text-indigo-700',
    MANAGEMENT: 'bg-green-100 text-green-700', ENGLISH: 'bg-yellow-100 text-yellow-800',
    MATH: 'bg-purple-100 text-purple-700', COMMERCE: 'bg-orange-100 text-orange-700',
    APTITUDE: 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Setup</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('subjects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'subjects' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Subjects & Hours
          </button>
          <button
            onClick={() => setTab('mentors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'mentors' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            Mentors ({mentors.length})
          </button>
        </div>
      </div>

      {/* ── SUBJECTS TAB ─────────────────────────────────────────────── */}
      {tab === 'subjects' && (
        <div className="flex gap-4">
          {/* Class list */}
          <div className="w-56 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">Classes</div>
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveClass(c.id)}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 transition ${
                  activeClass === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div>{c.shortName}</div>
                <div className="text-xs text-gray-400">{c.departmentId} · Sem {c.semester}</div>
              </button>
            ))}
          </div>

          {/* Subjects panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold">{classes.find(c => c.id === activeClass)?.name}</p>
                <p className={`text-xs mt-0.5 ${totalHours > 35 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  Total hours/week: {totalHours}/35 {totalHours > 35 ? '⚠️ exceeds limit' : '✓'}
                </p>
              </div>
              <button
                onClick={saveSubjects}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lab?</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Hours / Week</th>
                </tr>
              </thead>
              <tbody>
                {classSubjects.map((sub, i) => (
                  <tr key={sub.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-3 font-medium text-gray-800">{sub.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CAT_COLORS[sub.category]}`}>
                        {sub.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{sub.isLab ? 'Lab' : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={1}
                        max={7}
                        value={sub.hoursPerWeek}
                        onChange={e => handleHoursChange(sub.id, parseInt(e.target.value) || 1)}
                        className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MENTORS TAB ──────────────────────────────────────────────── */}
      {tab === 'mentors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setIsNewMentor(true); setMentorModal({ category: 'CS', maxHoursPerWeek: 20, departmentId: null, qualification: null }); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              + Add Mentor
            </button>
          </div>

          {CATEGORIES.map(cat => {
            const catMentors = mentors.filter(m => m.category === cat);
            if (catMentors.length === 0) return null;
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
                      <th className="text-left px-4 py-2 font-medium text-gray-500">Dept.</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-500">Max Hrs/Wk</th>
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
                          <button onClick={() => { setIsNewMentor(false); setMentorModal({ ...m }); }} className="text-blue-600 hover:underline text-xs">Edit</button>
                          <button onClick={() => deleteMentor(m.id)} className="text-red-500 hover:underline text-xs">Delete</button>
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

      {/* ── Mentor Modal ─────────────────────────────────────────────── */}
      {mentorModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold">{isNewMentor ? 'Add Mentor' : 'Edit Mentor'}</h2>
            {[
              { label: 'Code', key: 'code', type: 'text', placeholder: 'e.g. CS6' },
              { label: 'Name', key: 'name', type: 'text', placeholder: 'Display name' },
              { label: 'Qualification', key: 'qualification', type: 'text', placeholder: 'e.g. M.Tech, MBA' },
              { label: 'Max Hours / Week', key: 'maxHoursPerWeek', type: 'number', placeholder: '20' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(mentorModal as Record<string, unknown>)[f.key] as string ?? ''}
                  onChange={e => setMentorModal(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 1 : e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={mentorModal.category ?? 'CS'}
                onChange={e => setMentorModal(p => ({ ...p, category: e.target.value as MentorCategory }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={mentorModal.departmentId ?? ''}
                onChange={e => setMentorModal(p => ({ ...p, departmentId: (e.target.value || null) as 'ACS' | 'PCOM' | 'PBF' | null }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Cross-department</option>
                <option value="ACS">ACS</option>
                <option value="PCOM">PCOM</option>
                <option value="PBF">PBF</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveMentor} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                {isNewMentor ? 'Add' : 'Save'}
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
