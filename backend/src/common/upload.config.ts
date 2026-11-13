import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

/**
 * Простая функция для настройки загрузки файлов (картинок) через Multer.
 * Создаёт папку, если её ещё нет, и даёт файлу уникальное имя.
 *
 * @param folderName - папка внутри ./uploads (например: 'covers', 'avatars', 'polls')
 * @param filePrefix - префикс для имени файла (например: 'cover', 'avatar', 'poll')
 */
export function createUploadConfig(folderName: string, filePrefix: string) {
  return {
    storage: diskStorage({
      // Куда сохранять файл
      destination: (_req, _file, callback) => {
        const uploadPath = `./uploads/${folderName}`;

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        callback(null, uploadPath);
      },

      // Как назвать файл (например: cover-1710000000-123456.jpg)
      filename: (_req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        callback(null, `${filePrefix}-${uniqueSuffix}${extension}`);
      },
    }),
  };
}
