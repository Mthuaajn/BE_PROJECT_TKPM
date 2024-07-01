import { ICategoryList } from '~/models/DataSourceManagement/ICategoryList';
import { Category } from '~/models/Interfaces/Category';
import cheerio from 'cheerio';

export default class AudioTruyenfullCategoryList implements ICategoryList {
  name: string;
  baseUrl: string;
  constructor(url: string) {
    this.name = 'AudioTruyenfullCategoryList';
    this.baseUrl = url;
  }
  clone(): ICategoryList {
    return new AudioTruyenfullCategoryList(this.baseUrl);
  }
  getBaseUrl(): string {
    return this.baseUrl;
  }
  public async categoryList(type?: string | undefined): Promise<any> {
    const searchString: string = `${this.getBaseUrl()}`;
    try {
      console.log('searchString: ', searchString);
      const response = await fetch(searchString, {
        method: 'GET'
      });

      if (response.ok) {
        const text = await response.text();
        const data: Category[] = [];

        const $ = cheerio.load(text);

        // const element =  $(
        //   '.wrapper .header-nav  div.container div.nav-right ul.control li.dropdown div.multi-column div.row'
        // )
        //   .first()
        //   .find(' div.col-md-4 ul.dropdown-menu li a');

        // if (element.length <= 0) {
        //   console.log('empty');
        //   return data;
        // }

        $(
          '.wrapper .header-nav  div.container div.nav-right ul.control li.dropdown div.multi-column div.row'
        )
          .first()
          .find(' div.col-md-4 ul.dropdown-menu li a')
          .each((index, element) => {
            const content = $(element).text().trim();
            const href = $(element).attr('href')?.split('/').pop() || '';

            data.push({
              content,
              href
            });
          });

        return data;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
