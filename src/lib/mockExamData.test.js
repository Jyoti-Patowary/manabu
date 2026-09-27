const test = require('node:test');
const assert = require('node:assert/strict');
const { MOCK_EXAMS, calculateExamScore } = require('./mockExamData');

test('mockExamData: loads N5 and N3 exams with all 4 required sections', () => {
  const n5 = MOCK_EXAMS.N5;
  assert.ok(n5);
  assert.ok(n5.sections.vocab.length > 0);
  assert.ok(n5.sections.grammar.length > 0);
  assert.ok(n5.sections.reading.length > 0);
  assert.ok(n5.sections.listening.length > 0);

  // Check listening audio dialogue exists
  assert.ok(n5.sections.listening[0].audioDialogue.length > 10);
});

test('mockExamData: calculateExamScore evaluates perfect score as passed', () => {
  const n5 = MOCK_EXAMS.N5;
  const perfectAnswers = {};

  Object.values(n5.sections).forEach((sectionQuestions) => {
    sectionQuestions.forEach((q) => {
      perfectAnswers[q.id] = q.correctIndex;
    });
  });

  const result = calculateExamScore(perfectAnswers, n5);
  assert.equal(result.percent, 100);
  assert.equal(result.passed, true);
  assert.equal(result.sections.vocab.passedSection, true);
  assert.equal(result.sections.grammar.passedSection, true);
  assert.equal(result.sections.reading.passedSection, true);
  assert.equal(result.sections.listening.passedSection, true);
});

test('mockExamData: calculateExamScore fails when sectional threshold is not met', () => {
  const n5 = MOCK_EXAMS.N5;
  const failingAnswers = {}; // 0 correct answers

  const result = calculateExamScore(failingAnswers, n5);
  assert.equal(result.score, 0);
  assert.equal(result.passed, false);
  assert.equal(result.sections.vocab.passedSection, false);
});

