
export interface Student {
  name: string;
  className: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface Subject {
  name: string;
  bgColor: string;
  icon: string;
}
