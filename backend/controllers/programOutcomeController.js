import Department from "../models/Department.js";
import Program from "../models/Program.js";

// Get all program outcomes for a program
export const getProgramOutcomesByProgram = async (req, res) => {
  try {
    const { programId } = req.params;

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    return res.status(200).json({
      success: true,
      data: program.programOutcomes || [],
    });
  } catch (error) {
    console.error("Error fetching program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları getirilirken bir hata oluştu.",
    });
  }
};

// Get all program outcomes for a department (legacy - aggregates from all programs)
export const getProgramOutcomesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı.",
      });
    }

    // Get all programs for this department
    const programs = await Program.find({ department: departmentId });
    
    // Aggregate program outcomes from all programs
    const allProgramOutcomes = [];
    const seenCodes = new Set();
    
    for (const program of programs) {
      if (program.programOutcomes && Array.isArray(program.programOutcomes)) {
        for (const po of program.programOutcomes) {
          if (!seenCodes.has(po.code)) {
            allProgramOutcomes.push(po);
            seenCodes.add(po.code);
          }
        }
      }
    }

    // Also include legacy department-level program outcomes for backward compatibility
    if (department.programOutcomes && Array.isArray(department.programOutcomes)) {
      for (const po of department.programOutcomes) {
        if (!seenCodes.has(po.code)) {
          allProgramOutcomes.push(po);
          seenCodes.add(po.code);
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: allProgramOutcomes,
    });
  } catch (error) {
    console.error("Error fetching program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları getirilirken bir hata oluştu.",
    });
  }
};

// Add a program outcome to a program
export const addProgramOutcome = async (req, res) => {
  try {
    const { programId } = req.params;
    const { code, description } = req.body;

    if (!code || !description) {
      return res.status(400).json({
        success: false,
        message: "PÇ kodu ve açıklama gereklidir.",
      });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    // Check if code already exists in this program
    const existingPO = program.programOutcomes?.find((po) => po.code === code.trim());
    if (existingPO) {
      return res.status(400).json({
        success: false,
        message: `"${code}" kodu bu program için zaten mevcut.`,
      });
    }

    // Add new program outcome
    if (!program.programOutcomes) {
      program.programOutcomes = [];
    }

    program.programOutcomes.push({
      code: code.trim(),
      description: description.trim(),
    });

    await program.save();

    return res.status(201).json({
      success: true,
      message: "Program çıktısı başarıyla eklendi.",
      data: program.programOutcomes,
    });
  } catch (error) {
    console.error("Error adding program outcome:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktısı eklenirken bir hata oluştu.",
    });
  }
};

// Legacy: Add program outcome to department (for backward compatibility)
export const addProgramOutcomeToDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { code, description } = req.body;

    if (!code || !description) {
      return res.status(400).json({
        success: false,
        message: "PÇ kodu ve açıklama gereklidir.",
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı.",
      });
    }

    // Check if code already exists
    const existingPO = department.programOutcomes?.find((po) => po.code === code.trim());
    if (existingPO) {
      return res.status(400).json({
        success: false,
        message: `"${code}" kodu zaten mevcut.`,
      });
    }

    // Add new program outcome
    if (!department.programOutcomes) {
      department.programOutcomes = [];
    }

    department.programOutcomes.push({
      code: code.trim(),
      description: description.trim(),
    });

    await department.save();

    return res.status(201).json({
      success: true,
      message: "Program çıktısı başarıyla eklendi.",
      data: department.programOutcomes,
    });
  } catch (error) {
    console.error("Error adding program outcome:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktısı eklenirken bir hata oluştu.",
    });
  }
};

// Update program outcomes for a program (replace entire array)
export const updateProgramOutcomes = async (req, res) => {
  try {
    const { programId } = req.params;
    const { programOutcomes } = req.body;

    if (!Array.isArray(programOutcomes)) {
      return res.status(400).json({
        success: false,
        message: "programOutcomes bir array olmalıdır.",
      });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    // Validate each PO
    for (const po of programOutcomes) {
      if (!po.code || !po.description) {
        return res.status(400).json({
          success: false,
          message: "Her program çıktısı için kod ve açıklama gereklidir.",
        });
      }
    }

    // Check for duplicate codes
    const codes = programOutcomes.map((po) => po.code.trim());
    const uniqueCodes = new Set(codes);
    if (codes.length !== uniqueCodes.size) {
      return res.status(400).json({
        success: false,
        message: "PÇ kodları benzersiz olmalıdır.",
      });
    }

    // Update program outcomes
    program.programOutcomes = programOutcomes.map((po) => ({
      code: po.code.trim(),
      description: po.description.trim(),
    }));

    await program.save();

    return res.status(200).json({
      success: true,
      message: "Program çıktıları başarıyla güncellendi.",
      data: program.programOutcomes,
    });
  } catch (error) {
    console.error("Error updating program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları güncellenirken bir hata oluştu.",
    });
  }
};

// Delete a specific program outcome from a program
export const deleteProgramOutcome = async (req, res) => {
  try {
    const { programId } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "PÇ kodu gereklidir.",
      });
    }

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program bulunamadı.",
      });
    }

    if (!program.programOutcomes || program.programOutcomes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Silinecek program çıktısı bulunamadı.",
      });
    }

    const initialLength = program.programOutcomes.length;
    program.programOutcomes = program.programOutcomes.filter(
      (po) => po.code !== code.trim()
    );

    if (program.programOutcomes.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `"${code}" kodlu program çıktısı bulunamadı.`,
      });
    }

    await program.save();

    return res.status(200).json({
      success: true,
      message: "Program çıktısı başarıyla silindi.",
      data: program.programOutcomes,
    });
  } catch (error) {
    console.error("Error deleting program outcome:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktısı silinirken bir hata oluştu.",
    });
  }
};

// Legacy endpoints (keep for backward compatibility)
export const createProgramOutcome = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Bu endpoint kullanımdan kaldırıldı. Lütfen /api/program-outcomes/:departmentId/add kullanın.",
  });
};

// Get all program outcomes from all departments (aggregated)
export const getProgramOutcomes = async (req, res) => {
  try {
    const departments = await Department.find();
    const allProgramOutcomes = [];
    const seenCodes = new Set();

    // Collect from all departments
    for (const department of departments) {
      // Get programs for this department
      const programs = await Program.find({ department: department._id });
      
      for (const program of programs) {
        if (program.programOutcomes && Array.isArray(program.programOutcomes)) {
          for (const po of program.programOutcomes) {
            if (!seenCodes.has(po.code)) {
              allProgramOutcomes.push(po);
              seenCodes.add(po.code);
            }
          }
        }
      }

      // Also include legacy department-level program outcomes
      if (department.programOutcomes && Array.isArray(department.programOutcomes)) {
        for (const po of department.programOutcomes) {
          if (!seenCodes.has(po.code)) {
            allProgramOutcomes.push(po);
            seenCodes.add(po.code);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: allProgramOutcomes,
      message: "Tüm bölümlerden program çıktıları getirildi. Belirli bir bölüm için /api/program-outcomes/:departmentId kullanabilirsiniz.",
    });
  } catch (error) {
    console.error("Error fetching all program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları getirilirken bir hata oluştu.",
    });
  }
};

export const getProgramOutcomeById = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Bu endpoint kullanımdan kaldırıldı.",
  });
};

export const updateProgramOutcome = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Bu endpoint kullanımdan kaldırıldı. Lütfen /api/program-outcomes/:departmentId/update kullanın.",
  });
};

