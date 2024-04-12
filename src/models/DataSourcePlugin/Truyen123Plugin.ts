import { IDataSourcePlugin } from "../DataSource/IDataSourcePlugin";
import cheerio from 'cheerio';

export default class Truyen123 implements IDataSourcePlugin {
    name: string;
    static baseUrl: string = 'https://123truyeni.com';
    public constructor(name: string) {
        this.name = name;
    }
    getBaseUrl(): string {
        return Truyen123.baseUrl;
    }
    clone(name: string): IDataSourcePlugin {
        return new Truyen123(name);
    }

    public async search(title: string, page?: string): Promise<any> {
        const searchString: string = `${this.getBaseUrl()}/search?q=${encodeURIComponent(title)}`
        if (!page) page = '1';
        try {
                console.log('searchString: ',searchString);
                let response = await fetch(searchString, {
                    method: "GET"
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
                    let data: { name: string; link: string | undefined; 
                                cover: string | undefined; description: string| undefined; 
                                host: string| undefined; author: string| undefined; 
                                view: string| undefined, categoryList: any[]| undefined
                            }[] = [];
                   
                    const $ = cheerio.load(text);
                    // htmlDoc.select(".list-new .row").forEach(e => {
                    //     data.push({
                    //         name: e.select(".col-title h3").first().text(),
                    //         link: e.select("a").first().attr("href"),
                    //         cover: e.select(".thumb img").first().attr("src").replace('-thumbw',''),
                    //         description: e.select(".chapter-text").first().text(),
                    //         host: this.getBaseUrl()
                    //     });
                    // });
                    $(".list-new .row").each((index, element) => {
                        const name = $(element).find(".col-title h3").first().text().trim();
                        const link = $(element).find("a").first().attr("href");
                        const cover = $(element).find(".thumb img").first()?.attr("src")?.replace('-thumbw', '');
                        const description = $(element).find(".chapter-text").first().text();
                        const author = $(element).find(".col-author a").contents().filter(function() {
                            return this.nodeType === 3;
                          }).text().trim();
                        const view =  $(element).find('.col-view.show-view').text().trim();
                        const categoryList = $(element).find('.col-category a').map((_, childElement) => {
                            const content = $(childElement).text().trim();
                            const href = $(childElement).attr('href');
                            return { content, href };
                          }).get();
                        data.push({
                          name,
                          link,
                          cover,
                          description,
                          host: this.getBaseUrl(),
                          author,
                        //   view: undefined,
                        //   categoryList: undefined,
                          view, 
                          categoryList,
                        });
                      });
                    //console.log(data)
                    return data;
                }
        } catch (error) {
            console.log(error);
            return null;
        }
            
    }
}