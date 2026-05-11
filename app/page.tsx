import Link from 'next/link';
import { getClasses, getSubjects, getMentors, getTimetable } from '@/lib/store';

export default async function DashboardPage() {
  const [classes, subjects, mentors, timetable] = await Promise.all([
    getClasses(),
    getSubjects(),
    getMentors(),
    getTimetable(),
  ]);

  const deptCounts: Record<string, number> = {};
  for (const c of classes) {
    deptCounts[c.departmentId] = (deptCounts[c.departmentId] ?? 0) + 1;
  }

  const DEPT_LABELS: Record<string, string> = {
    ACS:  'Advanced Computing Science',
    PCOM: 'BCom Fintech with AI',
    PBF:  'Management (PBF)',
  };

  const cards = [
    { href: '/setup',     icon: '⚙️', label: 'Setup',           desc: 'Configure hours per subject, add/edit mentors',      color: 'border-blue-400'   },
    { href: '/timetable', icon: '📅', label: 'Timetable',       desc: 'Generate & view class-wise timetable grid',           color: 'border-green-400'  },
    { href: '/mentors',   icon: '👥', label: 'Mentors',          desc: 'Individual mentor schedule and full summary',         color: 'border-purple-400' },
    { href: '/absence',   icon: '🔄', label: 'Absence Manager', desc: 'Mark absences, assign substitutes, view log',         color: 'border-orange-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Status bar */}
      <div className={`rounded-xl p-5 border-2 ${timetable.generated ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl">{timetable.generated ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-semibold text-lg">
              {timetable.generated
                ? `Timetable generated on ${new Date(timetable.generatedAt!).toLocaleString('en-IN')}`
                : 'Timetable not yet generated'}
            </p>
            <p className="text-sm text-gray-500">
              {timetable.generated
                ? `${timetable.slots.length} slots assigned · ${timetable.warnings.length} warning(s)`
                : 'Go to Setup to configure hours, then generate the timetable'}
            </p>
          </div>
          {!timetable.generated && (
            <Link href="/timetable" className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Generate Now →
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Classes',         value: classes.length        },
          { label: 'Subjects',        value: subjects.length       },
          { label: 'Mentors',         value: mentors.length        },
          { label: 'Slots Generated', value: timetable.slots.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
            <p className="text-3xl font-bold text-blue-700">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Classes by dept */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">Classes by Department</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(deptCounts).map(([dept, count]) => (
            <div key={dept} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="font-medium">{dept}</p>
              <p className="text-xs text-gray-500">{DEPT_LABELS[dept]}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {count} <span className="text-sm font-normal text-gray-500">classes</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.href} href={c.href}
            className={`bg-white rounded-xl border-2 ${c.color} p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-3xl mb-2">{c.icon}</div>
            <p className="font-semibold text-gray-800">{c.label}</p>
            <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Warnings */}
      {timetable.generated && timetable.warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-semibold text-red-700 mb-2">⚠️ Generation Warnings ({timetable.warnings.length})</h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {timetable.warnings.map((w, i) => (
              <li key={i} className="text-sm text-red-600">• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
