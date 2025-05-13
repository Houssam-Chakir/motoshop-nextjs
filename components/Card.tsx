"use client";

import { ProductDocument } from "@/models/Product";
import Link from "next/link";
import { Button } from "./ui/button";
import deleteProduct from "@/app/actions/deleteProduct";
// import Image from "next/image";

const ProductCard = ({ product }) => {
  const handleDeleteProduct = async () => {
    const isConfirmed = confirm("Are you sure you want to delete this product");
    if (isConfirmed) {
      await deleteProduct(product._id);
      console.log('product deleted successfully');
    }
  };

  return (
    <div className='w-full max-w-sm px-4 py-3 my-2 bg-white rounded-md border dark:bg-gray-800'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-light text-gray-800 dark:text-gray-400'>{product.productModel}</span>
        <span className='px-3 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full dark:bg-blue-300 dark:text-blue-900'>{product.identifiers.brand}</span>
      </div>

      <div>
        <h1 className='mt-2 text-lg font-semibold text-gray-800 dark:text-white'>{product.title}</h1>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>{product.description}</p>
      </div>

      <div>
        <div className='flex items-center mt-2 text-gray-700 dark:text-gray-200'>
          <span>Go to:</span>
          <Link href={`/products/${product._id}`} className='mx-2 text-blue-600 cursor-pointer dark:text-blue-400 hover:underline' tabIndex={0} role='link'>
            details
          </Link>
        </div>
        <div>
          <Button onClick={handleDeleteProduct} variant='destructive'>
            delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
