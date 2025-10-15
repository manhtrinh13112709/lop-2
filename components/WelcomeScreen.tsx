
import React, { useState } from 'react';
import { Student } from '../types';

interface WelcomeScreenProps {
  onSubmit: (student: Student) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && className.trim()) {
      onSubmit({ name: name.trim(), className: className.trim() });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center animate-fade-in-up">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-cyan-500 mb-2">Lớp Học Vui Vẻ</h1>
        <p className="text-xl lg:text-2xl text-gray-600 mb-8">Chào mừng các bé đến với thế giới tri thức!</p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
            <div>
                <label htmlFor="name" className="block text-lg font-bold text-gray-700 mb-2 text-left">Họ và tên bé</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-full focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition duration-300"
                    required
                />
            </div>
            <div>
                <label htmlFor="className" className="block text-lg font-bold text-gray-700 mb-2 text-left">Lớp</label>
                <input
                    id="className"
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Ví dụ: Lớp 2A"
                    className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-full focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition duration-300"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full bg-amber-400 text-white text-2xl font-bold py-4 rounded-full hover:bg-amber-500 transform hover:scale-105 transition duration-300 shadow-lg"
            >
                Bắt đầu!
            </button>
        </form>
    </div>
  );
};

export default WelcomeScreen;
