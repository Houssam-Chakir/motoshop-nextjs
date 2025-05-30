"use server";

import connectDB from "@/config/database";
import mongoose, { ClientSession } from "mongoose";

import { revalidatePath } from "next/cache";
import imageUploader from "@/utils/imageUploadCloudinary";
import { isUserAuthorized } from "@/utils/isUserAuthorized";
import deleteImagesCloudinary from "@/utils/imageDeleteCloudinary"; // Renamed for clarity
import { images as ImageDataType } from "@/components/forms/ProductEditForm"; // Type for image objects
import Stock from "@/models/Stock";
import Product from "@/models/Product";

// Interface for 'stockItems' coming from the form
interface FormStockItem {
  size: string;
  quantity: string; // Form typically sends numbers as strings
}

// Interface for values received by the action
interface ProductValues {
  productId: string;
  stockId?: string | null; // The original stockId associated with the product being edited
  brand: mongoose.Types.ObjectId;
  productModel: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  style: "None"| "Versitile"| "Racing"| "Adventure"| "Enduro"| "Urban"| "Touring";
  wholesalePrice: number;
  retailPrice: number;
  stockItems: FormStockItem[];
  description: string;
  specifications?: { name: string; description: string }[]; // Assuming array for multiple specifications
  images: ImageDataType[]; // Images currently on the product (from form state)
  imagesToUpload: File[];
  imagesToDelete: ImageDataType[];
}

// Interface for the data structure used to update the Product model (excluding stock linkage initially)
interface ProductObjectToSave {
  brand: mongoose.Types.ObjectId;
  productModel: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  style: "None"| "Versitile"| "Racing"| "Adventure"| "Enduro"| "Urban"| "Touring";
  wholesalePrice: number;
  retailPrice: number;
  description: string;
  specifications?: { name: string; description: string }[];
  images: ImageDataType[];
  // 'stock' field will be handled separately
  // Mongoose timestamps will handle 'updatedAt'. 'createdAt' should not be set here.
}

export default async function updateProduct(values: ProductValues): Promise<{ status: boolean; slug?: string; error?: string }> {
  let uploadedImagesData: { public_id: string; secure_url: string }[] = [];
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const requiredRole = "admin";
    await isUserAuthorized(requiredRole); // Throws an error if not authorized

    console.log("Server Action: updateProduct - Received values: ", {
      ...values,
      imagesToUpload: `${values.imagesToUpload?.length || 0} files to upload`,
      imagesToDelete: `${values.imagesToDelete?.length || 0} images to delete`,
      stockItemsCount: values.stockItems?.length || 0,
    });

    const {
      productId,
      stockId: inputStockId, // The stock ID from the form, might be outdated or null
      stockItems: formStockItems,
      identifiers,
      brand,
      productModel,
      title,
      category,
      type,
      season,
      style,
      wholesalePrice,
      retailPrice,
      description,
      specifications,
      images: currentImagesOnForm,
      imagesToDelete,
      imagesToUpload,
    } = values;

    // --- 1. Prepare Product Data (excluding stock link initially) ---
    const productUpdateData: ProductObjectToSave = {
      brand,
      productModel,
      identifiers,
      title,
      category,
      type,
      season,
      style,
      wholesalePrice,
      retailPrice,
      description,
      specifications,
      images: [...currentImagesOnForm], // Start with images passed from form (already reflecting user's choices for existing images)
    };

    // --- 2. Handle New Image Uploads ---
    if (imagesToUpload && imagesToUpload.length > 0) {
      console.log(`Uploading ${imagesToUpload.length} new image(s) to Cloudinary...`);
      const newCloudinaryImages = await imageUploader(imagesToUpload);
      // Add new images to the product's image list
      productUpdateData.images.push(...newCloudinaryImages);
      // Track for potential rollback on error
      uploadedImagesData = newCloudinaryImages;
      console.log("New images uploaded successfully.");
    }

    // --- 3. Handle Cloudinary Image Deletions ---
    // Images marked for deletion, they are referenced in imagesToDelete
    if (imagesToDelete && imagesToDelete.length > 0) {
      const imagesToDeletePublicIds = imagesToDelete.map((img) => img.public_id);
      console.log(`Deleting ${imagesToDeletePublicIds.length} image(s) from Cloudinary:`, imagesToDeletePublicIds);
      try {
        await deleteImagesCloudinary(imagesToDeletePublicIds);
        console.log("Image deletion from Cloudinary completed for marked images.");
      } catch (deleteError) {
        console.error("An error occurred during Cloudinary image deletion for marked images. Transaction will continue.", deleteError);
        // Decide if this is a critical failure. For now, we log and proceed.
      }
    }

    // --- 4. Update Product Document (First Pass - Main Details) ---
    const initiallyUpdatedProduct = await Product.findByIdAndUpdate(productId, { $set: productUpdateData }, { new: true, runValidators: true, session });

    if (!initiallyUpdatedProduct) {
      throw new Error(`Product with ID '${productId}' not found or failed to update initially.`);
    }
    console.log("Server Action: Product main details updated. ID:", initiallyUpdatedProduct._id);

    // --- 5. Prepare Stock Items (Parse quantities) ---
    const parsedStockItems = formStockItems.map((item) => ({
      size: item.size,
      // Make sure quantity is a number
      quantity: parseInt(item.quantity, 10) || 0,
    }));

    // --- 6. Handle Stock Document (Update or Create) ---
    let finalStockId: mongoose.Types.ObjectId | undefined = undefined;

    if (inputStockId) {
      console.log(`Form provided stockId: '${inputStockId}'. Attempting to find and update.`);
      const existingStockDoc = await Stock.findById(inputStockId).session(session);

      if (existingStockDoc) {
        console.log(`Found existing stock document (ID: '${inputStockId}'). Updating its items.`);
        const updatedStock = await Stock.findByIdAndUpdate(
          inputStockId,
          { $set: { sizes: parsedStockItems, productId: initiallyUpdatedProduct._id } }, // Ensure productId is linked
          { new: true, runValidators: true, session }
        );
        if (!updatedStock) {
          // This is unlikely if findById just found it, but could be due to concurrent modification or validation hook failure.
          console.error(`Failed to update existing stock (ID: '${inputStockId}'), despite it being found. Will proceed to create a new stock as a fallback.`);
          // finalStockId remains undefined, leading to new stock creation.
        } else {
          finalStockId = updatedStock._id;
          console.log("Existing stock updated successfully:", finalStockId);
        }
      } else {
        // This is the test scenario: inputStockId was provided (e.g., from an old product link), but its document is gone.
        console.log(`Input stockId '${inputStockId}' provided, but no corresponding stock document found. A new stock will be created.`);
        // finalStockId remains undefined, leading to new stock creation.
      }
    } else {
      // No stockId provided by the form.
      // This could mean it's a new product (not this action's concern) or the product didn't have stock.
      // For an update action, if product *had* a stock previously, we should try to update it.
      // However, `initiallyUpdatedProduct.stock` holds the stockId *before* this update sequence.
      // The logic below handles creating new if no other path sets finalStockId.
      console.log("No stockId provided by the form. Will create a new stock if product isn't linked to a valid one or if a new one is needed.");
      if (initiallyUpdatedProduct.stock) {
        console.log(`Product was previously linked to stock '${initiallyUpdatedProduct.stock}'. Verifying if it exists to update, otherwise creating new.`);
        const productsCurrentStockDoc = await Stock.findById(initiallyUpdatedProduct.stock).session(session);
        if (productsCurrentStockDoc) {
          console.log(`Product's existing stock '${initiallyUpdatedProduct.stock}' found. Updating it.`);
          const updatedCurrentStock = await Stock.findByIdAndUpdate(
            initiallyUpdatedProduct.stock,
            { $set: { sizes: parsedStockItems, productId: initiallyUpdatedProduct._id } },
            { new: true, runValidators: true, session }
          );
          if (!updatedCurrentStock) {
            console.error(`Failed to update product's current stock (ID: ${initiallyUpdatedProduct.stock}) despite finding it. Will create a new one.`);
          } else {
            finalStockId = updatedCurrentStock._id;
            console.log("Product's current stock updated successfully:", finalStockId);
          }
        } else {
          console.log(`Product was linked to stock '${initiallyUpdatedProduct.stock}', but it's no longer found. A new stock will be created.`);
        }
      }
    }

    // If no existing stock was successfully updated or determined to be the target, create a new one.
    if (!finalStockId) {
      console.log("Creating a new stock document.");
      const stockDataForDB = {
        // Ensure this matches your Stock schema requirements
        productId: initiallyUpdatedProduct._id,
        sizes: parsedStockItems,
      };
      const newStock = new Stock(stockDataForDB);
      await newStock.save({ session });
      finalStockId = newStock._id;
      console.log("Server Action: New stock document saved. ID:", finalStockId);
    }

    // --- 7. Link Product to the Definitive Stock ID (if changed or not set) ---
    let productFinalState = initiallyUpdatedProduct; // Start with the product state after image/detail updates

    if (initiallyUpdatedProduct.stock?.toString() !== finalStockId?.toString()) {
      console.log(`Updating product's stock reference. Old: '${initiallyUpdatedProduct.stock}', New: '${finalStockId}'.`);
      const productLinkedToStock = await Product.findByIdAndUpdate(
        initiallyUpdatedProduct._id, // Use ID from the already updated product
        { $set: { stock: finalStockId } }, // Link to the determined stockId
        { new: true, runValidators: true, session }
      );
      if (!productLinkedToStock) {
        // This is a critical internal error. If a new stock was created, it needs rollback.
        if (finalStockId && (!inputStockId || !(await Stock.findById(inputStockId).session(session)))) {
          // i.e. if the finalStockId is for a newly created stock
          console.error(`Failed to link product to stock. CRITICAL. Rolling back creation of new stock ID: ${finalStockId}`);
          await Stock.findByIdAndDelete(finalStockId, { session }); // Use findByIdAndDelete
        }
        throw new Error("CRITICAL: Failed to link product to the new/updated stock after stock operations.");
      }
      productFinalState = productLinkedToStock; // This is the most up-to-date product state
      console.log("Product successfully linked/re-linked to stock ID:", productFinalState.stock);
    } else {
      console.log(`Product's stock link ('${productFinalState.stock}') is already correct or no stock change was needed.`);
    }

    // --- 8. Commit Transaction ---
    await session.commitTransaction();
    console.log("Server Action: Transaction committed successfully.");

    // --- 9. Revalidate Cache ---
    revalidatePath("/", "layout"); // Broad revalidation
    if (productFinalState.slug) {
      revalidatePath(`/products/${productFinalState.slug}`); // Specific product page
    }
    revalidatePath("/dashboard/inventory"); // Inventory page

    return { status: true, slug: productFinalState.slug };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Server Action: Error during product/stock update processing:", error.message);
    } else {
      console.error("Server Action: Unknown error during product/stock update processing:", error);
    }
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("Server Action: Transaction aborted due to error.");
    }

    // Rollback newly uploaded images from Cloudinary if any were part of this failed transaction
    if (uploadedImagesData.length > 0) {
      console.log("Rolling back: Attempting to delete newly uploaded images from Cloudinary...");
      const imagesPublicIdsToRollback = uploadedImagesData.map((image) => image.public_id);
      try {
        await deleteImagesCloudinary(imagesPublicIdsToRollback);
        console.log("Cloudinary image rollback successful for newly uploaded images.");
      } catch (deleteError) {
        console.error("An error occurred during the Cloudinary image deletion rollback:", deleteError);
      }
    }

    console.error("Server Action: Error during product/stock update processing:", error);
    return {
      status: false,
      error: error instanceof Error ? error.message : "An unknown error occurred during product update.",
    };
  } finally {
    if (session && session.inTransaction()) {
      // Ensure session is active before trying to end
      await session.abortTransaction(); // Abort if not committed due to an unhandled error in finally
      console.log("Server Action: Transaction aborted in finally block.");
    }
    session.endSession();
    console.log("Server Action: Mongoose session ended.");
  }
}
