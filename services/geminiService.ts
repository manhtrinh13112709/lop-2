import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "Một danh sách 30 câu hỏi trắc nghiệm.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: {
                        type: Type.STRING,
                        description: "Nội dung câu hỏi."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "Một mảng chứa 4 phương án trả lời.",
                        items: {
                            type: Type.STRING
                        }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "Đáp án đúng, phải khớp chính xác với một trong các phương án."
                    }
                },
                required: ["questionText", "options", "correctAnswer"]
            }
        }
    }
};

export async function generateQuiz(subject: string): Promise<Question[]> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Tạo một bài kiểm tra trắc nghiệm gồm 30 câu hỏi cho môn học '${subject}' dành cho học sinh lớp 2 tại Việt Nam. Các câu hỏi cần tăng dần độ khó từ dễ đến khó. Mỗi câu hỏi có 4 phương án (A, B, C, D) và chỉ có một đáp án đúng. Ngôn ngữ phải đơn giản, rõ ràng, phù hợp với lứa tuổi.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (parsedData && parsedData.questions && Array.isArray(parsedData.questions)) {
            return parsedData.questions;
        } else {
            console.error("Generated data is not in the expected format:", parsedData);
            throw new Error("Không thể tạo câu hỏi. Dữ liệu trả về không đúng định dạng.");
        }
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Đã có lỗi xảy ra khi tạo câu hỏi từ AI. Vui lòng thử lại.");
    }
}

export async function generateWelcomeAudio(name: string): Promise<string> {
    try {
        const prompt = `Hãy nói với giọng nữ miền Bắc trầm ấm, tình cảm như một cô giáo: "Chào mừng bé ${name} đến với lớp học vui vẻ. Chúc con làm bài thật tốt nhé!"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Charon' }, // A deep, warm female voice
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("Không nhận được dữ liệu âm thanh từ API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating welcome audio:", error);
        throw new Error("Đã có lỗi xảy ra khi tạo âm thanh chào mừng.");
    }
}