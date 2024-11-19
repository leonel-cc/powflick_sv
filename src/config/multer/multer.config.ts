// // multer.config.ts
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { Options, FileFilterCallback, Multer } from 'multer';
// import * as multer from 'multer';

// export const multerConfig: Options = {
//   dest: './uploads',
//   fileFilter: (req: any, file: Express.Multer.File, callback: FileFilterCallback) => {
//     const ext = file.originalname.split('.').pop();
//     if (ext !== 'png') {
//       return callback(new HttpException('Solo se permiten archivos PNG', HttpStatus.BAD_REQUEST));
//     }
//     callback(null, true);
//   },
// };

// export const upload: Multer = multer(multerConfig); // Directorio donde se guardarán los archivos
