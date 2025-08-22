import React, { useState, useMemo, useCallback } from 'react';
import type { Student, SeparationGroup } from './types';
import Controls from './components/Controls';
import SeatingChart from './components/SeatingChart';

// --- Utility Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const areSeatsAdjacent = (idx1: number, idx2: number, cols: number): boolean => {
    if (idx1 < 0 || idx2 < 0) return false;
    const row1 = Math.floor(idx1 / cols);
    const col1 = idx1 % cols;
    const row2 = Math.floor(idx2 / cols);
    const col2 = idx2 % cols;

    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);

    return (rowDiff === 0 && colDiff === 1) || (colDiff === 0 && rowDiff === 1);
};

const isLayoutValid = (assignments: Map<number, Student>, separationGroups: SeparationGroup[], cols: number): boolean => {
    const studentPositions = new Map<Student, number>();
    for (const [seatIndex, student] of assignments.entries()) {
        studentPositions.set(student, seatIndex);
    }

    for (const group of separationGroups) {
        const validStudentsInGroup = group.students.filter(s => s && studentPositions.has(s));
        if (validStudentsInGroup.length < 2) continue;

        for (let i = 0; i < validStudentsInGroup.length; i++) {
            for (let j = i + 1; j < validStudentsInGroup.length; j++) {
                const student1 = validStudentsInGroup[i];
                const student2 = validStudentsInGroup[j];
                
                const pos1 = studentPositions.get(student1);
                const pos2 = studentPositions.get(student2);

                if (pos1 !== undefined && pos2 !== undefined && areSeatsAdjacent(pos1, pos2, cols)) {
                    return false; 
                }
            }
        }
    }
    return true;
};

// --- Main App Component ---

const App: React.FC = () => {
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(6);
    const [studentsStr, setStudentsStr] = useState("김민준\n이서연\n박도윤\n최지우\n정은우\n강하윤\n조서준\n윤시아\n장예준\n임지아\n한유준\n오서아\n신지호\n송하은\n권주원\n안다은\n황시우\n백채원\n문지훈\n손나은\n양준서\n배아린\n유이준\n노하린\n고현우");
    const [showSeparation, setShowSeparation] = useState(false);
    const [separationGroups, setSeparationGroups] = useState<SeparationGroup[]>([]);
    
    const [fixedStudents, setFixedStudents] = useState<Map<number, Student>>(new Map());
    const [excludedSeats, setExcludedSeats] = useState<Set<number>>(new Set());
    const [isExcluding, setIsExcluding] = useState(false);

    const [assignments, setAssignments] = useState<Map<number, Student>>(new Map());
    const [fixingSeatIndex, setFixingSeatIndex] = useState<number | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const studentList = useMemo(() => studentsStr.split('\n').map(s => s.trim()).filter(Boolean), [studentsStr]);

    const handleGenerate = useCallback(() => {
        setErrorMsg(null);
        setFixingSeatIndex(null);

        const allStudents = [...studentList];
        const availableSeatCount = rows * cols - excludedSeats.size;
        if (allStudents.length > availableSeatCount) {
            setErrorMsg("학생 수가 배치 가능한 좌석 수보다 많습니다.");
            return;
        }

        const studentsToPlace = allStudents.filter(s => ![...fixedStudents.values()].includes(s));
        const MAX_ATTEMPTS = 100;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const currentAssignments = new Map(fixedStudents);
            let availableSeatIndices = [];
            for (let i = 0; i < rows * cols; i++) {
                if (!currentAssignments.has(i) && !excludedSeats.has(i)) {
                    availableSeatIndices.push(i);
                }
            }

            const shuffledStudents = shuffleArray(studentsToPlace);
            const shuffledSeats = shuffleArray(availableSeatIndices);

            shuffledStudents.forEach((student, i) => {
                if (shuffledSeats[i] !== undefined) {
                    currentAssignments.set(shuffledSeats[i], student);
                }
            });

            if (isLayoutValid(currentAssignments, separationGroups, cols)) {
                setAssignments(currentAssignments);
                return;
            }
        }

        setErrorMsg("유효한 자리 배치를 찾지 못했습니다. 조건을 완화하거나 다시 시도해 보세요.");
        setAssignments(new Map(fixedStudents));

    }, [studentList, rows, cols, fixedStudents, separationGroups, excludedSeats]);

    const handleReset = useCallback(() => {
        setErrorMsg(null);
        setAssignments(new Map());
        setFixedStudents(new Map());
        setExcludedSeats(new Set());
        setIsExcluding(false);
        setSeparationGroups([]);
        setShowSeparation(false);
        setFixingSeatIndex(null);
    }, []);

    // --- Separation Group Handlers ---
    const handleAddSeparationGroup = () => {
        setSeparationGroups(prev => [...prev, { id: Date.now(), students: ['', ''] }]);
    };
    const handleRemoveSeparationGroup = (id: number) => {
        setSeparationGroups(prev => prev.filter(g => g.id !== id));
    };
    const handleUpdateSeparationGroupStudent = (id: number, studentIndex: number, student: Student) => {
        setSeparationGroups(prev => prev.map(g => {
            if (g.id === id) {
                const newStudents = [...g.students];
                newStudents[studentIndex] = student;
                return { ...g, students: newStudents };
            }
            return g;
        }));
    };
    const handleAddStudentToGroup = (id: number) => {
        setSeparationGroups(prev => prev.map(g => 
            g.id === id ? { ...g, students: [...g.students, ''] } : g
        ));
    };
    const handleRemoveStudentFromGroup = (id: number, studentIndex: number) => {
        setSeparationGroups(prev => prev.map(g => {
            if (g.id === id) {
                const newStudents = g.students.filter((_, i) => i !== studentIndex);
                // If group becomes empty or has one person, consider removing it or handling it. For now, just remove student.
                return { ...g, students: newStudents };
            }
            return g;
        }));
    };

    // --- Seat Interaction Handlers ---
    const handleSeatClick = (index: number) => {
        if (index === -1) {
            setFixingSeatIndex(null);
            return;
        }

        if (isExcluding) {
            if (fixedStudents.has(index) || assignments.has(index)) return;

            const newExcluded = new Set(excludedSeats);
            if (newExcluded.has(index)) {
                newExcluded.delete(index);
            } else {
                newExcluded.add(index);
            }
            setExcludedSeats(newExcluded);
            setFixingSeatIndex(null);
        } else {
            if (excludedSeats.has(index) || assignments.has(index)) {
                setFixingSeatIndex(null);
                return;
            }

            if (fixingSeatIndex === index) {
                setFixingSeatIndex(null);
            } else {
                setFixingSeatIndex(index);
            }
        }
    };
    
    const handleFixStudent = (index: number, student: Student) => {
        const newFixed = new Map(fixedStudents);
        for(let [key, value] of newFixed.entries()){
            if(value === student){
                newFixed.delete(key);
            }
        }
        newFixed.set(index, student);
        setFixedStudents(newFixed);
        
        const newAssignments = new Map(assignments);
        newAssignments.set(index, student);
        setAssignments(newAssignments);
        setFixingSeatIndex(null);
        
        if (excludedSeats.has(index)) {
            const newExcluded = new Set(excludedSeats);
            newExcluded.delete(index);
            setExcludedSeats(newExcluded);
        }
    };

    const handleUnfixStudent = (index: number) => {
        const newFixed = new Map(fixedStudents);
        newFixed.delete(index);
        setFixedStudents(newFixed);
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
                    학급 랜덤 자리 배치표
                </h1>
                <p className="mt-2 text-lg text-slate-600">
                    자리 고정 및 학생 분리 기능으로 스마트하게 자리를 배치하세요.
                </p>
            </header>
            <main className="flex flex-col lg:flex-row gap-8 items-start max-w-screen-2xl mx-auto">
                <div className="w-full lg:w-[40%] flex-shrink-0">
                    <Controls
                        rows={rows} setRows={setRows}
                        cols={cols} setCols={setCols}
                        studentsStr={studentsStr} setStudentsStr={setStudentsStr}
                        studentList={studentList}
                        isExcluding={isExcluding} setIsExcluding={setIsExcluding}
                        showSeparation={showSeparation} setShowSeparation={setShowSeparation}
                        separationGroups={separationGroups}
                        onAddSeparationGroup={handleAddSeparationGroup}
                        onRemoveSeparationGroup={handleRemoveSeparationGroup}
                        onUpdateSeparationGroupStudent={handleUpdateSeparationGroupStudent}
                        onAddStudentToGroup={handleAddStudentToGroup}
                        onRemoveStudentFromGroup={handleRemoveStudentFromGroup}
                        onGenerate={handleGenerate}
                        onReset={handleReset}
                        errorMsg={errorMsg}
                    />
                </div>
                <div className='w-full lg:w-[60%]'>
                    <SeatingChart
                        rows={rows} cols={cols}
                        assignments={assignments}
                        fixedStudents={fixedStudents}
                        excludedSeats={excludedSeats}
                        isExcluding={isExcluding}
                        fixingSeatIndex={fixingSeatIndex}
                        onSeatClick={handleSeatClick}
                        onFixStudent={handleFixStudent}
                        onUnfixStudent={handleUnfixStudent}
                        studentList={studentList}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;