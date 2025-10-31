export const logInteraction = (question, answer) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${question}`);
  console.log(`[${timestamp}]${answer.substring(0, 100)}...`);
};
