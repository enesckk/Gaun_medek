import Score from "../models/Score.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";
import StudentExamResult from "../models/StudentExamResult.js";

/**
 * MÜDEK Assessment Logic
 * 
 * Question → ÖÇ → PÇ chain
 * 
 * 1. Questions map to ÖÇ codes (mappedLearningOutcomes: [String])
 * 2. ÖÇ definitions are in Course.learningOutcomes (embedded)
 * 3. Each ÖÇ has relatedProgramOutcomes: [String] (PÇ codes)
 * 4. PÇ success is derived from ÖÇ performance
 */

/**
 * Calculate Question → ÖÇ performance for an exam
 * GET /api/assessments/exam/:examId/question-lo-performance
 */
export const getQuestionLOPerformance = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Sınav bulunamadı",
      });
    }

    // Get all questions for this exam
    const questions = await Question.find({ examId }).sort({ number: 1 });

    if (questions.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu sınavda henüz soru yok",
      });
    }

    // Get all scores for this exam
    const questionIds = questions.map((q) => q._id);
    const scores = await Score.find({ examId, questionId: { $in: questionIds } });

    // Group scores by question
    const questionPerformance = questions.map((question) => {
      const questionScores = scores.filter(
        (s) => s.questionId.toString() === question._id.toString()
      );

      const totalScore = questionScores.reduce((sum, s) => sum + s.scoreValue, 0);
      const averageScore = questionScores.length > 0 
        ? totalScore / questionScores.length 
        : 0;
      const successRate = question.maxScore > 0
        ? (averageScore / question.maxScore) * 100
        : 0;

      return {
        questionNumber: question.number,
        maxScore: question.maxScore,
        learningOutcomeCodes: question.mappedLearningOutcomes || [],
        studentCount: questionScores.length,
        averageScore: Math.round(averageScore * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
      };
    });

    return res.status(200).json({
      success: true,
      data: questionPerformance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Calculate ÖÇ achievement for a course (all students)
 * GET /api/assessments/course/:courseId/lo-achievement
 */
export const getLOAchievement = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    if (!course.learningOutcomes || course.learningOutcomes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için öğrenme çıktısı tanımlanmamış",
      });
    }

    // Get all exams for this course
    const exams = await Exam.find({ courseId });
    const examIds = exams.map((e) => e._id);

    if (examIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Bu ders için sınav bulunamadı",
      });
    }

    // Get all StudentExamResult for this course (yeni sistem)
    const studentResults = await StudentExamResult.find({ 
      courseId: courseId,
      examId: { $in: examIds }
    });

    // Get all students for this course
    const studentNumbers = course.students?.map((s) => s.studentNumber) || [];
    const students = await Student.find({ studentNumber: { $in: studentNumbers } });
    const studentNumberSet = new Set(studentNumbers);

    // Calculate ÖÇ performance
    const loMap = new Map();

    // Initialize with course learning outcomes
    course.learningOutcomes.forEach((lo) => {
      loMap.set(lo.code, {
        code: lo.code,
        description: lo.description,
        relatedProgramOutcomes: lo.relatedProgramOutcomes || [],
        totalScoreEarned: 0,
        totalMaxScore: 0,
        studentsProcessed: new Set(),
      });
    });

    // Process StudentExamResult (yeni sistem)
    studentResults.forEach((result) => {
      // Sadece bu derse kayıtlı öğrencileri işle
      if (!studentNumberSet.has(result.studentNumber)) {
        return;
      }

      const exam = exams.find(e => e._id.toString() === result.examId.toString());
      if (!exam) return;

      // Process each question score
      (result.questionScores || []).forEach((qs) => {
        const loCode = qs.learningOutcomeCode;
        if (loCode && loMap.has(loCode)) {
          const loData = loMap.get(loCode);
          loData.totalScoreEarned += qs.score || 0;
          loData.totalMaxScore += exam.maxScorePerQuestion || 0;
          loData.studentsProcessed.add(result.studentNumber);
        }
      });
    });

    // Calculate achievement percentages
    const results = Array.from(loMap.values()).map((loData) => {
      const studentCount = loData.studentsProcessed?.size || 0;
      // Ortalama skor: toplam kazanılan puan / öğrenci sayısı
      const averageScore = studentCount > 0
        ? loData.totalScoreEarned / studentCount
        : 0;
      // Başarı yüzdesi: ortalama skor / maksimum skor * 100
      // Ancak totalMaxScore her öğrenci için toplanmış olabilir, bu yüzden düzeltme yapalım
      const avgMaxScore = studentCount > 0
        ? loData.totalMaxScore / studentCount
        : 0;
      const achievedPercentage = avgMaxScore > 0
        ? (averageScore / avgMaxScore) * 100
        : 0;

      return {
        code: loData.code,
        description: loData.description,
        relatedProgramOutcomes: loData.relatedProgramOutcomes,
        studentCount,
        averageScore: Math.round(averageScore * 100) / 100,
        totalMaxScore: Math.round(avgMaxScore * 100) / 100,
        achievedPercentage: Math.round(achievedPercentage * 100) / 100,
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

/**
 * Calculate PÇ achievement derived from ÖÇ performance
 * GET /api/assessments/course/:courseId/po-achievement
 */
export const getPOAchievement = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Ders bulunamadı",
      });
    }

    // First get ÖÇ achievements
    const loAchievements = await getLOAchievementData(courseId);

    if (loAchievements.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Öğrenme çıktısı başarı verisi bulunamadı",
      });
    }

    // Build PÇ map from ÖÇ achievements
    const poMap = new Map();

    loAchievements.forEach((loAchievement) => {
      const relatedPOs = loAchievement.relatedProgramOutcomes || [];
      
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
          code: loAchievement.code,
          achievedPercentage: loAchievement.achievedPercentage,
        });
      });
    });

    // Calculate average PÇ achievement
    const results = Array.from(poMap.values()).map((poData) => {
      const averageAchievement = poData.loAchievements.length > 0
        ? poData.loAchievements.reduce((sum, val) => sum + val, 0) / poData.loAchievements.length
        : 0;

      return {
        code: poData.code,
        achievedPercentage: Math.round(averageAchievement * 100) / 100,
        contributingLOs: poData.contributingLOs,
        contributingLOCount: poData.contributingLOs.length,
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

/**
 * Helper function to get ÖÇ achievement data
 */
async function getLOAchievementData(courseId) {
  const course = await Course.findById(courseId);
  
  if (!course || !course.learningOutcomes || course.learningOutcomes.length === 0) {
    return [];
  }

  const exams = await Exam.find({ courseId });
  const examIds = exams.map((e) => e._id);

  if (examIds.length === 0) {
    return [];
  }

  const questions = await Question.find({ examId: { $in: examIds } });
  const questionIds = questions.map((q) => q._id);

  const scores = await Score.find({ questionId: { $in: questionIds } });

  const studentNumbers = course.students?.map((s) => s.studentNumber) || [];
  const students = await Student.find({ studentNumber: { $in: studentNumbers } });
  const studentIds = students.map((s) => s._id);

  const loMap = new Map();

  course.learningOutcomes.forEach((lo) => {
    loMap.set(lo.code, {
      code: lo.code,
      description: lo.description,
      relatedProgramOutcomes: lo.relatedProgramOutcomes || [],
      totalScoreEarned: 0,
      totalMaxScore: 0,
      studentCount: 0,
    });
  });

  questions.forEach((question) => {
    const loCodes = question.mappedLearningOutcomes || [];
    loCodes.forEach((loCode) => {
      if (loMap.has(loCode)) {
        loMap.get(loCode).totalMaxScore += question.maxScore;
      }
    });
  });

  scores.forEach((score) => {
    if (!studentIds.includes(score.studentId.toString())) {
      return;
    }

    const question = questions.find(
      (q) => q._id.toString() === score.questionId.toString()
    );

    if (question) {
      const loCodes = question.mappedLearningOutcomes || [];
      loCodes.forEach((loCode) => {
        if (loMap.has(loCode)) {
          const loData = loMap.get(loCode);
          loData.totalScoreEarned += score.scoreValue;
          if (!loData.studentsProcessed) {
            loData.studentsProcessed = new Set();
          }
          loData.studentsProcessed.add(score.studentId.toString());
        }
      });
    }
  });

  return Array.from(loMap.values()).map((loData) => {
    const studentCount = loData.studentsProcessed?.size || 0;
    const averageScore = studentCount > 0
      ? loData.totalScoreEarned / studentCount
      : 0;
    const achievedPercentage = loData.totalMaxScore > 0
      ? (averageScore / loData.totalMaxScore) * 100
      : 0;

    return {
      code: loData.code,
      description: loData.description,
      relatedProgramOutcomes: loData.relatedProgramOutcomes,
      achievedPercentage: Math.round(achievedPercentage * 100) / 100,
    };
  });
}

