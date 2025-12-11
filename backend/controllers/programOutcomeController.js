import Department from "../models/Department.js";

// Get all program outcomes for a department
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

    return res.status(200).json({
      success: true,
      data: department.programOutcomes || [],
    });
  } catch (error) {
    console.error("Error fetching program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları getirilirken bir hata oluştu.",
    });
  }
};

// Add a program outcome to a department
export const addProgramOutcome = async (req, res) => {
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

// Update program outcomes for a department (replace entire array)
export const updateProgramOutcomes = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { programOutcomes } = req.body;

    if (!Array.isArray(programOutcomes)) {
      return res.status(400).json({
        success: false,
        message: "programOutcomes bir array olmalıdır.",
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı.",
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
    department.programOutcomes = programOutcomes.map((po) => ({
      code: po.code.trim(),
      description: po.description.trim(),
    }));

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Program çıktıları başarıyla güncellendi.",
      data: department.programOutcomes,
    });
  } catch (error) {
    console.error("Error updating program outcomes:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Program çıktıları güncellenirken bir hata oluştu.",
    });
  }
};

// Delete a specific program outcome from a department
export const deleteProgramOutcome = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "PÇ kodu gereklidir.",
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Bölüm bulunamadı.",
      });
    }

    if (!department.programOutcomes || department.programOutcomes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Silinecek program çıktısı bulunamadı.",
      });
    }

    const initialLength = department.programOutcomes.length;
    department.programOutcomes = department.programOutcomes.filter(
      (po) => po.code !== code.trim()
    );

    if (department.programOutcomes.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: `"${code}" kodlu program çıktısı bulunamadı.`,
      });
    }

    await department.save();

    return res.status(200).json({
      success: true,
      message: "Program çıktısı başarıyla silindi.",
      data: department.programOutcomes,
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

export const getProgramOutcomes = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Bu endpoint kullanımdan kaldırıldı. Lütfen /api/program-outcomes/:departmentId kullanın.",
  });
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

