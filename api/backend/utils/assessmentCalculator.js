/**
 * MÜDEK Hesaplama Yardımcıları
 * Girdi: StudentExamResult listesi, Exam, Course
 * Çıktı: Soru → ÖÇ → PÇ performansları ve rapor
 */

// 1) Soru bazlı analiz: ortalama, başarı yüzdesi
export function calculateQuestionAnalysis(studentResults, exam) {
  const questionMap = new Map();
  const maxScore = Number(exam?.maxScorePerQuestion || 0);
  const totalQuestions = Number(exam?.questionCount || 0);

  // Başlat
  for (let i = 1; i <= totalQuestions; i++) {
    questionMap.set(i, {
      questionNumber: i,
      scores: [],
    });
  }

  // Skorları topla
  (studentResults || []).forEach((result) => {
    (result.questionScores || []).forEach((qs) => {
      if (!questionMap.has(qs.questionNumber)) return;
      questionMap.get(qs.questionNumber).scores.push({
        score: Number(qs.score || 0),
        learningOutcomeCode: qs.learningOutcomeCode || null,
      });
    });
  });

  // Hesapla
  const analysis = Array.from(questionMap.values()).map((item) => {
    const scores = item.scores.map((s) => s.score);
    const avg = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const success = maxScore > 0 ? (avg / maxScore) * 100 : 0;
    const loCode =
      item.scores.find((s) => s.learningOutcomeCode)?.learningOutcomeCode || null;

    return {
      questionNumber: item.questionNumber,
      maxScore,
      averageScore: Number(avg.toFixed(2)),
      successRate: Number(success.toFixed(2)),
      learningOutcomeCode: loCode,
      attempts: scores.length,
    };
  });

  return analysis;
}

// 2) ÖÇ performansı: soru analizini ÖÇ bazında grupla
export function calculateOutcomePerformance(questionAnalysis, exam, course) {
  const loDefs = course?.learningOutcomes || [];
  const loMap = new Map(
    loDefs.map((lo) => [
      lo.code,
      {
        code: lo.code,
        description: lo.description,
        programOutcomes: lo.programOutcomes || lo.relatedProgramOutcomes || [],
        questions: [],
      },
    ])
  );

  (questionAnalysis || []).forEach((qa) => {
    if (!qa.learningOutcomeCode || !loMap.has(qa.learningOutcomeCode)) return;
    loMap.get(qa.learningOutcomeCode).questions.push(qa);
  });

  return Array.from(loMap.values()).map((lo) => {
    const successAvg = lo.questions.length
      ? lo.questions.reduce((sum, q) => sum + q.successRate, 0) /
        lo.questions.length
      : 0;
    return {
      code: lo.code,
      description: lo.description,
      programOutcomes: lo.programOutcomes,
      questionCount: lo.questions.length,
      success: Number(successAvg.toFixed(2)),
    };
  });
}

// 3) PÇ performansı: ÖÇ sonuçlarından türet
export function calculateProgramOutcomePerformance(outcomePerformance, course) {
  const poMap = new Map();

  (outcomePerformance || []).forEach((lo) => {
    (lo.programOutcomes || lo.relatedProgramOutcomes || []).forEach((poCode) => {
      if (!poMap.has(poCode)) {
        poMap.set(poCode, {
          code: poCode,
          contributions: [],
        });
      }
      poMap.get(poCode).contributions.push(lo.success);
    });
  });

  return Array.from(poMap.values()).map((po) => {
    const avg =
      po.contributions.length === 0
        ? 0
        : po.contributions.reduce((a, b) => a + b, 0) / po.contributions.length;
    return {
      code: po.code,
      success: Number(avg.toFixed(2)),
      contributionCount: po.contributions.length,
    };
  });
}

// 4) Tam rapor
export function buildMudekReport(course, exam, studentResults) {
  const questionAnalysis = calculateQuestionAnalysis(studentResults, exam);
  const outcomePerformance = calculateOutcomePerformance(
    questionAnalysis,
    exam,
    course
  );
  const programOutcomePerformance = calculateProgramOutcomePerformance(
    outcomePerformance,
    course
  );

  // Basit özet öneri
  const weakestLO = [...outcomePerformance].sort((a, b) => a.success - b.success)[0];
  const recommendations = weakestLO
    ? `ÖÇ ${weakestLO.code} için başarı düşük görünüyor (%${weakestLO.success}). İçerik, örnek ve soru dağılımları gözden geçirilmeli.`
    : "Veri bulunamadı.";

  return {
    questionAnalysis,
    learningOutcomeAnalysis: outcomePerformance,
    programOutcomeAnalysis: programOutcomePerformance,
    summary: { recommendations },
  };
}


