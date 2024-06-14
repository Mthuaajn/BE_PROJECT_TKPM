import Epub = require('epub-gen');

const option = {
  title: "Alice's Adventures in Wonderland", // *Required, title of the book.
  author: 'Lewis Carroll', // *Required, name of the author.
  publisher: 'Macmillan & Co.', // optional
  content: [
    {
      title: 'About the author', // Optional
      author: 'John Doe', // Optional
      data:
        '<h2>Charles Lutwidge Dodgson</h2>' +
        '<div lang="en">Better known by the pen name Lewis Carroll...</div>' // pass html string
    },
    {
      title: 'Down the Rabbit Hole',
      data: '<p>Alice was beginning to get very tired...</p>'
    }
  ]
};

export const createEpub = async (path: string) => {
  const epub = await new Epub(option, path).promise;
  
//   epub.promise.then(() => {
//     epub.generate(, (err: Error) => {
//       if (err) {
//         console.error('Error generating EPUB:', err);
//       } else {
//         console.log('EPUB generated successfully!');
//       }
//     });
//   });
};
