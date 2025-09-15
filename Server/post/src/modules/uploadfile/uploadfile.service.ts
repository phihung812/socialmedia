import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinaryType, UploadApiResponse } from 'cloudinary';
import { Multer } from 'multer';



@Injectable()
export class UploadfileService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof cloudinaryType,
  ) {}

  async uploadImage(data: {
    files: Express.Multer.File | Express.Multer.File[];
    oldPublicIds?: string | string[];
  }): Promise<UploadApiResponse[]> {
    const { files, oldPublicIds } = data;

    // Chuẩn hóa dữ liệu đầu vào
    const fileArray: Express.Multer.File[] = Array.isArray(files)
      ? files
      : [files];
    const oldPublicIdArray: string[] = oldPublicIds
      ? Array.isArray(oldPublicIds)
        ? oldPublicIds
        : [oldPublicIds]
      : [];

    // Kiểm tra có file để upload không
    if (!fileArray.length || !fileArray.some((file) => file && file.buffer)) {
      throw new Error('Không có file hợp lệ nào để upload');
    }

    // Xóa các ảnh cũ nếu có
    const deletePromises = oldPublicIdArray.map(
      (publicId) =>
        new Promise<void>((resolve) => {
          this.cloudinary.uploader.destroy(publicId, (error) => {
            if (error)
              console.error(`Lỗi khi xóa ảnh cũ (${publicId}):`, error);
            resolve(); // Luôn resolve để không làm gián đoạn luồng chính
          });
        }),
    );

    // Đợi tất cả ảnh cũ được xóa xong
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }

    // Upload các ảnh mới
    const uploadPromises = fileArray
      .filter((file) => file && file.buffer) // Lọc bỏ các file không hợp lệ
      .map(
        (file) =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            this.cloudinary.uploader
              .upload_stream(
                {
                  folder: 'posts',
                  resource_type: 'auto', // Tự động phát hiện loại file
                },
                (error, result) => {
                  if (error) return reject(error);
                  if (!result) return reject(new Error('Upload failed'));
                  resolve(result);
                },
              )
              .end(file.buffer);
          }),
      );

    try {
      // Đợi tất cả file được upload xong và trả về kết quả
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      // Xử lý lỗi khi upload
      console.error('Lỗi khi upload ảnh bài viết:', error);
      throw new Error(
        `Lỗi khi upload ảnh: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
