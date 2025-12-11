import LearningOutcome from "../models/LearningOutcome.js";
import Course from "../models/Course.js";
import Question from "../models/Question.js";
import ProgramOutcome from "../models/ProgramOutcome.js";

// Create a new Learning Outcome
const createLearningOutcome = async (req, res) => {
  try {
    const { courseId, code, description, mappedProgramOutcomes } = req.body;

    // Validate required fields
    if (!courseId || !code || !description) {
      return res.status(400).json({
        success: false,
        message: "courseId, code, and description are required",
      });
    }

    // Validate that the referenced course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if a learning outcome with the same code already exists for this course
    const normalizedCode = code.trim();
    const existingOutcome = await LearningOutcome.findOne({
      courseId: courseId,
      code: normalizedCode,
    });

    if (existingOutcome) {
      return res.status(400).json({
        success: false,
        message: `"${normalizedCode}" kodu bu ders için zaten mevcut. Aynı ders içinde aynı ÖÇ kodu kullanılamaz.`,
      });
    }

    // Create the learning outcome
    const learningOutcome = new LearningOutcome({
      courseId,
      code,
      description,
      mappedProgramOutcomes: mappedProgramOutcomes || [],
    });

    const savedOutcome = await learningOutcome.save();

    // Get PÇ codes from mappedProgramOutcomes (if they are ObjectIds, populate them)
    let pcCodes = [];
    if (mappedProgramOutcomes && mappedProgramOutcomes.length > 0) {
      // Check if they are ObjectIds or already codes
      if (typeof mappedProgramOutcomes[0] === 'string' && mappedProgramOutcomes[0].startsWith('PÇ')) {
        // Already codes
        pcCodes = mappedProgramOutcomes;
      } else {
        // ObjectIds, need to fetch codes
        const programOutcomes = await ProgramOutcome.find({
          _id: { $in: mappedProgramOutcomes }
        });
        pcCodes = programOutcomes.map(po => po.code);
      }
    }

    // Add the learning outcome to the course's embedded learningOutcomes array
    if (!Array.isArray(course.learningOutcomes)) {
      course.learningOutcomes = [];
    }
    // Check if already exists in embedded array (by code)
    const existingIndex = course.learningOutcomes.findIndex(
      (lo) => lo.code === savedOutcome.code
    );
    if (existingIndex === -1) {
      // Add to embedded array (with code, description, programOutcomes)
      course.learningOutcomes.push({
        code: savedOutcome.code,
        description: savedOutcome.description,
        programOutcomes: pcCodes,
      });
    } else {
      // Update existing entry
      course.learningOutcomes[existingIndex] = {
        code: savedOutcome.code,
        description: savedOutcome.description,
        programOutcomes: pcCodes,
      };
    }
    await course.save();

    // Populate mappedProgramOutcomes before returning
    const populatedOutcome = await LearningOutcome.findById(
      savedOutcome._id
    ).populate("mappedProgramOutcomes", "code");

    // Transform mappedProgramOutcomes from populated objects to code strings
    const loObj = populatedOutcome.toObject();
    if (loObj.mappedProgramOutcomes && Array.isArray(loObj.mappedProgramOutcomes)) {
      loObj.mappedProgramOutcomes = loObj.mappedProgramOutcomes.map(po => 
        typeof po === 'object' && po !== null ? po.code : po
      ).filter(Boolean);
    }

    return res.status(201).json({
      success: true,
      data: loObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all Learning Outcomes for a specific course
const getLearningOutcomesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const learningOutcomes = await LearningOutcome.find({ courseId })
      .populate("mappedProgramOutcomes", "code")
      .sort({ code: 1 });

    // Transform mappedProgramOutcomes from populated objects to code strings
    const transformedOutcomes = learningOutcomes.map(lo => {
      const loObj = lo.toObject();
      if (loObj.mappedProgramOutcomes && Array.isArray(loObj.mappedProgramOutcomes)) {
        loObj.mappedProgramOutcomes = loObj.mappedProgramOutcomes.map(po => 
          typeof po === 'object' && po !== null ? po.code : po
        ).filter(Boolean);
      }
      return loObj;
    });

    return res.status(200).json({
      success: true,
      data: transformedOutcomes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single Learning Outcome by ID
const getLearningOutcomeById = async (req, res) => {
  try {
    const { id } = req.params;

    const learningOutcome = await LearningOutcome.findById(id).populate(
      "mappedProgramOutcomes",
      "code"
    );

    if (!learningOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    // Transform mappedProgramOutcomes from populated objects to code strings
    const loObj = learningOutcome.toObject();
    if (loObj.mappedProgramOutcomes && Array.isArray(loObj.mappedProgramOutcomes)) {
      loObj.mappedProgramOutcomes = loObj.mappedProgramOutcomes.map(po => 
        typeof po === 'object' && po !== null ? po.code : po
      ).filter(Boolean);
    }

    return res.status(200).json({
      success: true,
      data: loObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a Learning Outcome
const updateLearningOutcome = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, mappedProgramOutcomes } = req.body;

    // Check if Learning Outcome exists
    const existingOutcome = await LearningOutcome.findById(id);
    if (!existingOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (code !== undefined) {
      // Check if the new code already exists for this course (excluding current outcome)
      const normalizedCode = code.trim();
      const duplicateOutcome = await LearningOutcome.findOne({
        courseId: existingOutcome.courseId,
        code: normalizedCode,
        _id: { $ne: id }, // Exclude current outcome
      });

      if (duplicateOutcome) {
        return res.status(400).json({
          success: false,
          message: `"${normalizedCode}" kodu bu ders için zaten mevcut. Aynı ders içinde aynı ÖÇ kodu kullanılamaz.`,
        });
      }
      updateData.code = normalizedCode;
    }
    if (description !== undefined) updateData.description = description;
    if (mappedProgramOutcomes !== undefined)
      updateData.mappedProgramOutcomes = mappedProgramOutcomes;

    const updatedOutcome = await LearningOutcome.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("mappedProgramOutcomes", "code");

    // Update course's embedded learningOutcomes array
    const course = await Course.findById(existingOutcome.courseId);
    if (course && Array.isArray(course.learningOutcomes)) {
      const index = course.learningOutcomes.findIndex(
        (lo) => lo.code === existingOutcome.code
      );
      if (index !== -1) {
        // Get PÇ codes from mappedProgramOutcomes
        let pcCodes = [];
        if (updatedOutcome.mappedProgramOutcomes && updatedOutcome.mappedProgramOutcomes.length > 0) {
          // Check if they are populated objects or ObjectIds
          if (typeof updatedOutcome.mappedProgramOutcomes[0] === 'object' && updatedOutcome.mappedProgramOutcomes[0].code) {
            // Already populated, extract codes
            pcCodes = updatedOutcome.mappedProgramOutcomes.map(po => po.code);
          } else if (typeof updatedOutcome.mappedProgramOutcomes[0] === 'string' && updatedOutcome.mappedProgramOutcomes[0].startsWith('PÇ')) {
            // Already codes
            pcCodes = updatedOutcome.mappedProgramOutcomes;
          } else {
            // ObjectIds, need to fetch codes
            const programOutcomes = await ProgramOutcome.find({
              _id: { $in: updatedOutcome.mappedProgramOutcomes }
            });
            pcCodes = programOutcomes.map(po => po.code);
          }
        }
        
        course.learningOutcomes[index] = {
          code: updatedOutcome.code,
          description: updatedOutcome.description,
          programOutcomes: pcCodes,
        };
        await course.save();
      }
    }

    // Transform mappedProgramOutcomes from populated objects to code strings
    const loObj = updatedOutcome.toObject();
    if (loObj.mappedProgramOutcomes && Array.isArray(loObj.mappedProgramOutcomes)) {
      loObj.mappedProgramOutcomes = loObj.mappedProgramOutcomes.map(po => 
        typeof po === 'object' && po !== null ? po.code : po
      ).filter(Boolean);
    }

    return res.status(200).json({
      success: true,
      data: loObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a Learning Outcome
const deleteLearningOutcome = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if Learning Outcome exists
    const learningOutcome = await LearningOutcome.findById(id);
    if (!learningOutcome) {
      return res.status(404).json({
        success: false,
        message: "Learning Outcome not found",
      });
    }

    // Check if the ÖÇ is used in any Question document
    const isUsedInQuestion = await Question.exists({
      mappedLearningOutcome: id,
    });

    if (isUsedInQuestion) {
      return res.status(400).json({
        success: false,
        message:
          "This Learning Outcome is used in exam questions and cannot be deleted.",
      });
    }

    // Remove from course's learningOutcomes array (both embedded and reference)
    const course = await Course.findById(learningOutcome.courseId);
    if (course) {
      // Remove from embedded learningOutcomes array by code
      if (Array.isArray(course.learningOutcomes)) {
        course.learningOutcomes = course.learningOutcomes.filter(
          (lo) => lo.code !== learningOutcome.code
        );
      }
      await course.save();
    }

    // Delete the learning outcome
    const deletedOutcome = await LearningOutcome.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Learning Outcome deleted successfully",
      data: deletedOutcome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createLearningOutcome,
  getLearningOutcomesByCourse,
  getLearningOutcomeById,
  updateLearningOutcome,
  deleteLearningOutcome,
};

