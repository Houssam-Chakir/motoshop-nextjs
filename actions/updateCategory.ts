"use server";

import connectDB from "@/config/database";
import { isUserAuthorized } from "@/utils/isUserAuthorized";
import mongoose, { ClientSession } from "mongoose";
import Category from "@/models/Category";
import Type from "@/models/Type";
import svgUploadCloudinary from "@/utils/svgUploadCloudinary";
import svgDeleteCloudinary from "@/utils/svgDeleteCloudinary";
import { CategoryData } from "@/types/category";

async function UpdateCategory(categoryData: CategoryData) {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  let newIconUploadResult = null;

  try {
    await connectDB();
    const requiredRole = "admin";
    await isUserAuthorized(requiredRole);

    console.log("Server Action: updateCategory - Received values: ", categoryData);
    const { name, slug, section, icon, currentIcon, types } = categoryData;

    // -- Handle icon upload/update
    let iconData = currentIcon;

    if (icon instanceof File) {
      // * Upload new icon first
      newIconUploadResult = await svgUploadCloudinary(icon, name);
      if (!newIconUploadResult) {
        throw new Error("Failed to upload new icon");
      }
      iconData = newIconUploadResult;
    }

    // -- Separate existing and new types
    const existingTypes = types.filter(type => type._id);
    const newTypes = types.filter(type => !type._id);

    // -- Create new types
    const newTypeIds = [];
    if (newTypes.length > 0) {
      for (const type of newTypes) {
        // Create type with only necessary fields
        const newType = new Type({
          name: type.name,
          slug: type.slug,
          category: categoryData._id
        });

        if (!categoryData._id) {
          throw new Error("Category ID is required for creating new types");
        }

        const savedType = await newType.save({ session });
        newTypeIds.push(savedType._id);
      }
    }

    // -- Update category with all type IDs
    const allTypeIds = [
      ...existingTypes.map(type => type._id),
      ...newTypeIds
    ];

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryData._id,
      {
        name,
        slug,
        section,
        icon: iconData,
        applicableTypes: allTypeIds
      },
      { new: true, session }
    ).lean(); // Use lean() to get plain objects instead of Mongoose documents

    if (!updatedCategory) {
      throw new Error("Failed to update category");
    }

    // Convert to plain object and remove any circular references
    const plainCategory = JSON.parse(JSON.stringify(updatedCategory));

    // * Only delete old icon after successful transaction
    if (newIconUploadResult && currentIcon?.public_id) {
      await svgDeleteCloudinary(currentIcon.public_id);
    }

    await session.commitTransaction();
    return { success: true, category: plainCategory };

  } catch (error) {
    await session.abortTransaction();

    // Clean up new icon if transaction failed
    if (typeof newIconUploadResult !== "undefined" && newIconUploadResult?.public_id) {
      await svgDeleteCloudinary(newIconUploadResult.public_id);
    }

    console.error("Error updating category:", error);
    throw error;
  } finally {
    session.endSession();
  }
}

export default UpdateCategory;
