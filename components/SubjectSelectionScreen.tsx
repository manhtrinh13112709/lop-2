
import React from 'react';
import { Subject } from '../types';

interface SubjectSelectionScreenProps {
  studentName: string;
  onSelectSubject: (subject: string) => void;
}

const subjects: Subject[] = [
  { name: 'Toán', bgColor: 'bg-blue-400 hover:bg-blue-500', icon: '🔢' },
  { name: 'Tiếng Việt', bgColor: 'bg-red-400 hover:bg-red-500', icon: '📖' },
  { name: 'Tự nhiên & Xã hội', bgColor: 'bg-green-400 hover:bg-green-500', icon: '🌳' },
];

const SubjectSelectionScreen: React.FC<SubjectSelectionScreenProps> = ({ studentName, onSelectSubject }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center animate-fade-in-up">
      <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-700 mb-2">Xin chào, {studentName}!</h1>
      <p className="text-xl lg:text-2xl text-gray-500 mb-10">Bé hãy chọn môn học yêu thích nhé!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {subjects.map((subject) => (
          <button
            key={subject.name}
            onClick={() => onSelectSubject(subject.name)}
            className={`p-8 rounded-2xl text-white font-bold text-3xl transform hover:scale-105 transition-transform duration-300 shadow-lg ${subject.bgColor}`}
          >
            <div className="text-6xl mb-4">{subject.icon}</div>
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SubjectSelectionScreen;
