import type { Class, Subject, Mentor, Timetable } from './types';

// Bump this string whenever seed data changes — triggers auto-reset in browsers
// with stale localStorage from a previous version.
export const SEED_VERSION = 'v12-strict-cs-ds-separation';

export const SEED_CLASSES: Class[] = [
  // Year 3 first
  { id: 'cls_aiml3',    name: 'III B.Sc. AI-ML',              shortName: 'AIML-III',   year: 3, semester: 5, group: null,      departmentId: 'ACS',  studentCount: null },
  // Year 2 (confirmed batches)
  { id: 'cls_aiml2',    name: 'II B.Sc. AI-ML',               shortName: 'AIML-II',    year: 2, semester: 3, group: null,      departmentId: 'ACS',  studentCount: null },
  { id: 'cls_aids2',    name: 'II B.Sc. AI-DS',               shortName: 'AIDS-II',    year: 2, semester: 3, group: null,      departmentId: 'ACS',  studentCount: null },
  { id: 'cls_bcom2',    name: 'II B.Com. FAI',                shortName: 'BCOM-II',    year: 2, semester: 3, group: null,      departmentId: 'PCOM', studentCount: 33   },
  { id: 'cls_bba2',     name: 'II B.B.A. E-Commerce & DM',   shortName: 'BBA-II',     year: 2, semester: 3, group: null,      departmentId: 'PBF',  studentCount: 12   },
  // Year 1 (upcoming batches) — B.Com first, then B.Sc. AI-DS, B.Tech last
  { id: 'cls_bcom1g1',  name: 'I B.Com. FAI (Group 1)',       shortName: 'BCOM-I G1',  year: 1, semester: 1, group: 'Group 1', departmentId: 'PCOM', studentCount: null },
  { id: 'cls_bcom1g2',  name: 'I B.Com. FAI (Group 2)',       shortName: 'BCOM-I G2',  year: 1, semester: 1, group: 'Group 2', departmentId: 'PCOM', studentCount: null },
  { id: 'cls_aids1g1',  name: 'I B.Sc. AI-DS (Group 1)',      shortName: 'AIDS-I G1',  year: 1, semester: 1, group: 'Group 1', departmentId: 'ACS',  studentCount: null },
  { id: 'cls_aids1g2',  name: 'I B.Sc. AI-DS (Group 2)',      shortName: 'AIDS-I G2',  year: 1, semester: 1, group: 'Group 2', departmentId: 'ACS',  studentCount: null },
  { id: 'cls_btech1g1', name: 'I B.Tech. AI-DS (Group 1)',    shortName: 'BTech-I G1', year: 1, semester: 1, group: 'Group 1', departmentId: 'ACS',  studentCount: null },
  { id: 'cls_btech1g2', name: 'I B.Tech. AI-DS (Group 2)',    shortName: 'BTech-I G2', year: 1, semester: 1, group: 'Group 2', departmentId: 'ACS',  studentCount: null },
];

export const SEED_SUBJECTS: Subject[] = [
  // ── III B.Sc. AI-ML  (total 35) ──────────────────────────────────────────────
  { id: 's_aiml3_genai', classId: 'cls_aiml3', name: 'Generative AI',                                      category: 'DS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_nlp',   classId: 'cls_aiml3', name: 'Natural Language Processing',                        category: 'DS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_dl',    classId: 'cls_aiml3', name: 'Deep Learning',                                      category: 'DS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_dwm',   classId: 'cls_aiml3', name: 'Data Warehousing and Mining',                        category: 'DS',         hoursPerWeek: 6,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_pts',   classId: 'cls_aiml3', name: 'Placement Training Skill Development',               category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_cap',   classId: 'cls_aiml3', name: 'Capstone Projects',                                  category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_rl',    classId: 'cls_aiml3', name: 'Reinforcement Learning',                             category: 'DS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_rta',   classId: 'cls_aiml3', name: 'Fundamentals of Recruitment and Talent Acquisition', category: 'MANAGEMENT', hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_apt',   classId: 'cls_aiml3', name: 'Aptitude Training',                                  category: 'MATH',       hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_icp',   classId: 'cls_aiml3', name: 'Industry Connect Program',                           category: 'DS',         hoursPerWeek: 0,  isLab: false, labForSubjectId: null },
  { id: 's_aiml3_pet',   classId: 'cls_aiml3', name: 'PET',          category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aiml3_lib',   classId: 'cls_aiml3', name: 'Library',      category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aiml3_mhr',   classId: 'cls_aiml3', name: 'Mentor Hour',  category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── II B.Sc. AI-ML  (total 35) ───────────────────────────────────────────────
  { id: 's_aiml2_es',    classId: 'cls_aiml2', name: 'Environmental Studies',                              category: 'ENGLISH',    hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_os',    classId: 'cls_aiml2', name: 'Operating Systems',                                  category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_dsa',   classId: 'cls_aiml2', name: 'Data Structures and Algorithms and Lab',             category: 'CS',         hoursPerWeek: 8,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_pom',   classId: 'cls_aiml2', name: 'Principles of Management',                           category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_comm',  classId: 'cls_aiml2', name: 'Effective Communication Skill Development',          category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_dbms',  classId: 'cls_aiml2', name: 'Database Management Systems',                        category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_ba',    classId: 'cls_aiml2', name: 'Business Analytics',                                 category: 'DS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_apt',   classId: 'cls_aiml2', name: 'Aptitude Training',                                  category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aiml2_pet',   classId: 'cls_aiml2', name: 'PET',          category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aiml2_lib',   classId: 'cls_aiml2', name: 'Library',      category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aiml2_mhr',   classId: 'cls_aiml2', name: 'Mentor Hour',  category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── II B.Sc. AI-DS  (total 35) ───────────────────────────────────────────────
  { id: 's_aids2_es',    classId: 'cls_aids2', name: 'Environmental Studies',                              category: 'ENGLISH',    hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_os',    classId: 'cls_aids2', name: 'Operating Systems',                                  category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_dsa',   classId: 'cls_aids2', name: 'Data Structures and Algorithms and Lab',             category: 'CS',         hoursPerWeek: 8,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_pom',   classId: 'cls_aids2', name: 'Principles of Management',                           category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_comm',  classId: 'cls_aids2', name: 'Effective Communication Skill Development',          category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_dbms',  classId: 'cls_aids2', name: 'Database Management Systems',                        category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_ba',    classId: 'cls_aids2', name: 'Business Analytics',                                 category: 'DS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_apt',   classId: 'cls_aids2', name: 'Aptitude Training',                                  category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aids2_pet',   classId: 'cls_aids2', name: 'PET',          category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids2_lib',   classId: 'cls_aids2', name: 'Library',      category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids2_mhr',   classId: 'cls_aids2', name: 'Mentor Hour',  category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── I B.Sc. AI-DS Group 1  (total 35) ────────────────────────────────────────
  { id: 's_aids1g1_math', classId: 'cls_aids1g1', name: 'Mathematics for AI',                              category: 'MATH',       hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_py',   classId: 'cls_aids1g1', name: 'Python Programming and Lab',                      category: 'CS',         hoursPerWeek: 10, isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_ca',   classId: 'cls_aids1g1', name: 'Fundamentals and Computer Architecture',          category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_comm', classId: 'cls_aids1g1', name: 'Effective Communication for Professionals',       category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_ux',   classId: 'cls_aids1g1', name: 'Design for Developers (UI and UX)',               category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_apt',  classId: 'cls_aids1g1', name: 'Problem Solving through Aptitude – I',            category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_pet',  classId: 'cls_aids1g1', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_lib',  classId: 'cls_aids1g1', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids1g1_mhr',  classId: 'cls_aids1g1', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── I B.Sc. AI-DS Group 2  (total 30) ────────────────────────────────────────
  { id: 's_aids1g2_math', classId: 'cls_aids1g2', name: 'Mathematics for AI',                              category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_py',   classId: 'cls_aids1g2', name: 'Python Programming and Lab',                      category: 'CS',         hoursPerWeek: 8,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_ca',   classId: 'cls_aids1g2', name: 'Fundamentals and Computer Architecture',          category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_comm', classId: 'cls_aids1g2', name: 'Effective Communication for Professionals',       category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_ux',   classId: 'cls_aids1g2', name: 'Design for Developers (UI and UX)',               category: 'CS',         hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_apt',  classId: 'cls_aids1g2', name: 'Problem Solving through Aptitude – I',            category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_pet',  classId: 'cls_aids1g2', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_lib',  classId: 'cls_aids1g2', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_aids1g2_mhr',  classId: 'cls_aids1g2', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 2, isLab: false, labForSubjectId: null },

  // ── I B.Tech. AI-DS Group 1  (total 35) ──────────────────────────────────────
  { id: 's_bt1g1_eng',   classId: 'cls_btech1g1', name: 'Workplace English for Engineers',                 category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_stats', classId: 'cls_btech1g1', name: 'Statistics for Data Science',                     category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_rai',   classId: 'cls_btech1g1', name: 'Responsible AI and Ethical Systems',              category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_java',  classId: 'cls_btech1g1', name: 'Logic Building using Java',                       category: 'CS',         hoursPerWeek: 10, isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_dt',    classId: 'cls_btech1g1', name: 'AI-Centric Design Thinking',                      category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_lc',    classId: 'cls_btech1g1', name: 'Low Code and No Code App Development',            category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_soft',  classId: 'cls_btech1g1', name: 'Softskills',                                      category: 'ENGLISH',    hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_apt',   classId: 'cls_btech1g1', name: 'Aptitude',                                        category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_pet',   classId: 'cls_btech1g1', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_lib',   classId: 'cls_btech1g1', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bt1g1_mhr',   classId: 'cls_btech1g1', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── I B.Tech. AI-DS Group 2  (total 35) ──────────────────────────────────────
  { id: 's_bt1g2_eng',   classId: 'cls_btech1g2', name: 'Workplace English for Engineers',                 category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_stats', classId: 'cls_btech1g2', name: 'Statistics for Data Science',                     category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_rai',   classId: 'cls_btech1g2', name: 'Responsible AI and Ethical Systems',              category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_java',  classId: 'cls_btech1g2', name: 'Logic Building using Java',                       category: 'CS',         hoursPerWeek: 10, isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_dt',    classId: 'cls_btech1g2', name: 'AI-Centric Design Thinking',                      category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_lc',    classId: 'cls_btech1g2', name: 'Low Code and No Code App Development',            category: 'CS',         hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_soft',  classId: 'cls_btech1g2', name: 'Softskills',                                      category: 'ENGLISH',    hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_apt',   classId: 'cls_btech1g2', name: 'Aptitude',                                        category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_pet',   classId: 'cls_btech1g2', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_lib',   classId: 'cls_btech1g2', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bt1g2_mhr',   classId: 'cls_btech1g2', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── II B.Com. FAI  (total 35) ────────────────────────────────────────────────
  { id: 's_bcom2_ent',   classId: 'cls_bcom2', name: 'Entrepreneurship and Startup Fundamentals',          category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_gov',   classId: 'cls_bcom2', name: 'Governance and Ethics of Financial Services',        category: 'COMMERCE',   hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_fm',    classId: 'cls_bcom2', name: 'Financial Management',                               category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_btp',   classId: 'cls_bcom2', name: 'Banking Technology and Digital Payments',            category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_acc',   classId: 'cls_bcom2', name: 'Accounting Standards for BFSI Industry',            category: 'COMMERCE',   hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_cost',  classId: 'cls_bcom2', name: 'Cost Accounting',                                    category: 'COMMERCE',   hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_comm',  classId: 'cls_bcom2', name: 'Effective Communication',                            category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_dm',    classId: 'cls_bcom2', name: 'Digital Marketing and E-Commerce',                   category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_apt',   classId: 'cls_bcom2', name: 'Aptitude Training',                                  category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bcom2_pet',   classId: 'cls_bcom2', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom2_lib',   classId: 'cls_bcom2', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom2_mhr',   classId: 'cls_bcom2', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── I B.Com. FAI Group 1  (total 35) ─────────────────────────────────────────
  { id: 's_bcom1g1_math', classId: 'cls_bcom1g1', name: 'Business Mathematics and Statistics',             category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_ft',   classId: 'cls_bcom1g1', name: 'Introduction to FinTech',                         category: 'COMMERCE',   hoursPerWeek: 10, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_pom',  classId: 'cls_bcom1g1', name: 'Principles of Management',                        category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_fa',   classId: 'cls_bcom1g1', name: 'Principles of Financial Accounting',              category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_eco',  classId: 'cls_bcom1g1', name: 'Business Economics',                              category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_comm', classId: 'cls_bcom1g1', name: 'Effective Communication for Professionals',       category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_apt',  classId: 'cls_bcom1g1', name: 'Problem Solving through Aptitude – I',            category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_pet',  classId: 'cls_bcom1g1', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_lib',  classId: 'cls_bcom1g1', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g1_mhr',  classId: 'cls_bcom1g1', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── I B.Com. FAI Group 2  (total 35) ─────────────────────────────────────────
  { id: 's_bcom1g2_math', classId: 'cls_bcom1g2', name: 'Business Mathematics and Statistics',             category: 'MATH',       hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_ft',   classId: 'cls_bcom1g2', name: 'Introduction to FinTech',                         category: 'COMMERCE',   hoursPerWeek: 10, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_pom',  classId: 'cls_bcom1g2', name: 'Principles of Management',                        category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_fa',   classId: 'cls_bcom1g2', name: 'Principles of Financial Accounting',              category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_eco',  classId: 'cls_bcom1g2', name: 'Business Economics',                              category: 'COMMERCE',   hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_comm', classId: 'cls_bcom1g2', name: 'Effective Communication for Professionals',       category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_apt',  classId: 'cls_bcom1g2', name: 'Problem Solving through Aptitude – I',            category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_pet',  classId: 'cls_bcom1g2', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_lib',  classId: 'cls_bcom1g2', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bcom1g2_mhr',  classId: 'cls_bcom1g2', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },

  // ── II B.B.A. EDM  (total 35) ────────────────────────────────────────────────
  { id: 's_bba2_ps',    classId: 'cls_bba2', name: 'Product Sourcing and Inventory Management',             category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_fa',    classId: 'cls_bba2', name: 'Financial Accounting',                                  category: 'MANAGEMENT', hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_sm',    classId: 'cls_bba2', name: 'Strategic Management',                                  category: 'MANAGEMENT', hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_bs',    classId: 'cls_bba2', name: 'Business Statistics and Data Research',                 category: 'MANAGEMENT', hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_log',   classId: 'cls_bba2', name: 'Logistics and E-Commerce Trends',                       category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_omni',  classId: 'cls_bba2', name: 'Omnichannel Marketing and Customer Journey',            category: 'MANAGEMENT', hoursPerWeek: 4,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_cap',   classId: 'cls_bba2', name: 'Capstone Projects – II',                                category: 'MANAGEMENT', hoursPerWeek: 3,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_comm',  classId: 'cls_bba2', name: 'Effective Communication Skills',                        category: 'ENGLISH',    hoursPerWeek: 5,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_apt',   classId: 'cls_bba2', name: 'Aptitude Training',                                     category: 'MATH',       hoursPerWeek: 2,  isLab: false, labForSubjectId: null },
  { id: 's_bba2_pet',   classId: 'cls_bba2', name: 'PET',         category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bba2_lib',   classId: 'cls_bba2', name: 'Library',     category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
  { id: 's_bba2_mhr',   classId: 'cls_bba2', name: 'Mentor Hour', category: 'NA', hoursPerWeek: 1, isLab: false, labForSubjectId: null },
];

export const SEED_MENTORS: Mentor[] = [
  // CS mentors — 6 (106 hrs demand / 20 = ceil(5.3) = 6; CS-only, no DS cross-assignment)
  { id: 'm_cs1',   code: 'CS1',   name: 'CS Mentor 1',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  { id: 'm_cs2',   code: 'CS2',   name: 'CS Mentor 2',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  { id: 'm_cs3',   code: 'CS3',   name: 'CS Mentor 3',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  { id: 'm_cs4',   code: 'CS4',   name: 'CS Mentor 4',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  { id: 'm_cs5',   code: 'CS5',   name: 'CS Mentor 5',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  { id: 'm_cs6',   code: 'CS6',   name: 'CS Mentor 6',         category: 'CS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'MCA/M.Sc.'   },
  // DS mentors — 2 (27 hrs demand / 20 = ceil(1.35) = 2; DS-only, no CS cross-assignment)
  { id: 'm_ds1',   code: 'DS1',   name: 'DS Mentor 1',         category: 'DS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'M.Tech/Ph.D.' },
  { id: 'm_ds2',   code: 'DS2',   name: 'DS Mentor 2',         category: 'DS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'M.Tech/Ph.D.' },
  { id: 'm_ds3',   code: 'DS3',   name: 'DS Mentor 3',         category: 'DS',         departmentId: 'ACS',  maxHoursPerWeek: 20, qualification: 'M.Tech/Ph.D.' },
  // Management mentor — 1 (covers ~20 hrs; commerce mentors handle remaining ~25 hrs via fallback)
  { id: 'm_mg1',   code: 'MG1',   name: 'Management Mentor 1', category: 'MANAGEMENT', departmentId: 'PBF',  maxHoursPerWeek: 20, qualification: 'MBA'          },
  // English mentors — 4 (~63 hrs/wk demand; ~16 hrs/mentor)
  { id: 'm_eng1',  code: 'ENG1',  name: 'English Mentor 1',    category: 'ENGLISH',    departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.A. Eng.'    },
  { id: 'm_eng2',  code: 'ENG2',  name: 'English Mentor 2',    category: 'ENGLISH',    departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.A. Eng.'    },
  { id: 'm_eng3',  code: 'ENG3',  name: 'English Mentor 3',    category: 'ENGLISH',    departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.A. Eng.'    },
  { id: 'm_eng4',  code: 'ENG4',  name: 'English Mentor 4',    category: 'ENGLISH',    departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.A. Eng.'    },
  // Math mentors — 3 (~50 hrs/wk demand; ~17 hrs/mentor)
  { id: 'm_math1', code: 'MATH1', name: 'Math Mentor 1',       category: 'MATH',       departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.Sc. Math'   },
  { id: 'm_math2', code: 'MATH2', name: 'Math Mentor 2',       category: 'MATH',       departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.Sc. Math'   },
  { id: 'm_math3', code: 'MATH3', name: 'Math Mentor 3',       category: 'MATH',       departmentId: null,   maxHoursPerWeek: 20, qualification: 'M.Sc. Math'   },
  // Commerce mentors — 4 (~55 hrs commerce + ~25 hrs management overflow = ~80 hrs; ~20 hrs/mentor)
  { id: 'm_com1',  code: 'COM1',  name: 'Commerce Mentor 1',   category: 'COMMERCE',   departmentId: 'PCOM', maxHoursPerWeek: 20, qualification: 'M.Com.'       },
  { id: 'm_com2',  code: 'COM2',  name: 'Commerce Mentor 2',   category: 'COMMERCE',   departmentId: 'PCOM', maxHoursPerWeek: 20, qualification: 'M.Com.'       },
  { id: 'm_com3',  code: 'COM3',  name: 'Commerce Mentor 3',   category: 'COMMERCE',   departmentId: 'PCOM', maxHoursPerWeek: 20, qualification: 'M.Com.'       },
  { id: 'm_com4',  code: 'COM4',  name: 'Commerce Mentor 4',   category: 'COMMERCE',   departmentId: 'PCOM', maxHoursPerWeek: 20, qualification: 'M.Com.'       },
];

export const EMPTY_TIMETABLE: Timetable = {
  generated: false,
  generatedAt: null,
  slots: [],
  warnings: [],
};
