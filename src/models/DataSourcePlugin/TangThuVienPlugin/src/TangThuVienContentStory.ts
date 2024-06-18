/* eslint-disable @typescript-eslint/no-var-requires */
import Cheerio from 'cheerio';
import { IContentStory } from '~/models/DataSourceManagement/IContentStory';
import { ContentStory } from '~/models/Interfaces/ContentStory';
import { DetailStory } from '~/models/Interfaces/DetailStory';
import TangThuVienDetailStory from './TangThuVienDetailStory';
import { Story } from '~/models/Interfaces/Story';
import { ChangeDataSourceStory } from '~/models/Interfaces/ChangeDataSourceStory';
import { ListChapter } from '~/models/Interfaces/ListChapter';
import { PartialChapterPagination } from '~/models/Interfaces/PartialChapterPagination';
import { ChapterItem } from '~/models/Interfaces/ChapterItem';
const he = require('he');
export default class TangThuVienContentStory implements IContentStory {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'TangThuVienContentStory';
    this.baseUrl = url;
  }
  clone(): IContentStory {
    return new TangThuVienContentStory(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  private getContentStory = (html: string, chapter: string, title: string) => {
    const $ = Cheerio.load(html);
    const name = $('h1.truyen-title a').text().trim();
    const chapterTitle = $('.content .chapter h2').text().trim();
    const chap = chapter.toString() || '';
    // const title = $('.content .chapter h2').text().trim();
    const author = $('.chapter .text-center strong a').text().trim();
    const content = $('.box-chap').text().trim();
    const host = this.getBaseUrl();
    const cover = 'no information';
    const story = {
      name,
      chapterTitle,
      chap,
      title,
      author,
      content,
      cover,
      host
    };

    return story;
  };
  async contentStory(title: string, chap?: string | undefined) {
    // const storyDetail: DetailStory = await this.detailStory(title);
    const storyDetail: DetailStory = (await new TangThuVienDetailStory(
      this.getBaseUrl()
    ).detailStory(title)) as DetailStory;
    const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}/chuong-${chap}`;
    let result: ContentStory;
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getContentStory(html, chap as string, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return { ...result, cover: storyDetail.cover };
  }
  private async getListChapter(
    html: string,
    page: number,
    url: string
  ): Promise<PartialChapterPagination | null> {
    const $ = Cheerio.load(html);
    const storyId = $('#story_id_hidden').val();
    let pageNumber: number = page;
    pageNumber = pageNumber - 1;
    pageNumber = pageNumber >= 0 ? pageNumber : 0;

    const chapters: ChapterItem[] | null = [];
    const chapterPerPage: number = 50;
    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/page/${storyId}?page=${pageNumber}&limit=${chapterPerPage}&web=0`;
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });

      const html = await response.text();

      const $ = Cheerio.load(html);

      $('div.col-md-6 ul li').each((index, element) => {
        const href = $(element).find('a').attr('href');
        let content = $(element).find('a span.chapter-text').text();
        content = he.decode(content);

        if (content && content.length >= 0 && href != undefined && href.length >= 0) {
          chapters.push({ content, href });
        }
      });

      const ul = $('ul.pagination');
      const liCount = ul.find('li').length;
      let maxPage: number = 0;

      //console.log('liCount: ', liCount);

      if (liCount >= 2) {
        const lastLi = $('ul.pagination li:last-child');
        const onclickAttr: string | undefined = lastLi.find('a').attr('onclick');

        if (!onclickAttr) {
          const lastPageStr: string = lastLi.find('a').text();
          maxPage = lastPageStr ? parseInt(lastPageStr) - 1 : 0;
        } else {
          const checkedOnclickAttr: string = onclickAttr ? onclickAttr : '';
          const matchedNumber: string | null = checkedOnclickAttr.match(/\d+/)?.[0] || null;
          maxPage = matchedNumber ? parseInt(matchedNumber) : 0;
        }
      }
      maxPage += 1;

      const result: PartialChapterPagination = {
        chapters,
        maxPage,
        chapterPerPage
      };

      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async chapterList(title: string, page?: string | undefined) {
    if (!page) page = '1';
    const currentPage: number = Number.parseInt(page);

    try {
      const searchString: string = `${this.getBaseUrl()}/doc-truyen/${title}`;
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      const $ = Cheerio.load(html);

      const totalChapterText = $('#j-bookCatalogPage').text().trim();
      const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
      const maxChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;

      // console.log('maxChapter: ', maxChapter);
      const url = this.getBaseUrl();
      const data: PartialChapterPagination | null = (await this.getListChapter(
        html,
        currentPage,
        url as string
      )) as PartialChapterPagination;

      if (data == null) {
        return null;
      }
      const result: ListChapter = {
        title,
        host: this.getBaseUrl(),
        maxChapter: maxChapter,
        listChapter: data.chapters,
        currentPage: currentPage,
        maxPage: data.maxPage,
        chapterPerPage: data.chapterPerPage
      };
      //console.log('result: ', result);
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  private getStoryMostLikeTitle = (html: string, searchedTitle: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = Cheerio.load(html);

    const elements = $('#rank-view-list li');

    if (elements.length === 0) {
      return null;
    }
    //console.log(elements);

    $('#rank-view-list li').each((index, element) => {
      if (result.length === 1) return;
      const name = $(element).find('.book-mid-info h4 a').text().trim();
      const cover = $(element).find('.book-img-box img').attr('src') || '';
      const description = $(element).find('.intro').text().trim();
      const author = $(element).find('.author a.name').text().trim();
      // method eq(1) lấy element thứ 2 xuất hiện
      // const category = $(element).find('.author a').eq(1).text().trim();
      const categoryElement = $(element).find('.author a').eq(1);
      const category = {
        content: categoryElement.text().trim(),
        href: categoryElement.attr('href') || ''
      } as never;
      //const link = convertString(name);
      const link = $(element).find('.book-img-box a').first().attr('href') || '';
      const startIndex = link.lastIndexOf('/') + 1;
      const title = link.substring(startIndex);

      const lowerCaseName: string = name.toLowerCase();

      const lowerCaseTitle: string = searchedTitle.toLowerCase();
      let found: boolean =
        lowerCaseName.includes(lowerCaseTitle) || lowerCaseTitle.includes(lowerCaseName);

      if (name.length === 0) {
        found = false;
      }

      if (found) {
        const story: Story = {
          name,
          cover,
          description,
          author,
          categoryList: [].concat(category) as { content: string; href: string }[],
          link,
          title: title,
          host: 'https://truyen.tangthuvien.vn/',
          authorLink: 'no information',
          view: 'no information'
        };

        result.push(story);
      }
    });
    return result;
  };
  private async searchByTitle(title: string, page?: string): Promise<any> {
    if (!page) page = '1';
    const searchString: string = `${this.getBaseUrl()}/ket-qua-tim-kiem?term=${title}&page=${page}`;
    let result: Story[] | null = [];
    console.log('searchString: ', searchString);
    try {
      const response = await fetch(searchString, {
        method: 'GET',
        headers: {
          'User-Agent': 'PostmanRuntime/7.39.0'
        }
      });
      const html = await response.text();
      result = this.getStoryMostLikeTitle(html, title);
    } catch (err) {
      console.log(err);
      return null;
    }
    return result;
  }

  public async changeDetailStoryToThisDataSource(title: string) {
    try {
      const data: object[] | null = await this.searchByTitle(title);
      //console.log('data: ', data);
      if (data === null || data.length <= 0) {
        const result: object = {
          data: null,
          message: 'not found'
        };
        return result;
      } else {
        const result: object = {
          data: data ? data[0] : null,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async changeContentStoryToThisDataSource(title: string, chap?: string | undefined) {
    if (!chap) chap = '1';
    try {
      const story: ChangeDataSourceStory | null = (await this.changeDetailStoryToThisDataSource(
        title
      )) as ChangeDataSourceStory;

      const foundTitle: string | undefined =
        story && story.data && story.message === 'found' ? story.data.title : undefined;

      const checkedTitle: string = foundTitle ?? '';
      if (!checkedTitle || checkedTitle === '') {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      }

      const chapterPaginationData: ListChapter = (await this.chapterList(
        checkedTitle
      )) as ListChapter;
      const chapNumber: number = Number.parseInt(chap);
      if (chapNumber > chapterPaginationData.maxChapter) {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      }

      const detailChapter = await this.contentStory(checkedTitle, chap);

      if (detailChapter === null) {
        const result: object = {
          data: null,
          message: 'not found'
        };

        return result;
      } else {
        const result: object = {
          data: detailChapter,
          message: 'found'
        };
        return result;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
