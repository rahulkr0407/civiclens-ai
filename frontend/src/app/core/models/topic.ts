export interface Topic {
  id: string;
  title: string;
  category: string;
  summary: string;
  readTime: string;

  whyItMatters: string;
  keyPoints: string[];
  viewpoints: {
    side: string;
    explanation: string;
  }[];
  currentSituation: string;
  sources: {
    name: string;
    url: string;
  }[];
}