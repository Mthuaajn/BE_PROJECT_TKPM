import {
  Story,
  DetailStory,
  ContentStory,
  ListChapter
} from './../interface/TangThuVien.interface';
import { IDataSourcePlugin } from '../DataSource/IDataSourcePlugin';
import cheerio from 'cheerio';
import { Category } from '../interface/TangThuVien.interface';
import fs from 'fs';
import tangThuVienServices from '~/services/TangThuVien.services';
export class TangThuVienPlugin implements IDataSourcePlugin {
  name: string;
  static baseUrl: string = 'https://truyen.tangthuvien.vn/';
  public constructor(name: string) {
    this.name = name;
  }

  getBaseUrl(): string {
    return TangThuVienPlugin.baseUrl;
  }
  clone(name: string): IDataSourcePlugin {
    return new TangThuVienPlugin(name);
  }
  private getNumberValueFromString(input: string): any {}
  public async getMaxChapterPage(title: string): Promise<any> {}
  public async search(title: string, page?: string, category?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/ket-qua-tim-kiem?term=${title}&page=${page}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getStory(html);
      if (category) {
        result = result.filter((story) => story.category === category);
      }
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  async newestStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&page=${page}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  async fullStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=nm&page=${page}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  async hotStory(limiter?: number, page?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=vw&page=${page}`;
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getStory(html, limiter as number);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  async categoryList(): Promise<any> {
    let result: Category[] = [];
    try {
      const searchString: string = `${this.getBaseUrl()}`;
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getCategoryList(html);
    } catch (err) {
      console.log(err);
    }

    return result;
  }
  async home(): Promise<any> {
    try {
      const hot = await this.hotStory(12, '1');
      const full = await this.fullStory(12, '1');
      const newest = await this.newestStory(12, '1');

      const data: object = {
        hot,
        newest,
        full
      };
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  public async contentStory(title: string, chap?: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}/chuong-${chap}`;
    let result: ContentStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getContentStory(html, chap as string);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  public async chapterList(title: string, page?: string): Promise<any> {
    let result: ListChapter;
    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      const url = this.getBaseUrl();
      result = tangThuVienServices.getListChapterStory(html, page as string, url as string);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  public async detailStory(title: string): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
    let result: DetailStory[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getDetailStory(html);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }
  private async getCtg(category: string): Promise<number> {
    const listCategory = await this.categoryList();
    let ctg: number = 0;
    listCategory.forEach((element: any, index: number) => {
      if (element.content === category) {
        ctg = index + 1;
        return;
      }
    });
    return ctg;
  }
  private async getStoryWithSearchString(searchString: string): Promise<any> {
    let result: Story[] = [];
    try {
      const response = await fetch(searchString, {
        method: 'GET'
      });
      const html = await response.text();
      result = tangThuVienServices.getStory(html);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }

  public async newestStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?ord=new&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }

  public async fullStoryAtCategory(
    category: string,
    limiter?: number,
    page?: string
  ): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=nm&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }

  public async hotStoryAtCategory(category: string, limiter?: number, page?: string): Promise<any> {
    const ctg: string = (await this.getCtg(category)).toString();
    const searchString: string = `${this.getBaseUrl()}/tong-hop?rank=vw&ctg=${ctg}&page=${page}`;
    const result: any = await this.getStoryWithSearchString(searchString);
    return result;
  }
}
module.exports = {
  plugin: TangThuVienPlugin
};
