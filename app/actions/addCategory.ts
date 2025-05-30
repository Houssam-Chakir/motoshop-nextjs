"use server";

import { SubmissionData } from "@/components/forms/CategoryAddForm";
import connectDB from "@/config/database";
import Category from "@/models/Category";
import Type from "@/models/Type";
import { isUserAuthorized } from "@/utils/isUserAuthorized";
import svgDeleteCloudinary from "@/utils/svgDeleteCloudinary";
import svgUploadCloudinary from "@/utils/svgUploadCloudinary";
import mongoose, { ClientSession, Types as MongooseTypes } from "mongoose";

// --- Interface for Cloudinary Icon Data ---
interface IconData {
  public_id: string;
  secure_url: string;
}

// --- Interface for the data structure of the Category model in MongoDB ---
interface CategoryModelData {
  name: string;
  slug: string;
  section: string;
  icon: IconData;
  applicableTypes: MongooseTypes.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface TypeData {
  name: string;
  slug: string;
  category: MongooseTypes.ObjectId;
}

export default async function addNewCategory(values: SubmissionData) {
  console.log("addNewCategory - Received values: ", values);
  let uploadedIcon: IconData | null = null;
  const { name, slug, icon, types, section } = values;

  let session: ClientSession | null = null;
  const uploadedTypes: MongooseTypes.ObjectId[] = [];

  try {
    await connectDB();
    session = await mongoose.startSession();
    session.startTransaction();
    console.log("MongoDB transaction started.");

    const requiredRole = "admin";
    await isUserAuthorized(requiredRole);
    console.log("User authorization successful.");

    console.log("Attempting to upload icon to Cloudinary...");
    // svgUploadCloudinary is expected to return an object matching IconData or null
    const cloudinaryResult = await svgUploadCloudinary(icon, name);
    if (cloudinaryResult && cloudinaryResult.public_id && cloudinaryResult.secure_url) {
      uploadedIcon = cloudinaryResult;
      console.log("Icon uploaded successfully:", uploadedIcon);
    } else {
      throw new Error("Failed to upload category icon to Cloudinary or invalid response.");
    }

    // -- Prepare data for the Category model, matching CategoryModelData
    const categoryToSave: CategoryModelData = {
      name,
      slug,
      section,
      icon: uploadedIcon,
      applicableTypes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const sessionOptions = { session };

    const newCategory = new Category(categoryToSave);
    await newCategory.save(sessionOptions);
    console.log("New category saved successfully. ID:", newCategory._id);

    if (types && types.length > 0) {
      console.log(`Creating ${types.length} new type(s) in DB...`);
      const typeCreationPromises = types.map(async (type) => {
        const typeData: TypeData = {
          name: type.name,
          slug: type.slug,
          category: newCategory._id as MongooseTypes.ObjectId,
        };
        const newType = new Type(typeData);
        await newType.save(sessionOptions);
        console.log(`Type '${type.name}' saved successfully. ID: ${newType._id}`);
        uploadedTypes.push(newType._id as MongooseTypes.ObjectId);
        return newType;
      });
      await Promise.all(typeCreationPromises);
      console.log("All types saved successfully. Collected Type IDs:", uploadedTypes);
    } else {
      console.log("No types provided to create.");
    }

    if (uploadedTypes.length > 0) {
      console.log(`Updating category ${newCategory._id} with applicableTypes:`, uploadedTypes);
      const updatedCategory = await Category.findByIdAndUpdate(
        newCategory._id,
        { $set: { applicableTypes: uploadedTypes } },
        { new: true, session: session }
      );

      if (!updatedCategory) {
        console.error(
          `Server Action: Failed to find and update category ${newCategory._id} with applicableTypes.`
        );
        if (uploadedTypes.length > 0) {
          console.warn(
            `Attempting to rollback (delete) ${uploadedTypes.length} created types due to category update failure.`
          );
          await Type.deleteMany(
            { _id: { $in: uploadedTypes } },
            sessionOptions
          );
          console.warn(
            "Successfully rolled back (deleted) created types."
          );
        }
        throw new Error(
          `Failed to update category with applicable types. Associated types have been rolled back.`
        );
      }
      console.log(
        `Category ${newCategory._id} successfully updated with applicableTypes.`
      );
    }

    await session.commitTransaction();
    console.log("MongoDB transaction committed successfully.");

  } catch (error) {
    console.error("Error in addNewCategory server action:", error);

    if (session && session.inTransaction()) {
      console.log("Aborting MongoDB transaction due to error.");
      await session.abortTransaction();
      console.log("MongoDB transaction aborted.");
    }

    if (uploadedIcon && uploadedIcon.public_id) {
      console.log(
        `Attempting to delete uploaded icon (${uploadedIcon.public_id}) from Cloudinary due to error...`
      );
      try {
        const deletionSuccess = await svgDeleteCloudinary(uploadedIcon.public_id);
        if (deletionSuccess) {
          console.log(
            `Successfully deleted icon ${uploadedIcon.public_id} from Cloudinary.`
          );
        } else {
          console.warn(
            `Failed to delete icon ${uploadedIcon.public_id} from Cloudinary. Manual cleanup may be required.`
          );
        }
      } catch (cleanupError) {
        console.error(
          `Error during Cloudinary icon cleanup for ${uploadedIcon.public_id}:`,
          cleanupError
        );
      }
    }

    if (error instanceof Error) {
      throw new Error(`Failed to add new category: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred while adding the new category.");
    }
  } finally {
    if (session) {
      session.endSession();
      console.log("MongoDB session ended.");
    }
  }
}
