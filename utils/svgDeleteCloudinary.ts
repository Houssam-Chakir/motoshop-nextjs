// Assuming cloudinary is configured
import cloudinary from "@/config/cloudinary"; // Ensure this path is correct

/**
 * Deletes a single SVG icon from Cloudinary based on its public ID.
 * Assumes the SVG was uploaded as a "raw" resource.
 *
 * @param publicId - The public ID of the SVG icon to be deleted.
 * If the publicId is empty or not provided, the function logs an error and exits.
 * @returns A promise that resolves to a boolean indicating whether the deletion was successful
 * (or the file was not found, which is also considered a success in this context).
 * Returns `false` if an error occurs or the deletion fails for other reasons.
 *
 * @remarks
 * - The function logs the progress and result of the deletion attempt.
 * - If the SVG is not found on Cloudinary, it is considered a successful deletion.
 * - Errors encountered during deletion are logged.
 * - It's crucial that the publicId includes the full path if it was stored with folders,
 * e.g., "motoshop/icons/my_icon_name".
 *
 * @example
 * const svgPublicId = "motoshop/icons/accessories_icon_xyz123";
 * const wasDeleted = await svgDeleteCloudinary(svgPublicId);
 * if (wasDeleted) {
 * console.log(`SVG ${svgPublicId} was successfully deleted or was not found.`);
 * } else {
 * console.log(`Failed to delete SVG ${svgPublicId}.`);
 * }
 */
const svgDeleteCloudinary = async (publicId: string): Promise<boolean> => {
  if (!publicId || publicId.trim() === "") {
    console.error("No public_id provided for SVG deletion.");
    return false;
  }

  console.log(`Attempting to delete SVG icon: ${publicId} from Cloudinary...`);

  try {
    // For raw files (like SVGs uploaded this way), specify resource_type: "raw"
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });

    // Check Cloudinary's result status
    // "ok" means successfully deleted.
    // "not found" means the file wasn't there, which for a delete operation is often acceptable.
    if (result.result === "ok") {
      console.log(`Successfully deleted SVG: ${publicId}`);
      return true;
    } else if (result.result === "not found") {
      console.log(
        `SVG not found (considered successful deletion): ${publicId}`
      );
      return true;
    } else {
      // Log any other result from Cloudinary that isn't "ok" or "not found"
      console.warn(
        `Failed to delete SVG ${publicId}. Cloudinary result: ${result.result}`
      );
      return false;
    }
  } catch (error) {
    // Log any error that occurs during the API call
    console.error(`Error deleting SVG ${publicId}:`, error);
    return false;
  }
};

export default svgDeleteCloudinary; // Export if it's in a separate utility file

// Example Usage:
//
// async function handleDeleteIcon(iconId: string) {
//   if (!iconId) {
//     console.log("No icon ID to delete.");
//     return;
//   }
//   console.log(`Requesting deletion for icon: ${iconId}`);
//   const success = await svgDeleteCloudinary(iconId);
//   if (success) {
//     console.log(`Deletion process completed for ${iconId}. Icon should be gone.`);
//     // Update your UI or database state here
//   } else {
//     console.log(`Deletion process failed for ${iconId}.`);
//     // Handle error in UI if necessary
//   }
// }
//
// // To use it:
// // handleDeleteIcon("motoshop/icons/my_uploaded_icon_name_randomsuffix");
