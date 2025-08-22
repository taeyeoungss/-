import React from 'react';
import type { Student } from '../types';
import Seat from './Seat';

interface SeatingChartProps {
  rows: number;
  cols: number;
  assignments: Map<number, Student>;
  fixedStudents: Map<number, Student>;
  excludedSeats: Set<number>;
  isExcluding: boolean;
  fixingSeatIndex: number | null;
  onSeatClick: (index: number) => void;
  onFixStudent: (index: number, student: Student) => void;
  onUnfixStudent: (index: number) => void;
  studentList: Student[];
}

const SeatingChart: React.FC<SeatingChartProps> = ({
  rows, cols, assignments, fixedStudents, excludedSeats, isExcluding, fixingSeatIndex, onSeatClick, onFixStudent, onUnfixStudent, studentList
}) => {
  const totalSeats = rows * cols;
  const availableStudentsForFixing = studentList.filter(s => ![...fixedStudents.values()].includes(s));

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg">
      <div className="w-full mb-6 py-2 bg-gray-700 text-white text-center rounded-md font-bold text-xl shadow">
        교탁
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalSeats }).map((_, i) => (
          <Seat
            key={i}
            seatIndex={i}
            student={assignments.get(i) || null}
            isFixed={fixedStudents.has(i)}
            isExcluded={excludedSeats.has(i)}
            isExcluding={isExcluding}
            isFixing={fixingSeatIndex === i}
            onSeatClick={onSeatClick}
            onFixStudent={onFixStudent}
            onUnfixStudent={onUnfixStudent}
            availableStudents={availableStudentsForFixing}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatingChart;