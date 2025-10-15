
import React, { useEffect, useRef } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface ResultsScreenProps {
  score: number;
  studentName: string;
  onPlayAgain: () => void;
}

const Confetti: React.FC = () => {
    const numConfetti = 100;
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {Array.from({ length: numConfetti }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                };
                return <div key={i} className="confetti" style={style}></div>;
            })}
        </div>
    );
};


const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, studentName, onPlayAgain }) => {
  const isPerfectScore = score === 30;
  const cheeringSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPerfectScore) {
      cheeringSoundRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(4e3).join("12345678"));
      cheeringSoundRef.current?.play();
    }
  }, [isPerfectScore]);

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center animate-fade-in-up overflow-hidden">
      {isPerfectScore && <Confetti />}
      <style>{`
          .confetti {
              position: absolute;
              width: 10px;
              height: 10px;
              opacity: 0;
              animation: fall 5s linear infinite;
          }
          @keyframes fall {
              0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotateZ(720deg); opacity: 0; }
          }
      `}</style>
      
      {isPerfectScore ? (
        <>
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-4xl lg:text-6xl font-extrabold text-amber-500 mb-2">XUẤT SẮC!</h1>
          <p className="text-2xl lg:text-3xl text-gray-700 mb-6">
            Chúc mừng {studentName} đã hoàn thành tất cả các câu hỏi!
          </p>
        </>
      ) : (
        <>
           <SparkleIcon className="w-24 h-24 mx-auto text-cyan-400" />
           <h1 className="text-4xl lg:text-6xl font-extrabold text-cyan-500 mb-2">Hoàn thành!</h1>
           <p className="text-2xl lg:text-3xl text-gray-700 mb-6">
             {studentName} đã làm rất tốt!
           </p>
        </>
      )}

      <div className="bg-sky-100 rounded-2xl p-6 my-8 inline-block">
        <p className="text-xl text-gray-600 font-semibold">Điểm số của bé là</p>
        <p className={`text-7xl font-extrabold ${isPerfectScore ? 'text-amber-500' : 'text-cyan-600'}`}>
          {score} / 30
        </p>
      </div>

      <div>
        <button
          onClick={onPlayAgain}
          className="bg-green-500 text-white text-2xl font-bold py-4 px-10 rounded-full hover:bg-green-600 transform hover:scale-105 transition duration-300 shadow-lg"
        >
          Chơi lại
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
