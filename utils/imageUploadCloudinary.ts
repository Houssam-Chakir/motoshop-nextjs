import cloudinary from "@/config/cloudinary";

/**
 * Uploads an array of image files to Cloudinary and returns their secure URLs and public IDs.
 *
 * @param images - An array of `File` objects representing the images to be uploaded.
 *
 * @returns A promise that resolves to an array of objects containing the `secure_url` and `public_id`
 *          of successfully uploaded images. Images that fail to upload are excluded from the result.
 *
 * @remarks
 * - Each image is converted to a Base64 data URI before being uploaded.
 * - Images are uploaded to the "motoshop" folder in Cloudinary.
 * - If an image fails to upload, an error is logged to the console, and the image is excluded from the result.
 *
 * @example
 * const files: File[] = [file1, file2];
 * const uploadedImages = await imageUploader(files);
 * console.log(uploadedImages);
 * Output: [{ secure_url: "https://...", public_id: "..." }, ...]
 */
const imageUploader = async (images: File[]) => {
  const uploadPromises = images.map(async (imageFile) => {
    try {
      const imageBuffer = await imageFile.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString("base64");

      const dataUri = `data:${imageFile.type};base64,${imageBase64}`;

      const result = await cloudinary.uploader.upload(
        dataUri,
        {
          folder: "motoshop",
        }
      );
      return {secure_url :result.secure_url, public_id: result.public_id,};
    } catch (error) {
      console.error(`Error uploading ${imageFile.name}:`, error);
      return null; // Or some other error indicator
    }
  });

  const settledResults = await Promise.all(uploadPromises);
  return settledResults.filter((url) => url !== null);
};

export default imageUploader;
