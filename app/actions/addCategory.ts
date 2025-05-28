"use server";

import { SubmissionData } from "@/components/forms/CategoryAddForm";
import connectDB from "@/config/database";
import Category from "@/models/Category";
import Type from "@/models/Type";
import isUserAuthorized from "@/utils/isUserAuthorized";
import svgDeleteCloudinary from "@/utils/svgDeleteCloudinary";
import svgUploadCloudinary from "@/utils/svgUploadCloudinary";
import mongoose from "mongoose";

interface Icon {
  public_id: string;
  secure_url: string;
}

interface CategoryData {
  name: string;
  slug: string;
  icon: Icon;
  applicableTypes: { name: string; slug: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface TypeData {
  name: string,
  slug: string,
  category: mongoose.Types.ObjectId
}

export default async function addNewCategory(values: SubmissionData) {
  console.log("values: ", values);
  // -- Prepare icon variable outside trycatch
  let uploadedIcone: Icon | null = null;
  //-- Distruct values
  const { name, slug, icon, types } = values;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    // --- Authentication/Authorization -------------------
    const requiredRole = "admin";
    await isUserAuthorized(requiredRole);

    // --- Create New Category Data Structure -------------
    const categoryData: CategoryData = {
      name,
      slug,
      icon: { public_id: "", secure_url: "" },
      applicableTypes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // --- Upload Icon to Cloudinary
    // returns objects of secure url and public id
    uploadedIcone = await svgUploadCloudinary(icon, name);
    // add object to icon field
    if (uploadedIcone) {
      categoryData.icon = uploadedIcone;
    } else {
      throw new Error("Failed to upload icon svg to cloudinary");
    }

    // -- Create new Category to DB
    console.log("categoryData: ", categoryData);
    const newCategory = new Category(categoryData);
    await newCategory.save().session(session);

    // -- Create new Types to DB
    if (types && types.length > 0) {
      types.map(async(type) => {
        const typeData: TypeData = {
          name: type.name,
          slug: type.slug,
          category: newCategory._id
        }
        const newType = new Type(typeData);
        await newType.save().session(session)

      });
    }

    console.log("Server Action: Received values: ", values);
    // --- ERROR CATCH ------------------------------------
  } catch (error) {
    console.log("error: ", error);
    if (session.inTransaction()) {
      // Check if a transaction is active before trying to abort
      await session.abortTransaction();
    }

    if (uploadedIcone) {
      console.log("Rolling back: Deleting uploaded icon from Cloudinary...");
      const imagesPublicIds = uploadedImagesData.map((image) => image.public_id);
      try {
        await deleteImages(imagesPublicIds);
        console.log("Image rollback completed.");
      } catch (deleteError) {
        console.error("An error occurred during the image deletion process:", deleteError);
      }
    }

    if (uploadedIcone) {
      const iconId = uploadedIcone.public_id;
      console.log(`Requesting deletion for icon: ${iconId}`);
      const success = await svgDeleteCloudinary(iconId);
      if (success) {
        console.log(`Deletion process completed for ${iconId}. Icon should be gone.`);
        // Update your UI or database state here
      } else {
        console.log(`Deletion process failed for ${iconId}.`);
        // Handle error in UI if necessary
      }
    }

    console.error("Server Action: Error during product/stock creation:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  } finally {
    // end the session in a finally block to ensure it's closed
    // whether the transaction succeeded or failed.
    session.endSession();
  }
}
