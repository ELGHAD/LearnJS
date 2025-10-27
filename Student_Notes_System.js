// ===============================
// 🧑‍🎓 Student Notes System (Arrays)
// ===============================

// Data model: each student has an id, name, and an array of grades (0–20)
const students = [
  { id: 1, name: "Hamza", grades: [14, 16, 12, 18] },
  { id: 2, name: "Sara", grades: [8, 9, 7, 10] },
  { id: 3, name: "Youssef", grades: [15, 13, 17] },
  { id: 4, name: "Lina", grades: [19, 18, 20] },
];

// ---------- Utilities ----------
const isNumber = (x) => typeof x === "number" && Number.isFinite(x);

// average([]) -> null (to distinguish from 0)
const average = (arr) =>
  Array.isArray(arr) && arr.length > 0
    ? arr.reduce((sum, n) => sum + n, 0) / arr.length
    : null;

const clamp20 = (n) => Math.max(0, Math.min(20, n));

// ---------- Core operations ----------
function addStudent(list, { id, name, grades = [] }) {
  if (!id || !name) throw new Error("id and name are required");
  if (list.some((s) => s.id === id)) throw new Error("Duplicate id");
  const safeGrades = grades.map(Number).filter(isNumber).map(clamp20);
  list.push({ id, name, grades: safeGrades });
  return list;
}

function removeStudentById(list, id) {
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  return true;
}

function addGrade(list, id, grade) {
  const s = list.find((s) => s.id === id);
  if (!s) throw new Error("Student not found");
  const g = clamp20(Number(grade));
  if (!isNumber(g)) throw new Error("Invalid grade");
  s.grades.push(g);
  return s;
}

function studentAverage(student) {
  return average(student.grades);
}

function classAverage(list) {
  const avgs = list.map(studentAverage).filter((v) => v !== null);
  return average(avgs);
}

function topStudents(list, n = 3) {
  return [...list]
    .map((s) => ({ ...s, avg: studentAverage(s) ?? 0 }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, n);
}

function failedStudents(list, threshold = 10) {
  // Fails if average strictly below threshold
  return list
    .map((s) => ({ ...s, avg: studentAverage(s) ?? 0 }))
    .filter((s) => s.avg < threshold);
}

function sortByName(list, direction = "asc") {
  const d = direction === "desc" ? -1 : 1;
  return [...list].sort((a, b) => a.name.localeCompare(b.name) * d);
}

function sortByAverage(list, direction = "desc") {
  const d = direction === "asc" ? 1 : -1;
  return [...list]
    .map((s) => ({ ...s, avg: studentAverage(s) ?? 0 }))
    .sort((a, b) => (a.avg - b.avg) * d);
}

function findByName(list, query) {
  const q = String(query || "")
    .toLowerCase()
    .trim();
  return list.filter((s) => s.name.toLowerCase().includes(q));
}

function reportTable(list) {
  // Returns a simple view model for printing
  return list.map((s) => ({
    id: s.id,
    name: s.name,
    grades: `[${s.grades.join(", ")}]`,
    avg: (studentAverage(s) ?? 0).toFixed(2),
  }));
}

// ---------- Demo / Walkthrough ----------
console.log("Initial students:");
console.table(reportTable(students));

// Add a new student
addStudent(students, { id: 5, name: "Amine", grades: [11, 12, 13] });
console.log("\nAfter adding Amine:");
console.table(reportTable(students));

// Add a grade to Youssef
addGrade(students, 3, 19);
console.log("\nAfter adding a grade to Youssef (id=3):");
console.table(reportTable(students));

// Remove a student by id
removeStudentById(students, 2);
console.log("\nAfter removing Sara (id=2):");
console.table(reportTable(students));

// Class average
console.log("\nClass average:", classAverage(students)?.toFixed(2));

// Top 3 students by average
console.log("\nTop 3 students:");
console.table(reportTable(topStudents(students, 3)));

// Failed students (avg < 10)
console.log("\nFailed students (avg < 10):");
console.table(reportTable(failedStudents(students, 10)));

// Sort by name
console.log("\nSorted by name (A→Z):");
console.table(reportTable(sortByName(students, "asc")));

// Sort by average (high → low)
console.log("\nSorted by average (high → low):");
console.table(reportTable(sortByAverage(students, "desc")));

// Search by name
console.log('\nSearch "a":');
console.table(reportTable(findByName(students, "a")));

// ---------- Bonus: quick stats with loops ----------
console.log("\nBonus (loops): count of students with any grade < 10");
let countHasBelow10 = 0;
for (const s of students) {
  // uses some()
  if (s.grades.some((g) => g < 10)) countHasBelow10++;
}
console.log("Students having at least one grade < 10:", countHasBelow10);

// Traditional for loop to compute total number of grades in system
let totalGrades = 0;
for (let i = 0; i < students.length; i++) {
  totalGrades += students[i].grades.length;
}
console.log("Total number of grades recorded:", totalGrades);
