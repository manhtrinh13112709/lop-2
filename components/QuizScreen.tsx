import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../types';
import { generateQuiz, generateWelcomeAudio } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface QuizScreenProps {
  studentName: string;
  subject: string;
  onQuizComplete: (score: number) => void;
}

const TOTAL_QUESTIONS = 30;
const TIME_PER_QUESTION = 15;

const QuizScreen: React.FC<QuizScreenProps> = ({ studentName, subject, onQuizComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // A clear "ting" sound for correct answers.
    correctSoundRef.current = new Audio("data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjQwLjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAABASW5mbwAAAA8AAAAEAAABIwAAHwAASU5GTw0AAABJTkZPSU5GT0lORk8AAAD//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////tAwA8/O5x+PT/9e/f5509e53ac792f39b69b3dc79555cb523023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023//tAwA8/O5x+PT/9e/f5509e53ac792f39b69b3dc79555cb523023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023//tAwA8/O5x+PT/9e/f5509e53ac792f39b69b3dc79555cb523023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023023//tAwCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAExhdmY1ODguMjAuMTAwVVU//tAwB0UVoAAA0AAB4AAAASABQAAAAAEgAABFBTRkFMTElCSU5GT1BSR1JFU1NJT05UUkFOU0lFTlRfU09VTkRfRk9SQkFST05fSU5GT1BSR1JFU1NJT05UUkFOU0lFTlRfU09VTkQAAAAAAAA//tAwBwoAAAD/2YAABpAAAACAAAADgAAABoAAAAgAAAASQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQAAAGkAAAAqAAAAYQAAAGkAAABpAAAAYQ-");
    incorrectSoundRef.current = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(1e3).join("9898878776766565"));
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(TIME_PER_QUESTION);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null); // Timeout
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, []);

  const fetchAndPrepareQuiz = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedQuestions = await generateQuiz(subject);
      if (fetchedQuestions.length < TOTAL_QUESTIONS) {
        throw new Error("Không đủ câu hỏi được tạo ra.");
      }
      setQuestions(fetchedQuestions);

      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const audioData = await generateWelcomeAudio(studentName);
      const decodedBytes = decode(audioData);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      setIsLoading(false);
      startTimer();
    } catch (e: any) {
      setError(e.message || "Lỗi không xác định.");
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, studentName]);

  useEffect(() => {
    fetchAndPrepareQuiz();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchAndPrepareQuiz]);

  const handleAnswer = (answer: string | null) => {
    if (isAnswered) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      correctSoundRef.current?.play();
    } else {
      incorrectSoundRef.current?.play();
    }

    setTimeout(() => {
      if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        startTimer();
      } else {
        onQuizComplete(isCorrect ? score + 1 : score);
      }
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="text-center p-10 bg-white rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-blue-500 mb-4">Đang tải câu hỏi...</h2>
        <p className="text-lg text-gray-600">AI đang chuẩn bị một bài học thật thú vị cho bé, vui lòng chờ trong giây lát nhé!</p>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mt-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 bg-white rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Ôi, có lỗi xảy ra!</h2>
        <p className="text-lg text-gray-600 mb-6">{error}</p>
        <button onClick={fetchAndPrepareQuiz} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600">Thử lại</button>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-white hover:bg-sky-200 text-sky-800';
    }
    if (option === currentQuestion.correctAnswer) {
      return 'bg-emerald-500 text-white animate-pulse-correct';
    }
    if (option === selectedAnswer) {
      return 'bg-rose-500 text-white';
    }
    return 'bg-gray-200 text-gray-500 opacity-70';
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6 text-xl font-bold">
        <div className="text-gray-600">Câu hỏi: <span className="text-blue-500">{currentQuestionIndex + 1}/{TOTAL_QUESTIONS}</span></div>
        <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center text-4xl font-extrabold text-red-500 shadow-lg border-4 border-red-200 -mt-12">
          {timeLeft}
        </div>
        <div className="text-amber-500">Điểm số: <span className="text-green-500">{score}</span></div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
        <div className="bg-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
      </div>

      <div className="mb-6 p-6 bg-sky-50 rounded-2xl min-h-[150px] flex items-center justify-center">
        <h2 className="text-2xl lg:text-3xl font-semibold text-center text-gray-800">{currentQuestion.questionText}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={isAnswered}
            className={`flex items-center justify-between p-4 rounded-xl text-xl font-semibold w-full transition-all duration-300 transform ${getButtonClass(option)} ${!isAnswered ? 'hover:scale-105' : ''}`}
          >
            <span>{option}</span>
            {isAnswered && option === currentQuestion.correctAnswer && <CheckIcon />}
            {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XIcon />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizScreen;