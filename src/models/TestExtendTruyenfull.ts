import { convertToUnicodeAndCreateURL } from '~/utils/StringUtility';
import { Category } from './Interfaces/Category';
import { Story } from './Interfaces/Story';
import { StoryTruyenfull } from './Interfaces/StoryTruyenfull';
const baseUrl: string = 'https://api.truyenfull.vn';
export const mostSearchStory = async (limiter?: number, page?: string): Promise<any> => {
  if (!page) page = '1';
  if (!limiter) limiter = Number.MAX_VALUE;
  const searchString: string = `${baseUrl}/v1/story/all?type=story_full_search&page=${page}`;
  try {
    console.log('searchString: ', searchString);
    const response = await fetch(searchString, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PostmanRuntime/7.26.8'
      }
    });
    if (response.ok) {
      const json = await response.json();
      const dataArr: StoryTruyenfull[] = json.data;
      let data: Story[] | null = [];
      data = getListStory(dataArr, limiter);

      return data;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

function getListStory(dataArr: StoryTruyenfull[], limiter?: number): Story[] | null {
  const data: Story[] | null = [];
  dataArr.forEach((element: StoryTruyenfull) => {
    if (limiter && data.length >= limiter) {
      return;
    }
    const name = element?.title;
    const link = convertToUnicodeAndCreateURL(element.title);
    const title = element?.id.toString();

    const cover = element.image;
    const description = 'no information';
    const host = baseUrl;
    const author = element.author;
    const authorLink = convertToUnicodeAndCreateURL(element.author);
    const view = 'no information';
    const categoryList = processCategoryList(element.categories, element.category_ids);

    data.push({
      name,
      link,
      title,
      cover,
      description,
      host,
      author,
      authorLink,
      view,
      categoryList
    });
  });

  return data;
}
function processCategoryList(category: string, category_ids: string): Category[] {
  const categories = category.split(','); // Split categories by comma
  const categoryIds = category_ids.split(','); // Split category_ids by comma

  const result: Category[] = [];

  for (let i = 0; i < categories.length; i++) {
    const content: string = categories[i].trim(); // Remove whitespace around category
    const href: string = categoryIds[i].trim(); // Convert category_id to number

    result.push({ content, href });
  }

  return result;
}
