import cloudinary from "@/config/cloudinary"; // Assuming this path is correct

/**
 * Uploads a single SVG file to Cloudinary as a raw file and returns its secure URL and public ID.
 * All icons will be stored in the "motoshop/icons" folder.
 *
 * @param svgFile - A `File` object representing the SVG to be uploaded.
 * @param fileNamePrefix - An optional prefix for the filename (e.g., category name) to help
 * differentiate files within the "icons" folder. The final public_id
 * will be `motoshop/icons/{fileNamePrefix_randomString}` or
 * `motoshop/icons/{originalFileName_randomString}` if no prefix.
 *
 * @returns A promise that resolves to an object containing the `secure_url` and `public_id`
 * of the successfully uploaded SVG. Returns `null` if the upload fails.
 *
 * @remarks
 * - The SVG file is converted to a Base64 data URI before being uploaded.
 * - SVGs are uploaded to the "motoshop/icons" folder in Cloudinary.
 * - The SVG is uploaded as a "raw" resource type to preserve its original SVG format.
 * - If the SVG fails to upload, an error is logged to the console.
 *
 * @example
 * const file: File = svgFile; // assume svgFile is a File object
 * const uploadedSvg = await svgUploadCloudinary(file, "accessories_icon");
 * if (uploadedSvg) {
 * console.log(uploadedSvg);
 * // Output: { secure_url: "https://res.cloudinary.com/.../raw/upload/...", public_id: "motoshop/icons/accessories_icon_xxxx" }
 * }
 */
const svgUploadCloudinary = async (svgFile: File, fileNamePrefix?: string) => {
  // Validate if the file is an SVG
  if (svgFile.type !== "image/svg+xml") {
    console.error(
      "Error: File is not an SVG. Expected 'image/svg+xml', got:",
      svgFile.type,
      "for file:",
      svgFile.name
    );
    return null;
  }

  try {
    // 1. Read the file as an ArrayBuffer
    const imageBuffer = await svgFile.arrayBuffer();

    // 2. Convert the ArrayBuffer to a Base64 string
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // 3. Construct the Data URI
    const dataUri = `data:image/svg+xml;base64,${imageBase64}`;

    // 4. Define the Cloudinary folder
    const targetFolder = "motoshop/icons";

    // 5. Construct a public_id for better organization if a prefix is provided.
    // Cloudinary will generate a unique ID if public_id is not set,
    // but providing one can make it more readable.
    // We append a short random string to ensure uniqueness if multiple files have the same prefix.
    let desiredPublicId;
    const originalFileNameWithoutExtension = svgFile.name.substring(0, svgFile.name.lastIndexOf('.')) || svgFile.name;
    const randomSuffix = Math.random().toString(36).substring(2, 8); // Short random string

    if (fileNamePrefix && fileNamePrefix.trim() !== "") {
      const sanitizedPrefix = fileNamePrefix
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9-_]/g, "");
      if (sanitizedPrefix) {
        desiredPublicId = `${sanitizedPrefix}_${randomSuffix}`;
      } else { // Fallback if prefix becomes empty after sanitization
        desiredPublicId = `${originalFileNameWithoutExtension}_${randomSuffix}`;
      }
    } else {
      desiredPublicId = `${originalFileNameWithoutExtension}_${randomSuffix}`;
    }


    // 6. Upload to Cloudinary as a raw file
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: targetFolder, // All icons go into "motoshop/icons"
      public_id: desiredPublicId, // Set the public_id to control the filename
      resource_type: "raw", // Upload as a raw file to preserve SVG
      format: "svg", // Explicitly set format, good practice with raw
      overwrite: false, // Prevent overwriting if a file with the same public_id exists (Cloudinary adds random chars if true and no public_id)
                         // With explicit public_id, setting to false is safer, or true if you intend to overwrite.
                         // If public_id is unique due to randomSuffix, overwrite: true is also fine.
    });

    // 7. Return the secure URL and public ID
    return {
      secure_url: result.secure_url,
      public_id: result.public_id, // This will be "motoshop/icons/desiredPublicId"
    };
  } catch (error) {
    console.error(`Error uploading SVG ${svgFile.name}:`, error);
    return null; // Indicates an upload failure
  }
};

export default svgUploadCloudinary;
