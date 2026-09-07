export interface ExplainRequest {
  topic_id: string;
  age: number;
  education_level: string;
  interests: string[];
  style?: string;
  language?: string;
}

export interface ExplainTrackerRequest {
  tracker_id: string;
  age: number;
  education_level: string;
  interests: string[];
  style?: string;
  language?: string;
}

export interface ExplainViewpoint {
  side: string;
  explanation: string;
}

export interface ExplainResponse {
  topicTitle: string;
  simpleExplanation: string;
  whyItMatters: string;
  keyPoints: string[];
  viewpoints: ExplainViewpoint[];
  questionsToThinkAbout: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  topic_id: string;
  messages: ChatMessage[];
  language?: string;
}

export interface ChatTrackerRequest {
  tracker_id: string;
  messages: ChatMessage[];
  language?: string;
}

export interface ChatResponse {
  reply: string;
}