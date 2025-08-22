import React from 'react';
import type { Student } from '../types';
import { LockClosedIcon, BanIcon } from './icons';

interface SeatProps {
  seatIndex: number;
  student: Student | null;
  isFixed: boolean;
  isExcluded: boolean;
  isExcluding: boolean;
  isFixing: boolean;
  onSeatClick: (index: number) => void;
  onFixStudent: (index: number, student: Student) => void;
  onUnfixStudent: (index: number) => void;
  availableStudents: Student[];
}

const Seat: React.FC<SeatProps> = ({
  seatIndex, student, isFixed, isExcluded, isExcluding, isFixing, onSeatClick, onFixStudent, onUnfixStudent, availableStudents,
}) => {
  const baseClasses = "w-full h-24 rounded-lg border-2 flex flex-col items-center justify-center p-2 text-center shadow-md transition-all duration-200 relative";
  
  let stateClasses = "";

  if (isExcluded) {
    stateClasses = "bg-slate-300 border-slate-400";
    if (isExcluding && !isFixed) {
        stateClasses += " cursor-pointer hover:bg-slate-400";
    } else {
        stateClasses += " cursor-not-allowed";
    }
  } else if (student) {
    stateClasses = isFixed ? "bg-amber-200 border-amber-400" : "bg-sky-100 border-sky-300";
  } else { // Empty, not excluded
    stateClasses = "bg-slate-100 border-slate-300 hover:bg-slate-200 hover:border-slate-400 cursor-pointer";
  }


  const handleFixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      onFixStudent(seatIndex, e.target.value);
    }
  };
  
  const handleUnfixClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUnfixStudent(seatIndex);
  }

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={() => onSeatClick(seatIndex)}>
      <span className="text-xs font-mono text-slate-500 absolute top-1 left-1.5">{seatIndex + 1}</span>
      {isFixed && !isFixing && (
        <button onClick={handleUnfixClick} className="absolute top-1 right-1 p-0.5 rounded-full hover:bg-amber-300">
          <LockClosedIcon/>
        </button>
      )}

      {isFixing ? (
        <div className="w-full p-1">
          <select
            autoFocus
            onBlur={() => onSeatClick(-1)} // Close dropdown on blur
            onChange={handleFixChange}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm p-1 border border-gray-300 rounded"
          >
            <option value="">학생 선택</option>
            {availableStudents.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      ) : isExcluded ? (
        <BanIcon />
      ) : (
        <span className="text-lg font-bold text-slate-800">{student}</span>
      )}
    </div>
  );
};

export default Seat;