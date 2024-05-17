"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Truyen123Plugin = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
class Truyen123Plugin {
    name;
    static baseUrl = 'https://123truyeni.com';
    constructor(name) {
        this.name = name;
    }
    getBaseUrl() {
        return Truyen123Plugin.baseUrl;
    }
    clone(name) {
        return new Truyen123Plugin(name);
    }
    async search(title, page) {
        if (!page)
            page = '1';
        const searchString = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}&page=${page}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                // let doc = response.html();
                // let data = [];
                // doc.select(".list-new .row").forEach(e => {
                //     data.push({
                //         name: e.select(".col-title h3").first().text(),
                //         link: e.select("a").first().attr("href"),
                //         cover: e.select(".thumb img").first().attr("src").replace('-thumbw',''),
                //         description: e.select(".chapter-text").first().text(),
                //         host: this.getBaseUrl()
                //     });
                // });
                //console.log(response)
                // return Response.success(data);
                const text = await response.text();
                const data = [];
                const $ = cheerio_1.default.load(text);
                // htmlDoc.select(".list-new .row").forEach(e => {
                //     data.push({
                //         name: e.select(".col-title h3").first().text(),
                //         link: e.select("a").first().attr("href"),
                //         cover: e.select(".thumb img").first().attr("src").replace('-thumbw',''),
                //         description: e.select(".chapter-text").first().text(),
                //         host: this.getBaseUrl()
                //     });
                // });
                $('.list-new .row').each((index, element) => {
                    const name = $(element).find('.col-title h3').first().text().trim();
                    const link = $(element).find('a').first().attr('href');
                    const url = new URL(link ?? '');
                    const title = url.pathname.substr(1);
                    const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
                    const description = $(element).find('.chapter-text').first().text();
                    const author = $(element)
                        .find('.col-author a')
                        .contents()
                        .filter(function () {
                        return this.nodeType === 3;
                    })
                        .text()
                        .trim();
                    const view = $(element).find('.col-view.show-view').text().trim();
                    const categoryList = $(element)
                        .find('.col-category a')
                        .map((_, childElement) => {
                        const content = $(childElement).text().trim();
                        const href = $(childElement).attr('href');
                        return { content, href };
                    })
                        .get();
                    data.push({
                        name,
                        link,
                        title,
                        cover,
                        description,
                        host: this.getBaseUrl(),
                        author,
                        //   view: undefined,
                        //   categoryList: undefined,
                        view,
                        categoryList
                    });
                });
                //console.log(data)
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async detailStory(title) {
        const searchString = `${this.getBaseUrl()}/${title}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                const text = await response.text();
                const $ = cheerio_1.default.load(text);
                const name = $('.wrapper').find('h1.title').first().text();
                const cover = $('.wrapper').find('.book img').first().attr('src');
                const author = $('.wrapper').find('.info').find('[itemprop="author"]').text();
                const authorUrl = new URL($('.wrapper').find('.info').find('[itemprop="author"]').attr('href') ?? '');
                const authorLink = authorUrl.pathname.split('/').pop();
                const categoryList = $('.wrapper')
                    .find('.info')
                    .find('a[itemprop="genre"]')
                    .map((_, childElement) => {
                    const content = $(childElement).text().trim();
                    const href = $(childElement).attr('href');
                    return { content, href };
                })
                    .get();
                // const author = (
                //   $('.wrapper').find('.container .info > div > div ').get(0) as unknown as HTMLElement
                // )?.textContent?.toString();
                const description = $('.wrapper').find('.desc-text').text().trim(); //.find('br').text();
                const detail = $('.wrapper').find('.info .label').text();
                const host = this.getBaseUrl();
                const link = searchString;
                const data = {
                    name,
                    title,
                    link,
                    cover,
                    author,
                    authorLink,
                    description,
                    detail,
                    host,
                    categoryList
                };
                //console.log(data)
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async contentStory(title, chap) {
        const searchString = `${this.getBaseUrl()}/${title}/chuong-${chap}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                const text = await response.text();
                const $ = cheerio_1.default.load(text);
                const name = $('.wrapper').find('a.truyen-title').text();
                const host = this.getBaseUrl();
                const chapterTitle = $('.wrapper').find('div.chapter-title').text().trim();
                $('.wrapper').find('.chapter-content div').remove();
                let content = $('.wrapper').find('div.chapter-content').html() ?? '';
                content = content.replace(/<!-- (.*?) -->/gm, '');
                content = content.replace(/<p(.*?)>(.*?)<?p>/g, '');
                content = content.replace(/\n/g, '<br>');
                content = content.replaceAll('<br>', ' ');
                content = content.trim();
                const data = {
                    name,
                    title,
                    chapterTitle,
                    chap,
                    host,
                    content
                };
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async newestStory(limiter, page) {
        if (!page)
            page = '1';
        if (!limiter)
            limiter = Number.MAX_VALUE;
        const searchString = `${this.getBaseUrl()}/danh-sach/truyen-moi?page=${page}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                const text = await response.text();
                const data = [];
                const $ = cheerio_1.default.load(text);
                $('.list-new .row').each((index, element) => {
                    if (index >= limiter) {
                        return;
                    }
                    const name = $(element).find('.col-title h3').first().text().trim();
                    const link = $(element).find('a').first().attr('href');
                    const url = new URL(link ?? '');
                    const title = url.pathname.substr(1);
                    const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
                    const description = $(element).find('.chapter-text').first().text();
                    const author = $(element)
                        .find('.col-author a')
                        .contents()
                        .filter(function () {
                        return this.nodeType === 3;
                    })
                        .text()
                        .trim();
                    const view = $(element).find('.col-view.show-view').text().trim();
                    const categoryList = $(element)
                        .find('.col-category a')
                        .map((_, childElement) => {
                        const content = $(childElement).text().trim();
                        const href = $(childElement).attr('href');
                        return { content, href };
                    })
                        .get();
                    data.push({
                        name,
                        link,
                        title,
                        cover,
                        description,
                        host: this.getBaseUrl(),
                        author,
                        //   view: undefined,
                        //   categoryList: undefined,
                        view,
                        categoryList
                    });
                });
                //console.log(data)
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async fullStory(limiter, page) {
        if (!page)
            page = '1';
        if (!limiter)
            limiter = Number.MAX_VALUE;
        const searchString = `${this.getBaseUrl()}/danh-sach/truyen-full?page=${page}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                const text = await response.text();
                const data = [];
                const $ = cheerio_1.default.load(text);
                $('.list-new .row').each((index, element) => {
                    if (index >= limiter) {
                        return;
                    }
                    const name = $(element).find('.col-title h3').first().text().trim();
                    const link = $(element).find('a').first().attr('href');
                    const url = new URL(link ?? '');
                    const title = url.pathname.substr(1);
                    const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
                    const description = $(element).find('.chapter-text').first().text();
                    const author = $(element)
                        .find('.col-author a')
                        .contents()
                        .filter(function () {
                        return this.nodeType === 3;
                    })
                        .text()
                        .trim();
                    const view = $(element).find('.col-view.show-view').text().trim();
                    const categoryList = $(element)
                        .find('.col-category a')
                        .map((_, childElement) => {
                        const content = $(childElement).text().trim();
                        const href = $(childElement).attr('href');
                        return { content, href };
                    })
                        .get();
                    data.push({
                        name,
                        link,
                        title,
                        cover,
                        description,
                        host: this.getBaseUrl(),
                        author,
                        //   view: undefined,
                        //   categoryList: undefined,
                        view,
                        categoryList
                    });
                });
                //console.log(data)
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async hotStory(limiter, page) {
        if (!page)
            page = '1';
        if (!limiter)
            limiter = Number.MAX_VALUE;
        const searchString = `${this.getBaseUrl()}/danh-sach/truyen-hot?page=${page}`;
        try {
            console.log('searchString: ', searchString);
            const response = await fetch(searchString, {
                method: 'GET'
            });
            if (response.ok) {
                const text = await response.text();
                const data = [];
                const $ = cheerio_1.default.load(text);
                $('.list-new .row').each((index, element) => {
                    if (index >= limiter) {
                        return;
                    }
                    const name = $(element).find('.col-title h3').first().text().trim();
                    const link = $(element).find('a').first().attr('href');
                    const url = new URL(link ?? '');
                    const title = url.pathname.substr(1);
                    const cover = $(element).find('.thumb img').first()?.attr('src')?.replace('-thumbw', '');
                    const description = $(element).find('.chapter-text').first().text();
                    const author = $(element)
                        .find('.col-author a')
                        .contents()
                        .filter(function () {
                        return this.nodeType === 3;
                    })
                        .text()
                        .trim();
                    const view = $(element).find('.col-view.show-view').text().trim();
                    const categoryList = $(element)
                        .find('.col-category a')
                        .map((_, childElement) => {
                        const content = $(childElement).text().trim();
                        const href = $(childElement).attr('href');
                        return { content, href };
                    })
                        .get();
                    data.push({
                        name,
                        link,
                        title,
                        cover,
                        description,
                        host: this.getBaseUrl(),
                        author,
                        //   view: undefined,
                        //   categoryList: undefined,
                        view,
                        categoryList
                    });
                });
                //console.log(data)
                return data;
            }
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
    async home() {
        try {
            const hot = await this.hotStory(10, '1');
            const full = await this.fullStory(10, '1');
            const newest = await this.newestStory(10, '1');
            const data = {
                hot,
                newest,
                full
            };
            return data;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
}
exports.Truyen123Plugin = Truyen123Plugin;
module.exports = {
    plugin: Truyen123Plugin
};
