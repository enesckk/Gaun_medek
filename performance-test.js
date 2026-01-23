#!/usr/bin/env node

/**
 * NTMYO Ölçme Değerlendirme Sistemi - Performans Test Scripti
 * Tüm API endpoint'lerini ve sistem bileşenlerini test eder
 */

const BASE_URL = 'http://localhost:5001/api'; // Backend port 5001'de çalışıyor
const FRONTEND_URL = 'http://localhost:3000';

// Test sonuçları
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  performance: {
    avgResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
  },
};

// Yardımcı fonksiyonlar
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
    reset: '\x1b[0m',
  };
  const icons = {
    info: 'ℹ',
    success: '✓',
    error: '✗',
    warning: '⚠',
  };
  console.log(`${colors[type]}${icons[type]} ${message}${colors.reset}`);
}

async function testEndpoint(name, method, path, body = null, expectedStatus = 200) {
  const startTime = Date.now();
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    // Performans metrikleri güncelle
    results.performance.avgResponseTime += responseTime;
    results.performance.maxResponseTime = Math.max(results.performance.maxResponseTime, responseTime);
    results.performance.minResponseTime = Math.min(results.performance.minResponseTime, responseTime);

    if (response.status === expectedStatus || (expectedStatus === 200 && response.ok)) {
      results.passed++;
      results.tests.push({
        name,
        status: 'passed',
        responseTime,
        statusCode: response.status,
      });
      log(`${name} - ${responseTime}ms`, 'success');
      return { success: true, data, responseTime };
    } else {
      results.failed++;
      results.tests.push({
        name,
        status: 'failed',
        responseTime,
        statusCode: response.status,
        error: data.message || 'Unknown error',
      });
      log(`${name} - FAILED (${response.status}): ${data.message || 'Unknown error'}`, 'error');
      return { success: false, data, responseTime };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    results.failed++;
    results.tests.push({
      name,
      status: 'error',
      responseTime,
      error: error.message,
    });
    log(`${name} - ERROR: ${error.message}`, 'error');
    return { success: false, error: error.message, responseTime };
  }
}

async function testFrontendPage(name, path) {
  const startTime = Date.now();
  try {
    const url = `${FRONTEND_URL}${path}`;
    const response = await fetch(url);
    const responseTime = Date.now() - startTime;
    const html = await response.text();

    if (response.ok && html.includes('NTMYO')) {
      results.passed++;
      results.tests.push({
        name,
        status: 'passed',
        responseTime,
        statusCode: response.status,
      });
      log(`${name} - ${responseTime}ms`, 'success');
      return { success: true, responseTime };
    } else {
      results.warnings++;
      results.tests.push({
        name,
        status: 'warning',
        responseTime,
        statusCode: response.status,
      });
      log(`${name} - WARNING (${response.status})`, 'warning');
      return { success: false, responseTime };
    }
  } catch (error) {
    results.warnings++;
    results.tests.push({
      name,
      status: 'error',
      error: error.message,
    });
    log(`${name} - ERROR: ${error.message}`, 'warning');
    return { success: false, error: error.message };
  }
}

// Ana test fonksiyonu
async function runTests() {
  console.log('\n🚀 NTMYO Ölçme Değerlendirme Sistemi - Performans Testi Başlatılıyor...\n');
  console.log('=' .repeat(70));

  // 1. Backend Health Check
  log('\n📡 Backend API Testleri', 'info');
  console.log('-'.repeat(70));
  
  await testEndpoint('Backend Health Check', 'GET', '/health');
  await testEndpoint('Get Departments', 'GET', '/departments');
  await testEndpoint('Get Programs', 'GET', '/programs');
  await testEndpoint('Get Courses', 'GET', '/courses');
  await testEndpoint('Get Exams', 'GET', '/exams');
  await testEndpoint('Get Students', 'GET', '/students');
  await testEndpoint('Get Learning Outcomes', 'GET', '/learning-outcomes');
  await testEndpoint('Get Program Outcomes', 'GET', '/program-outcomes');

  // 2. Frontend Sayfaları
  log('\n🌐 Frontend Sayfa Testleri', 'info');
  console.log('-'.repeat(70));
  
  await testFrontendPage('Ana Sayfa (Dashboard)', '/');
  await testFrontendPage('Dersler Sayfası', '/dashboard/courses');
  await testFrontendPage('Sınavlar Sayfası', '/exams');
  await testFrontendPage('Öğrenciler Sayfası', '/students');
  await testFrontendPage('Raporlar Sayfası', '/reports');
  await testFrontendPage('AI Upload Sayfası', '/ai');
  await testFrontendPage('Login Sayfası', '/login');

  // 3. Özel Endpoint Testleri
  log('\n🔧 Özel Endpoint Testleri', 'info');
  console.log('-'.repeat(70));
  
  // Settings endpoint'i
  await testEndpoint('Get Settings', 'GET', '/settings', null, 200);

  // 4. Performans Metrikleri
  log('\n⏱️  Performans Metrikleri', 'info');
  console.log('-'.repeat(70));
  
  const totalTests = results.passed + results.failed + results.warnings;
  if (totalTests > 0) {
    results.performance.avgResponseTime = Math.round(
      results.performance.avgResponseTime / totalTests
    );
  }

  // 5. Sonuç Raporu
  console.log('\n' + '='.repeat(70));
  log('\n📊 TEST SONUÇLARI', 'info');
  console.log('-'.repeat(70));
  log(`✓ Başarılı: ${results.passed}`, 'success');
  log(`✗ Başarısız: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
  log(`⚠ Uyarı: ${results.warnings}`, results.warnings > 0 ? 'warning' : 'info');
  log(`📈 Toplam Test: ${totalTests}`, 'info');
  
  console.log('\n⏱️  PERFORMANS METRİKLERİ');
  console.log('-'.repeat(70));
  log(`Ortalama Yanıt Süresi: ${results.performance.avgResponseTime}ms`, 'info');
  log(`En Hızlı Yanıt: ${results.performance.minResponseTime === Infinity ? 'N/A' : results.performance.minResponseTime + 'ms'}`, 'success');
  log(`En Yavaş Yanıt: ${results.performance.maxResponseTime}ms`, results.performance.maxResponseTime > 1000 ? 'warning' : 'info');

  // Performans Değerlendirmesi
  console.log('\n📋 PERFORMANS DEĞERLENDİRMESİ');
  console.log('-'.repeat(70));
  
  if (results.performance.avgResponseTime < 200) {
    log('Ortalama yanıt süresi: MÜKEMMEL (< 200ms)', 'success');
  } else if (results.performance.avgResponseTime < 500) {
    log('Ortalama yanıt süresi: İYİ (< 500ms)', 'success');
  } else if (results.performance.avgResponseTime < 1000) {
    log('Ortalama yanıt süresi: KABUL EDİLEBİLİR (< 1000ms)', 'warning');
  } else {
    log('Ortalama yanıt süresi: YAVAŞ (> 1000ms) - Optimizasyon gerekli!', 'error');
  }

  if (results.performance.maxResponseTime > 3000) {
    log('Bazı endpoint\'ler çok yavaş (> 3000ms) - Optimizasyon önerilir', 'warning');
  }

  // Başarı Oranı
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);
  console.log('\n📈 BAŞARI ORANI');
  console.log('-'.repeat(70));
  log(`Başarı Oranı: ${successRate}%`, successRate >= 90 ? 'success' : successRate >= 70 ? 'warning' : 'error');

  // Detaylı Test Sonuçları
  if (results.failed > 0 || results.warnings > 0) {
    console.log('\n🔍 DETAYLI TEST SONUÇLARI');
    console.log('-'.repeat(70));
    results.tests.forEach((test) => {
      if (test.status !== 'passed') {
        const statusColor = test.status === 'failed' ? 'error' : 'warning';
        log(`${test.name}: ${test.status} (${test.responseTime || 'N/A'}ms)`, statusColor);
        if (test.error) {
          console.log(`   → ${test.error}`);
        }
      }
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Performans testi tamamlandı!\n');

  // Exit code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Test başlat
runTests().catch((error) => {
  log(`Kritik Hata: ${error.message}`, 'error');
  process.exit(1);
});

