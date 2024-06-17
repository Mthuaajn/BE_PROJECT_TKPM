export interface IDetailStory {
  name: string;
  baseUrl: string;
  clone(): IDetailStory;

  getBaseUrl(): string;

  detailStory(title: string): any;
}
