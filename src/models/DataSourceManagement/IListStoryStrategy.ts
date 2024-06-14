export interface IListStoryStrategy {
  name: string;
  listStoryMap: Map<string, (limiter?: number, page?: string) => any>;
  clone(): IListStoryStrategy;
  select(type: string, limiter?: number, page?: string): any;
  register(name: string, listFunction: () => any): any;
  home(): any;
  getBaseUrl(): string;
}
