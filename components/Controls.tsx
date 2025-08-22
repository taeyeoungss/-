import React from 'react';
import type { Student, SeparationGroup } from '../types';
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, MinusIcon } from './icons';

interface ControlsProps {
  rows: number;
  setRows: React.Dispatch<React.SetStateAction<number>>;
  cols: number;
  setCols: React.Dispatch<React.SetStateAction<number>>;
  studentsStr: string;
  setStudentsStr: React.Dispatch<React.SetStateAction<string>>;
  studentList: Student[];
  isExcluding: boolean;
  setIsExcluding: React.Dispatch<React.SetStateAction<boolean>>;
  showSeparation: boolean;
  setShowSeparation: React.Dispatch<React.SetStateAction<boolean>>;
  separationGroups: SeparationGroup[];
  onAddSeparationGroup: () => void;
  onRemoveSeparationGroup: (id: number) => void;
  onUpdateSeparationGroupStudent: (id: number, studentIndex: number, student: Student) => void;
  onAddStudentToGroup: (id: number) => void;
  onRemoveStudentFromGroup: (id: number, studentIndex: number) => void;
  onGenerate: () => void;
  onReset: () => void;
  errorMsg: string | null;
}

const Controls: React.FC<ControlsProps> = ({
  rows, setRows, cols, setCols, studentsStr, setStudentsStr, studentList,
  isExcluding, setIsExcluding, showSeparation, setShowSeparation, 
  separationGroups, onAddSeparationGroup, onRemoveSeparationGroup, 
  onUpdateSeparationGroupStudent, onAddStudentToGroup, onRemoveStudentFromGroup, 
  onGenerate, onReset, errorMsg,
}) => {
  const studentCount = studentList.length;
  const seatCount = rows * cols;

  return (
    <div className="w-full p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">자리 배치 설정</h2>

      {/* Seating Layout */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">자리 배치 형태</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="rows" className="block text-sm font-medium text-gray-600">가로 (행)</label>
            <input
              type="number"
              id="rows"
              value={rows}
              onChange={(e) => setRows(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="cols" className="block text-sm font-medium text-gray-600">세로 (열)</label>
            <input
              type="number"
              id="cols"
              value={cols}
              onChange={(e) => setCols(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

       {/* Exclude Seats */}
       <div className="border-t pt-4">
        <div className="flex items-center justify-between">
            <div className='flex flex-col'>
                 <h3 className="font-semibold text-gray-700">자리 제외 모드</h3>
                 <p className="text-xs text-gray-500 mt-1">활성화 후, 빈 자리를 클릭하여 배치에서 제외하세요.</p>
            </div>
            <button
                onClick={() => setIsExcluding(!isExcluding)}
                className={`${isExcluding ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                role="switch"
                aria-checked={isExcluding}
            >
                <span
                    aria-hidden="true"
                    className={`${isExcluding ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
       
      </div>

      {/* Student List */}
      <div className='border-t pt-4'>
        <label htmlFor="students" className="font-semibold text-gray-700">학생 명단 (한 줄에 한 명)</label>
        <textarea
          id="students"
          value={studentsStr}
          onChange={(e) => setStudentsStr(e.target.value)}
          rows={8}
          className="mt-2 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="홍길동&#10;이순신&#10;..."
        />
        <div className="mt-2 text-sm text-right font-medium" >
            <span className={studentCount > seatCount ? 'text-red-500' : 'text-gray-600'}>
                총 학생: {studentCount}명 / 총 좌석: {seatCount}개
            </span>
        </div>
      </div>
      
      {/* Separation Settings */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowSeparation(!showSeparation)}
          className="w-full flex justify-between items-center font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <span>떨어트릴 학생 설정 (선택)</span>
          {showSeparation ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
        {showSeparation && (
          <div className="mt-4 space-y-3">
            {separationGroups.map((group, index) => (
              <div key={group.id} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-gray-800">그룹 {index + 1}</h4>
                  <button
                    onClick={() => onRemoveSeparationGroup(group.id)}
                    className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    aria-label={`그룹 ${index + 1} 삭제`}
                  >
                    <TrashIcon />
                  </button>
                </div>
                {group.students.map((student, studentIndex) => (
                    <div key={studentIndex} className="flex items-center space-x-2">
                        <select
                            value={student}
                            onChange={(e) => onUpdateSeparationGroupStudent(group.id, studentIndex, e.target.value)}
                            className="block w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">학생 선택</option>
                            {studentList.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                            onClick={() => onRemoveStudentFromGroup(group.id, studentIndex)}
                            className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="학생 삭제"
                        >
                            <MinusIcon /> 
                        </button>
                    </div>
                ))}
                 <button
                    onClick={() => onAddStudentToGroup(group.id)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 border border-dashed border-gray-400 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                    <PlusIcon />
                    <span>학생 추가</span>
                </button>
              </div>
            ))}
            <button
              onClick={onAddSeparationGroup}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-dashed border-gray-400 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PlusIcon />
              <span>그룹 추가</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4 border-t">
        {errorMsg && <p className="text-sm text-center text-red-600 bg-red-100 p-2 rounded-md">{errorMsg}</p>}
        <button
          onClick={onGenerate}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
        >
          자리 배치 생성
        </button>
        <button
          onClick={onReset}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default Controls;