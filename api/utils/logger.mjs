export const logInteraction = (question, answer) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Q: ${question}\nA: ${answer}\n`);
};
