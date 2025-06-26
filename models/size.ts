// models/Size.ts
import mongoose from "mongoose";

export interface SizeType extends mongoose.Document {
  value: string;
  normalizedValue: string;
  sortOrder: number;
  type: "standard" | "custom";
  sections: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SizeSchema = new mongoose.Schema<SizeType>(
  {
    value: {
      type: String,
      required: [true, "Size value is required"],
      trim: true,
      maxlength: [50, "Size value cannot exceed 50 characters"],
    },
    normalizedValue: {
      type: String,
      required: [true, "Normalized value is required"],
      lowercase: true,
      trim: true,
      index: true, // For faster queries
    },
    sortOrder: {
      type: Number,
      required: [true, "Sort order is required"],
      min: [0, "Sort order must be non-negative"],
      index: true, // For sorting
    },
    type: {
      type: String,
      required: [true, "Size type is required"],
      enum: {
        values: ["standard", "custom"],
        message: "Type must be either standard or custom",
      },
      default: "standard",
    },
    sections: [
      {
        type: String,
        required: true,
        trim: true,
        enum: {
          values: ["helmets", "riding-gear", "motorcycle-parts", "motorcycles", "riding-style"],
          message: "Invalid section value",
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "sizes",
  }
);

// Compound index for efficient queries
SizeSchema.index({ sections: 1, sortOrder: 1 });
SizeSchema.index({ normalizedValue: 1, sections: 1 });

// Pre-save middleware to generate normalizedValue
SizeSchema.pre("save", function (next) {
  if (this.isModified("value")) {
    this.normalizedValue = this.value.toLowerCase().trim();
  }
  next();
});

// Static method to get sizes by section
SizeSchema.statics.getBySections = function (sections: string[]) {
  return this.find({
    sections: { $in: sections },
  }).sort({ sortOrder: 1 });
};

// Static method to find or create size
SizeSchema.statics.findOrCreate = async function (value: string, sections: string[], type: "standard" | "custom" = "custom") {
  const normalizedValue = value.toLowerCase().trim();

  const size = await this.findOne({ normalizedValue });

  if (size) {
    // Add new sections if they don't exist
    const newSections = sections.filter((section) => !size.sections.includes(section));
    if (newSections.length > 0) {
      size.sections.push(...newSections);
      await size.save();
    }
    return size;
  }

  // Create new size with auto-generated sortOrder
  const maxSortOrder = await this.findOne({}, {}, { sort: { sortOrder: -1 } });
  const sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 1;

  return this.create({
    value,
    normalizedValue,
    sortOrder,
    type,
    sections,
  });
};

// Instance method to add section
SizeSchema.methods.addSection = function (section: string) {
  if (!this.sections.includes(section)) {
    this.sections.push(section);
    return this.save();
  }
  return this;
};

// Virtual for display
SizeSchema.virtual("displayValue").get(function () {
  return this.value;
});

// Ensure virtuals are included in JSON
SizeSchema.set("toJSON", { virtuals: true });

export default mongoose.models.Size || mongoose.model<SizeType>("Size", SizeSchema);

// TypeScript interface for frontend
export interface Size {
  _id: string;
  value: string;
  normalizedValue: string;
  sortOrder: number;
  type: "standard" | "custom";
  sections: string[];
  createdAt: string;
  updatedAt: string;
  displayValue: string;
}
