import Question from "../models/Question.js";
import Exam from "../models/Exam.js";
import LearningOutcome from "../models/LearningOutcome.js";
import Score from "../models/Score.js";

// Create a new Question
const createQuestion = async (req, res) => {
  try {
    const { examId, number, maxScore, mappedLearningOutcomes } = req.body;

    // Validate required fields
    if (!examId || number === undefined || !maxScore || !mappedLearningOutcomes) {
      return res.status(400).json({
        success: false,
        message: "examId, number, maxScore ve mappedLearningOutcomes gereklidir",
      });
    }

    // Validate mappedLearningOutcomes is an array with at least one element
    if (!Array.isArray(mappedLearningOutcomes) || mappedLearningOutcomes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "En az bir öğrenme çıktısı (ÖÇ) seçilmelidir",
      });
    }

    // Validate that examId exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Sınav bulunamadı",
      });
    }

    // Validate number is not duplicated within the same exam
    const duplicateQuestion = await Question.exists({ examId, number });
    if (duplicateQuestion) {
      return res.status(400).json({
        success: false,
        message: "Bu sınavda bu soru numarası zaten kullanılıyor",
      });
    }

    // Create the question
    const question = new Question({
      examId,
      number,
      maxScore,
      mappedLearningOutcomes, // Array of ÖÇ codes
    });

    const savedQuestion = await question.save();

    // Push question _id into Exam.questions array
    exam.questions.push(savedQuestion._id);
    await exam.save();

    return res.status(201).json({
      success: true,
      data: savedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Questions for a specific exam
const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Validate that the exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Sınav bulunamadı",
      });
    }

    const questions = await Question.find({ examId })
      .sort({ number: 1 });

    return res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate({
        path: "examId",
        select: "title type",
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Soru bulunamadı",
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, maxScore, mappedLearningOutcomes } = req.body;

    // Check if Question exists
    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Soru bulunamadı",
      });
    }

    // Validate mappedLearningOutcomes if provided
    if (mappedLearningOutcomes !== undefined) {
      if (!Array.isArray(mappedLearningOutcomes) || mappedLearningOutcomes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "En az bir öğrenme çıktısı (ÖÇ) seçilmelidir",
        });
      }
    }

    // Ensure number uniqueness inside the exam on update
    if (number !== undefined && number !== existingQuestion.number) {
      const duplicateQuestion = await Question.exists({
        examId: existingQuestion.examId,
        number,
        _id: { $ne: id },
      });
      if (duplicateQuestion) {
        return res.status(400).json({
          success: false,
          message: "Bu sınavda bu soru numarası zaten kullanılıyor",
        });
      }
    }

    // Build update object with only provided fields
    const updateData = {};
    if (number !== undefined) updateData.number = number;
    if (maxScore !== undefined) updateData.maxScore = maxScore;
    if (mappedLearningOutcomes !== undefined)
      updateData.mappedLearningOutcomes = mappedLearningOutcomes;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Question exists
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if question has any Score entries linked to it
    const hasScores = await Score.exists({ questionId: id });
    if (hasScores) {
      return res.status(400).json({
        success: false,
        message: "Bu soruya ait öğrenci puanları olduğu için silinemez.",
      });
    }

    // Remove questionId from Exam.questions array
    const exam = await Exam.findById(question.examId);
    if (exam) {
      exam.questions = exam.questions.filter(
        (qId) => qId.toString() !== id
      );
      await exam.save();
    }

    // Delete the Question document
    const deletedQuestion = await Question.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Soru başarıyla silindi",
      data: deletedQuestion,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createQuestion,
  getQuestionsByExam,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

