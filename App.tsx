
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SubjectSelectionScreen from './components/SubjectSelectionScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import { Student } from './types';

type GameState = 'welcome' | 'subject_selection' | 'quiz' | 'results';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);

  const handleWelcomeSubmit = useCallback((studentInfo: Student) => {
    setStudent(studentInfo);
    setGameState('subject_selection');
  }, []);

  const handleSubjectSelect = useCallback((subject: string) => {
    setSelectedSubject(subject);
    setGameState('quiz');
  }, []);

  const handleQuizComplete = useCallback((score: number) => {
    setFinalScore(score);
    setGameState('results');
  }, []);

  const handlePlayAgain = useCallback(() => {
    setSelectedSubject(null);
    setFinalScore(0);
    setGameState('subject_selection');
  }, []);

  const renderContent = () => {
    switch (gameState) {
      case 'welcome':
        return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
      case 'subject_selection':
        return student && <SubjectSelectionScreen studentName={student.name} onSelectSubject={handleSubjectSelect} />;
      case 'quiz':
        return student && selectedSubject && <QuizScreen studentName={student.name} subject={selectedSubject} onQuizComplete={handleQuizComplete} />;
      case 'results':
        return student && <ResultsScreen score={finalScore} studentName={student.name} onPlayAgain={handlePlayAgain} />;
      default:
        return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen w-full flex items-center justify-center p-4 selection:bg-sky-300">
      <div className="w-full max-w-4xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
