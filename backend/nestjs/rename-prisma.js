import fs from 'node:fs';

const path = './prisma/schema.prisma';
let schema = fs.readFileSync(path, 'utf8');

// Mapping: nama tabel → nama model (singular + PascalCase)
const modelMap = {
  'users': 'User',
  'chapters': 'Chapter',
  'modules': 'Module',
  'quizzes': 'Quiz',
  'quiz_questions': 'QuizQuestion',
  'quiz_attempts': 'QuizAttempt',
  'user_question_answered': 'UserQuestionAnswered',
  'monthly_quizzes': 'MonthlyQuiz',
  'monthly_quiz_questions': 'MonthlyQuizQuestion',
  'monthly_quiz_attempts': 'MonthlyQuizAttempt',
  'flashcards': 'Flashcard',
  'badges': 'Badge',
  'user_badges': 'UserBadge',
  'user_module_progress': 'UserModuleProgress',
  'user_flashcard_views': 'UserFlashcardView',
  'leaderboard_prizes': 'LeaderboardPrize',
  'leaderboard_winners': 'LeaderboardWinner',
  'leaderboard_config': 'LeaderboardConfig',
  'user_popup_seen': 'UserPopupSeen',
  'password_resets': 'PasswordReset',
  'reports': 'Report',
  'report_access': 'ReportAccess',
  'report_views': 'ReportView',
};

// Step 1: Ganti nama model: `model users {` → `model User {`
for (const [table, model] of Object.entries(modelMap)) {
  const regexModel = new RegExp(`^model\\s+${table}\\s*\\{`, 'gm');
  schema = schema.replace(regexModel, `model ${model} {`);
}

// Step 2: Tambah @@map di akhir setiap model
for (const [table, model] of Object.entries(modelMap)) {
  const regexBlock = new RegExp(`(model\\s+${model}\\s*\\{[\\s\\S]*?)(\\n\\})`, 'g');
  schema = schema.replace(regexBlock, (match, body, closing) => {
    if (body.includes('@@map')) return match;
    return `${body}\n\n  @@map("${table}")${closing}`;
  });
}

// Step 3: Ganti referensi tipe relasi: `users` → `User`, dll
for (const [table, model] of Object.entries(modelMap)) {
  const regexType = new RegExp(`\\b${table}\\b(\\s+@relation|\\[\\]|\\?)`, 'g');
  schema = schema.replace(regexType, (match, suffix) => `${model}${suffix}`);
}

fs.writeFileSync(path, schema, 'utf8');
console.log('✅ Schema updated!');
console.log('   Models renamed:', Object.keys(modelMap).length);