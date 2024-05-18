import {
  Story,
  Category,
  DetailStory,
  ContentStory,
  ListChapter
} from './../models/interface/TangThuVien.interface';
import cheerio from 'cheerio';
class TangThuVienServices {
  getDetailStory = (html: string) => {
    const result: DetailStory[] = [];
    const $ = cheerio.load(html);
    const name = $('.book-info h1 ').text().trim();
    const cover = $('.book-img a img').attr('src') || '';
    const description = $('.book-info-detail .book-intro p').text().trim();
    const author = $('.tag a.blue').text().trim();
    // method eq(1) lấy element thứ 2 xuất hiện
    const category = $('.tag a.red').eq(0).text().trim();
    const status = $('.tag span.blue').eq(0).text().trim();
    const like = $('span.ULtwOOTH-like').text().trim();
    const follow = $('span.ULtwOOTH-follow').text().trim();
    const view = $('span.ULtwOOTH-view').text().trim();
    const poster = $('.book-info-detail .book-state li a.tags').text().trim();
    const update = $('.book-info-detail li.update .detail a.blue').text().trim();
    const totalChapterText = $('#j-bookCatalogPage').text().trim();
    const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    const totalChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const story: DetailStory = {
      name,
      cover,
      description,
      author,
      category,
      status,
      update,
      totalChapter,
      like,
      follow,
      view,
      poster
    };
    result.push(story);
    return result;
  };
  getStory = (html: string, limiter?: number) => {
    const result: Story[] = [];
    const $ = cheerio.load(html);
    $('#rank-view-list li').each((index, element) => {
      if (limiter && index >= limiter) return;
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
      const status = $(element).find('.author span').eq(0).text().trim();
      const update = $(element).find('.update span').text().trim();
      const totalChapter = parseInt($(element).find('.KIBoOgno').text().trim(), 10);

      const story: Story = {
        name,
        cover,
        description,
        author,
        categoryList: [].concat(category) as { content: string; href: string }[],
        status,
        update,
        totalChapter,
        link: 'no information',
        title: 'no information',
        host: 'https://truyen.tangthuvien.vn/',
        authorLink: 'no information',
        view: 'no information'
      };
      result.push(story);
    });
    return result;
  };
  getCategoryList = (html: string) => {
    const $ = cheerio.load(html);
    const result: Category[] = [];
    const length = $('#classify-list dd').length;
    $('#classify-list dd').each((index, element) => {
      if (index == length - 1) return;
      const link = $(element).find('a');
      if (link.length) {
        const content = link.find('span.info i').text().trim();
        const numberStory = link.find('span.info b').text().trim();
        const href = link.attr('href') || '';

        result.push({
          content,
          numberStory: numberStory === '' ? '...' : numberStory,
          href
        });
      }
    });
    return result;
  };
  getContentStory = (html: string, chapter: string) => {
    const $ = cheerio.load(html);
    const name = $('h1.truyen-title a').text().trim();
    const chapterTitle = $('.content .chapter h2').text().trim();
    const chap = chapter.toString() || '';
    const title = $('.content .chapter h2').text().trim();
    const author = $('.chapter .text-center strong a').text().trim();
    const datePost = $('.chapter .text-center').eq(1).text().trim();
    const content = $('.box-chap').text().trim();
    const story = {
      name,
      chapterTitle,
      chap,
      title,
      author,
      datePost,
      content
    };

    return story;
  };
  getListChapterStory = (html: string, chapter: string, url: string) => {
    const $ = cheerio.load(html);
    const totalChapterText = $('#j-bookCatalogPage').text().trim();
    const totalChapterMatch = totalChapterText.match(/\((\d+) chương\)/);
    const maxChapter = totalChapterMatch ? parseInt(totalChapterMatch[1], 10) : 0;
    const title = $('.book-info h1').text().trim();
    const host = url;

    const listChapter: Array<{ content: string; href: string }> = [];
    $('.volume-wrap #max-volume .cf li ').each((index, element) => {
      const content = $(element).find('a').attr('title')?.toString() || '';
      const href = $(element).find('a').attr('href') || '';
      listChapter.push({
        content,
        href
      });
    });

    const result: ListChapter = {
      title,
      host,
      maxChapter,
      listChapter
    };
    return result;
  };
  getNewestStoryAtCategory = (html: string, limiter?: number) => {
    const result = this.getStory(html, limiter);
    return result;
  };
}

const tangThuVienServices = new TangThuVienServices();
export default tangThuVienServices;
