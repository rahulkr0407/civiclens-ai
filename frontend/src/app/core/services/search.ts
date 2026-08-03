import { Injectable } from '@angular/core';
import { Topic } from '../models/topic';

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  topics: Topic[] = [
    {
      id: '1',
      title: 'NEP 2020',
      category: 'Education',
      summary: 'National Education Policy explained simply.',
      readTime: '3 min',

      whyItMatters:
        'NEP 2020 changes how education is structured and focuses on flexibility, skills, and broader learning opportunities.',

      keyPoints: [
        'Introduces a 5+3+3+4 school education structure.',
        'Promotes learning in regional and Indian languages.',
        'Places greater focus on skills and practical learning.',
      ],

      viewpoints: [
        {
          side: 'Supporters',
          explanation:
            'Supporters believe the policy can make education more flexible, skill-oriented, and focused on overall development.',
        },
        {
          side: 'Concerns',
          explanation:
            'Critics have raised concerns about implementation, funding, infrastructure, and differences between states.',
        },
      ],

      currentSituation:
        'NEP 2020 is being implemented gradually, with different parts being introduced at different levels of education.',

      sources: [
        {
          name: 'Ministry of Education',
          url: 'https://www.education.gov.in/',
        },
      ],
    },

    {
      id: '2',
      title: 'GST',
      category: 'Tax',
      summary: 'Goods and Services Tax explained.',
      readTime: '2 min',

      whyItMatters:
        'GST affects the prices of many goods and services and replaced several indirect taxes with a unified tax system.',

      keyPoints: [
        'GST is an indirect tax on goods and services.',
        'It was introduced in India in 2017.',
        'GST has multiple tax slabs for different goods and services.',
      ],

      viewpoints: [
        {
          side: 'Supporters',
          explanation:
            'Supporters say GST simplified the indirect tax system and created a more unified national market.',
        },
        {
          side: 'Concerns',
          explanation:
            'Businesses and consumers have raised concerns about compliance requirements, tax slabs, and the complexity of some rules.',
        },
      ],

      currentSituation:
        'GST continues to be a major part of India’s indirect tax system, with rates and rules being reviewed periodically.',

      sources: [
        {
          name: 'GST Portal',
          url: 'https://www.gst.gov.in/',
        },
      ],
    },

    {
      id: '3',
      title: 'Farmers Protest',
      category: 'Agriculture',
      summary: 'Why farmers protested.',
      readTime: '5 min',

      whyItMatters:
        'Farmers’ protests can affect agricultural policy, food systems, markets, and the livelihoods of millions of people.',

      keyPoints: [
        'Farmers have raised concerns about agricultural policies and market conditions.',
        'Different farmer groups may have different demands.',
        'Government policies and farmer concerns have evolved over time.',
      ],

      viewpoints: [
        {
          side: 'Farmers’ concerns',
          explanation:
            'Farmer groups have raised concerns about income security, market access, and the impact of agricultural policies.',
        },
        {
          side: 'Government perspective',
          explanation:
            'The government has presented various policies and measures as efforts to reform agriculture and improve farmers’ opportunities.',
        },
      ],

      currentSituation:
        'Agricultural policy remains an important public issue, with discussions continuing between farmers, governments, and other stakeholders.',

      sources: [
        {
          name: 'Ministry of Agriculture & Farmers Welfare',
          url: 'https://agriwelfare.gov.in/',
        },
      ],
    },
  ];

  getTopics(): Topic[] {
    return this.topics;
  }

}