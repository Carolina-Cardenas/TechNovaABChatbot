import { ChatPromptTemplate } from "@langchain/core/prompts";

export const standaloneQuestionTemplate = ChatPromptTemplate.fromTemplate(`
Givet en konversationshistorik och en uppföljningsfråga, 
omformulera uppföljningsfrågan till en fristående fråga på svenska.

Konversationshistorik: {conv_history}
Uppföljningsfråga: {question}
Fristående fråga:
`);

export const customerServicePrompt = ChatPromptTemplate.fromTemplate(`
Du är en vänlig och hjälpsam kundtjänstrepresentant för TechNova AB.

Du ska svara endast baserat på dokumenten nedan.
Om frågan inte finns i kontexten, säg:
"Jag är ledsen, men jag kan tyvärr inte svara på den frågan."

KONTEKST:
{context}

FRÅGA: {question}

SVAR (på svenska, vänligt och informativt):
`);
