import cloudinary from "@/config/cloudinary";

// Example with Promise.all and corrected data URI
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
      return result.secure_url;
    } catch (error) {
      console.error(`Error uploading ${imageFile.name}:`, error);
      return null; // Or some other error indicator
    }
  });

  const settledResults = await Promise.all(uploadPromises);
  return settledResults.filter((url) => url !== null);
};

export default imageUploader;
