/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose'; // Or import ObjectId from 'bson';

export default function makeSerializable(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj; // Return primitives/null/undefined directly
  }

  // Handle Dates
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle ObjectIds (if not already strings)
  // Adjust based on how you import/use ObjectId
  if (obj instanceof Types.ObjectId /* || obj._bsontype === 'ObjectId' */) {
    return obj.toString();
  }

  // Handle Arrays recursively
  if (Array.isArray(obj)) {
    return obj.map(item => makeSerializable(item));
  }

  // Handle Objects recursively
  // Create a new object to avoid mutation
  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    // Ensure we process own properties, especially if iterating Mongoose objects
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
       newObj[key] = makeSerializable(obj[key]);
    }
  }
  return newObj;
}
