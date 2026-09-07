export type TrackerType = 'bill' | 'protest';

export interface Tracker {
  id: string;
  type: TrackerType;
  title: string;
  category: string;
  status: string;
  stage: string;
  summary: string;
  viewpoints?: {
    side: string;
    explanation: string;
  }[];
  lastUpdated: string;
  sources: {
    name: string;
    url: string;
  }[];
}

export interface TrackersResponse {
  items: Tracker[];
}