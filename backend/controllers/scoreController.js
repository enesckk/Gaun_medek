import Score from "../models/Score.js";
import Student from "../models/Student.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import LearningOutcome from "../models/LearningOutcome.js";
import ProgramOutcome from "../models/ProgramOutcome.js";
import Course from "../models/Course.js";

// Submit or update a score
const submitScore = async (req, res) => {
  try {
    const { studentId, examId, questionId, scoreValue } = req.body;

    // Validate required fields
    if (!studentId || !examId || !questionId || scoreValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "studentId, examId, questionId, and scoreValue are required",
      });
    }

    // Validate that studentId exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate that examId exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Validate that questionId exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Validate that question belongs to the exam
    if (question.examId.toString() !== examId) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to the specified exam",
      });
    }

    // Validate scoreValue is not negative and not greater than maxScore
    if (scoreValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Score value cannot be negative",
      });
    }

    if (scoreValue > question.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score value cannot exceed maximum score of ${question.maxScore}`,
      });
    }

    // Find existing score or create new one (upsert)
    const savedScore = await Score.findOneAndUpdate(
      { studentId, questionId },
      {
        studentId,
        examId,
        questionId,
        scoreValue,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: savedScore,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all scores for a student
const getScoresByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate that student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const scores = await Score.find({ studentId })
      .populate({
        path: "questionId",
        select: "number maxScore mappedLearningOutcomes",
      })
      .populate({
        path: "examId",
        select: "title type",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all scores for an exam
const getScoresByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Validate that exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const scores = await Score.find({ examId })
      .populate("studentId", "studentNumber name")
      .populate("questionId", "number maxScore")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get scores for a student for a specific exam
const getScoresByStudentForExam = async (req, res) => {
  try {
    const { studentId, examId } = req.params;

    // Validate that student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate that exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const scores = await Score.find({ studentId, examId })
      .populate({
        path: "questionId",
        select: "number maxScore mappedLearningOutcomes",
      })
      .populate({
        path: "examId",
        select: "title type",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: scores,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Calculate Learning Outcome (ÖÇ) achievement for a student in a course
const calculateLOAchievement = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Validate required fields
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseId are required",
      });
    }

    // Validate that student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate that course exists and get embedded learningOutcomes
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // 1. Find all exams for the course
    const exams = await Exam.find({ courseId });
    const examIds = exams.map((exam) => exam._id);

    if (examIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için sınav bulunamadı",
      });
    }

    // 2. Check if course has learning outcomes
    if (!course || !course.learningOutcomes || course.learningOutcomes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için öğrenme çıktısı tanımlanmamış",
      });
    }

    // 3. Find all questions in these exams
    const questions = await Question.find({ examId: { $in: examIds } });

    if (questions.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için soru bulunamadı",
      });
    }

    // 4. Find all scores for this student corresponding to those questions
    const questionIds = questions.map((q) => q._id);
    const scores = await Score.find({
      studentId,
      questionId: { $in: questionIds },
    });

    // 5. Group by LearningOutcome Code (from Course.learningOutcomes)
    const loMap = new Map();

    // Initialize map with course learning outcomes
    course.learningOutcomes.forEach((lo) => {
      loMap.set(lo.code, {
        learningOutcome: {
          code: lo.code,
          description: lo.description,
          relatedProgramOutcomes: lo.relatedProgramOutcomes || [],
        },
        totalScoreEarned: 0,
        totalMaxScore: 0,
      });
    });

    // Process questions - add max scores
    questions.forEach((question) => {
      const loCodes = question.mappedLearningOutcomes || [];
      loCodes.forEach((loCode) => {
        if (loMap.has(loCode)) {
          loMap.get(loCode).totalMaxScore += question.maxScore;
        }
      });
    });

    // Add student scores
    scores.forEach((score) => {
      const question = questions.find(
        (q) => q._id.toString() === score.questionId.toString()
      );
      if (question) {
        const loCodes = question.mappedLearningOutcomes || [];
        loCodes.forEach((loCode) => {
          if (loMap.has(loCode)) {
            loMap.get(loCode).totalScoreEarned += score.scoreValue;
          }
        });
      }
    });

    // 6. Calculate achievement percentage for each LO
    const results = Array.from(loMap.values())
      .filter((loData) => loData.totalMaxScore > 0) // Only include LOs with questions
      .map((loData) => {
        const achievedPercentage =
          loData.totalMaxScore > 0
            ? (loData.totalScoreEarned / loData.totalMaxScore) * 100
            : 0;

        return {
          learningOutcome: loData.learningOutcome,
          achievedPercentage: Math.round(achievedPercentage * 100) / 100,
          totalScoreEarned: loData.totalScoreEarned,
          totalMaxScore: loData.totalMaxScore,
        };
      });

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Calculate Program Outcome (PÇ) achievement for a student in a course
const calculatePOAchievement = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // Validate required fields
    if (!studentId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "studentId and courseId are required",
      });
    }

    // Validate that student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Validate that course exists and get embedded learningOutcomes
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // Check if course has learning outcomes
    if (!course.learningOutcomes || course.learningOutcomes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için öğrenme çıktısı tanımlanmamış",
      });
    }

    // 1. Calculate LO achievements manually
    const exams = await Exam.find({ courseId });
    const examIds = exams.map((exam) => exam._id);

    if (examIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için sınav bulunamadı",
      });
    }

    const questions = await Question.find({ examId: { $in: examIds } });

    if (questions.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için soru bulunamadı",
      });
    }

    const questionIds = questions.map((q) => q._id);
    const scores = await Score.find({
      studentId,
      questionId: { $in: questionIds },
    });

    // Calculate LO achievements using Course.learningOutcomes
    const loMap = new Map();
    
    // Initialize with course learning outcomes
    course.learningOutcomes.forEach((lo) => {
      loMap.set(lo.code, {
        learningOutcome: {
          code: lo.code,
          description: lo.description,
          relatedProgramOutcomes: lo.relatedProgramOutcomes || [],
        },
        totalScoreEarned: 0,
        totalMaxScore: 0,
      });
    });

    // Process questions
    questions.forEach((question) => {
      const loCodes = question.mappedLearningOutcomes || [];
      loCodes.forEach((loCode) => {
        if (loMap.has(loCode)) {
          loMap.get(loCode).totalMaxScore += question.maxScore;
        }
      });
    });

    // Process scores
    scores.forEach((score) => {
      const question = questions.find(
        (q) => q._id.toString() === score.questionId.toString()
      );
      if (question) {
        const loCodes = question.mappedLearningOutcomes || [];
        loCodes.forEach((loCode) => {
          if (loMap.has(loCode)) {
            loMap.get(loCode).totalScoreEarned += score.scoreValue;
          }
        });
      }
    });

    const loAchievementsData = Array.from(loMap.values())
      .filter((loData) => loData.totalMaxScore > 0)
      .map((loData) => ({
        learningOutcome: loData.learningOutcome,
        achievedPercentage:
          loData.totalMaxScore > 0
            ? (loData.totalScoreEarned / loData.totalMaxScore) * 100
            : 0,
      }));

    // Build PO map from ÖÇ achievements
    const poMap = new Map();

    loAchievementsData.forEach((loAchievement) => {
      const relatedPOs = loAchievement.learningOutcome.relatedProgramOutcomes || [];
      
      relatedPOs.forEach((poCode) => {
        if (!poMap.has(poCode)) {
          poMap.set(poCode, {
            code: poCode,
            loAchievements: [],
            contributingLOs: [],
          });
        }
        
        poMap.get(poCode).loAchievements.push(loAchievement.achievedPercentage);
        poMap.get(poCode).contributingLOs.push({
          code: loAchievement.learningOutcome.code,
          achievedPercentage: loAchievement.achievedPercentage,
        });
      });
    });

    // Calculate average achievement for each PO
    const results = Array.from(poMap.values())
      .filter((poData) => poData.loAchievements.length > 0)
      .map((poData) => {
        const averageAchievement =
          poData.loAchievements.reduce((sum, val) => sum + val, 0) /
          poData.loAchievements.length;

        return {
          programOutcome: {
            code: poData.code,
          },
          achievedPercentage: Math.round(averageAchievement * 100) / 100,
          contributingLOs: poData.contributingLOs.length,
        };
      });

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  submitScore,
  getScoresByStudent,
  getScoresByExam,
  getScoresByStudentForExam,
  calculateLOAchievement,
  calculatePOAchievement,
};

