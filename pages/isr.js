import Page from '../Page';
import { getRandomAPI } from '../publicApis';
const fs = require('fs');
const path = require('path');

export default Page;

export async function getStaticProps(context) {
    // const props = await getRandomAPI();
      const currentFilePath = __filename;
      const currentFile = currentFilePath.split("/").at(-1);
      const currentFolder = currentFilePath.split(currentFile)[0]
      const filenames = fs.readdirSync(currentFolder);

    // Fungsi untuk mengecek ukuran file
    const checkFileSize = (filePath) => {
        const stats = fs.statSync(filePath);
        return stats.size;
    };

    // Membuat objek untuk menyimpan ukuran file
    const fileSizes = {};
    filenames.forEach((filename) => {
        const filePath = path.join(currentFolder, filename);
        // Memeriksa apakah file adalah file .html atau .js, dan tidak bernama [slug].js
        if (filename.includes(currentFile)) {
            fileSizes[filename] = checkFileSize(filePath);
        }
    });

    console.log('File sizes:', fileSizes);

    return { props: {}, revalidate: 30 };
}
