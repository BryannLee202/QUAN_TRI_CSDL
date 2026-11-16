/**
 * MushroomCloud - Native BDD Cucumber Runner
 * Parse and execute Gherkin .feature specifications against Step Definitions
 * Inspired by cucumber/cucumber-js
 * Phụ trách: LeMinhTai (Chủ dự án) <leminhtai2222005@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const { stepDefinitions } = require('../features/step_definitions/mushroom_steps.js');

function parseFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let currentFeature = { title: '', scenarios: [] };
  let currentScenario = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('Tính năng:') || line.startsWith('Feature:')) {
      currentFeature.title = line.replace(/^(Tính năng:|Feature:)/, '').trim();
    } else if (line.startsWith('Kịch bản:') || line.startsWith('Scenario:')) {
      currentScenario = {
        title: line.replace(/^(Kịch bản:|Scenario:)/, '').trim(),
        steps: [],
      };
      currentFeature.scenarios.push(currentScenario);
    } else if (currentScenario && /^(Cho|Khi|Thì|Và|Given|When|Then|And|But)\s+/i.test(line)) {
      const match = line.match(/^(\S+)\s+(.*)$/);
      if (match) {
        currentScenario.steps.push({ keyword: match[1], text: match[2].trim() });
      }
    }
  }

  return currentFeature;
}

async function runBddCucumberSuite() {
  console.log('========================================================================================');
  console.log('🥒 [BDD GHERKIN] CUCUMBER LIVING DOCUMENTATION TEST SUITE');
  console.log('   Mục tiêu: Nghiệm thu kịch bản nghiệp vụ bằng ngôn ngữ tự nhiên (Plain Language)');
  console.log('   Chuẩn đối sánh: cucumber/cucumber-js & Gherkin v27');
  console.log('========================================================================================\n');

  const featuresDir = path.resolve(__dirname, '../features');
  if (!fs.existsSync(featuresDir)) {
    console.error('❌ Thư mục features không tồn tại!');
    return { passed: false };
  }

  const featureFiles = fs.readdirSync(featuresDir).filter((f) => f.endsWith('.feature'));
  console.log(`[*] Phát hiện ${featureFiles.length} tệp đặc tả tính năng Gherkin (.feature):\n`);

  let totalFeatures = featureFiles.length;
  let totalScenarios = 0;
  let passedScenarios = 0;
  let totalSteps = 0;
  let passedSteps = 0;

  const suiteStartTime = Date.now();

  for (const file of featureFiles) {
    const fullPath = path.join(featuresDir, file);
    const feature = parseFeatureFile(fullPath);

    console.log(`📌 Tính năng: ${feature.title} (${file})`);

    for (const scenario of feature.scenarios) {
      totalScenarios++;
      console.log(`   📝 Kịch bản: ${scenario.title}`);
      const context = {};
      let scenarioPassed = true;

      for (const step of scenario.steps) {
        totalSteps++;
        let matched = null;
        let args = [];

        for (const def of stepDefinitions) {
          const m = step.text.match(def.pattern);
          if (m) {
            matched = def;
            args = m.slice(1);
            break;
          }
        }

        if (!matched) {
          console.log(`      ❓ [UNDEFINED] ${step.keyword} ${step.text}`);
          scenarioPassed = false;
          continue;
        }

        const stepStart = Date.now();
        try {
          await matched.action(context, ...args);
          const duration = Date.now() - stepStart;
          passedSteps++;
          console.log(`      ✅ ${step.keyword.padEnd(4)} ${step.text} (${duration}ms)`);
        } catch (err) {
          scenarioPassed = false;
          console.log(`      ❌ ${step.keyword.padEnd(4)} ${step.text}`);
          console.log(`         -> Lỗi: ${err.message}`);
        }
      }

      if (scenarioPassed) {
        passedScenarios++;
      }
      console.log('');
    }
  }

  const durationSec = ((Date.now() - suiteStartTime) / 1000).toFixed(2);
  const allPassed = passedScenarios === totalScenarios && totalScenarios > 0;

  console.log('----------------------------------------------------------------------------------------');
  console.log(`📊 BÁO CÁO BDD LIVING DOCUMENTATION:`);
  console.log(`   - Tính năng (Features):   ${totalFeatures} / ${totalFeatures} hoàn tất`);
  console.log(`   - Kịch bản (Scenarios):   ${passedScenarios} / ${totalScenarios} passed (${((passedScenarios / totalScenarios) * 100).toFixed(1)}%)`);
  console.log(`   - Bước kiểm thử (Steps):  ${passedSteps} / ${totalSteps} passed (${((passedSteps / totalSteps) * 100).toFixed(1)}%)`);
  console.log(`   - Thời gian thực thi:     ${durationSec} giây`);

  if (allPassed) {
    console.log('✅ [PASSED 100%] Toàn bộ kịch bản nghiệp vụ Gherkin đạt chuẩn nghiệm thu Living Documentation.');
  } else {
    console.log('❌ [FAILED] Có kịch bản kiểm thử không đạt yêu cầu.');
  }
  console.log('========================================================================================\n');

  return { passed: allPassed, totalFeatures, totalScenarios, passedScenarios, totalSteps, passedSteps };
}

if (require.main === module) {
  runBddCucumberSuite();
}

module.exports = { runBddCucumberSuite };
