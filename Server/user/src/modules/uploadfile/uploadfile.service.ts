import { Body, Inject, Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinaryType } from 'cloudinary';
import { Multer } from 'multer';


@Injectable()
export class UploadfileService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof cloudinaryType,
  ) {}


  async uploadImage(
    data: { file: Express.Multer.File; oldPublicId?: string },
  ): Promise<UploadApiResponse> {
    console.log('Uploading image...');

    const { file, oldPublicId } = data;
    
    return new Promise((resolve, reject) => {
      if (oldPublicId) {
        this.cloudinary.uploader.destroy(oldPublicId, (error, result) => {
          if (error) console.error('Lỗi khi xóa ảnh cũ:', error);
        });
      }

      this.cloudinary.uploader
        .upload_stream({ folder: 'avatars' }, (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  // async uploadImage(
  //   file: Express.Multer.File,
  //   oldPublicId?: string,
  // ): Promise<UploadApiResponse> {
  //   return new Promise((resolve, reject) => {
  //     if (oldPublicId) {
  //       this.cloudinary.uploader.destroy(oldPublicId, (error, result) => {
  //         if (error) console.error('Lỗi khi xóa ảnh cũ:', error);
  //       });
  //     }

  //     this.cloudinary.uploader
  //       .upload_stream({ folder: 'avatars' }, (error, result) => {
  //         if (error) return reject(error);
  //         if (!result) return reject(new Error('Upload failed'));
  //         resolve(result);
  //       })
  //       .end(file.buffer);
  //   });
  // }
}
