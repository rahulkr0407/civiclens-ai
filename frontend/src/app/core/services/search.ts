import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchService {

  constructor() {}

  topics = [
  {
    id: '1',
    title: 'NEP 2020',
    category: 'Education',
    summary: 'National Education Policy explained simply.',
    readTime: '3 min',
  },
  {
    id: '2',
    title: 'GST',
    category: 'Tax',
    summary: 'Goods and Services Tax explained.',
    readTime: '2 min',
  },
  {
    id: '3',
    title: 'Farmers Protest',
    category: 'Agriculture',
    summary: 'Why farmers protested.',
    readTime: '5 min',
  },
];

getTopics() {
  return this.topics;
}

}