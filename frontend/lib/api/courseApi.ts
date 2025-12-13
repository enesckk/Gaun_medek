import apiClient from "./apiClient";

export interface Course {
  _id: string;
  name: string;
  code: string;
  description?: string;
  department?: string | { _id: string; name: string; code?: string };
  semester?: string;
  learningOutcomes?: Array<{ 
    code: string; 
    description: string;
    programOutcomes?: string[];
    relatedProgramOutcomes?: string[];
  }>;
  learningOutcomesCount?: number;
  midtermExam?: {
    examCode: string;
    questionCount: number;
    maxScorePerQuestion: number;
  };
  finalExam?: {
    examCode: string;
    questionCount: number;
    maxScorePerQuestion: number;
  };
  students?: Array<{ studentNumber: string; fullName: string }>;
  studentsCount?: number;
  examCount?: number;
  midtermExams?: Array<{ examCode: string; examType: string }>;
  finalExams?: Array<{ examCode: string; examType: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningOutcomeInput {
  code: string;
  description: string;
}

export interface ExamSettingsInput {
  examCode: string;
  questionCount: number;
  maxScorePerQuestion: number;
}

export interface StudentInput {
  studentNumber: string;
  fullName: string;
}

export interface CreateCourseDto {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  semester?: string;
  learningOutcomes?: LearningOutcomeInput[];
  midtermExam?: ExamSettingsInput;
  finalExam?: ExamSettingsInput;
  students?: StudentInput[];
}

export interface UpdateCourseDto {
  name?: string;
  code?: string;
  description?: string;
  departmentId?: string;
  semester?: string;
  learningOutcomes?: LearningOutcomeInput[];
  midtermExam?: ExamSettingsInput;
  finalExam?: ExamSettingsInput;
  students?: StudentInput[];
}

export const courseApi = {
  getAll: async (): Promise<Course[]> => {
    const response = await apiClient.get("/courses");
    return response.data.courses || response.data.data || [];
  },

  getById: async (id: string): Promise<Course> => {
    if (!id || id === 'undefined' || id === 'null' || id === '[object Object]') {
      console.error('Invalid course ID provided to getById:', id);
      throw new Error(`Geçersiz ders ID: ${id}`);
    }
    try {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data.course || response.data.data;
    } catch (error: any) {
      console.error('Error fetching course by ID:', error);
      throw error;
    }
  },

  createCourse: (data: CreateCourseDto) => apiClient.post("/courses/create", data),

  updateCourse: (id: string, data: UpdateCourseDto) => apiClient.put(`/courses/${id}`, data),

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  getMatrix: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/courses/${id}/matrix`);
    return response.data;
  },

  seed: async (): Promise<Course[]> => {
    const response = await apiClient.post("/courses/seed");
    return response.data.data || [];
  },
};
