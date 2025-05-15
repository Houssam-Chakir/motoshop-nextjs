// Assuming cloudinary is configured
import cloudinary from "@/config/cloudinary";


/**
 * Deletes a list of images from Cloudinary based on their public IDs.
 *
 * @param publicIds - An array of public IDs representing the images to be deleted.
 *                    If the array is empty or not provided, the function logs a message and exits.
 * @returns A promise that resolves when all deletion attempts are completed.
 *
 * @remarks
 * - The function logs the progress and results of each deletion attempt.
 * - If an image is not found on Cloudinary, it is considered a successful deletion.
 * - Errors encountered during deletion are logged and included in the returned status.
 *
 * @example
 * const publicIds = ["image1", "image2", "image3"];
 * await deleteImagesFromCloudinary(publicIds);
 */
const deleteImages = async (publicIds: string[]): Promise<void> => {
  if (!publicIds || publicIds.length === 0) {
    console.log("No public_ids provided for deletion.");
    return;
  }

  console.log(`Attempting to delete ${publicIds.length} images from Cloudinary...`);

  const deletionPromises = publicIds.map(async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
      });
      if (result.result === "ok" || result.result === "not found") {
        // "not found" can be considered a success if the goal is to ensure it's gone
        console.log(`Successfully deleted or confirmed not found: ${publicId}`);
      } else {
        console.warn(`Failed to delete ${publicId}. Result:`, result.result);
      }
      return { publicId, status: result.result };
    } catch (error) {
      console.error(`Error deleting ${publicId}:`, error);
      return { publicId, status: "error", errorDetail: error };
    }
  });

  // Wait for all deletion attempts to complete
  await Promise.all(deletionPromises);
  console.log("Finished deletion attempts.");
};

export default deleteImages // Export if it's in a separate utility file
