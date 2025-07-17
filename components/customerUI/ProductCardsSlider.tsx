import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import ProductCard from "./ProductCard";
import Link from "next/link";

interface SectionTypes {
  products: ProductCard[];
  title: string;
  className: string;
  link: string;
}

//TODO: Finish the slider
export default function ProductCardsSlider({ products, title, className, link }: SectionTypes) {
  return (
    <section className={`py-4 w-full ${className}`}>
      <div className='flex justify-between items-center pb-2'>
        <h2 className='text-2xl font-display font-bold'>{title}</h2>
        <Link href={link} className='group flex items-center gap-2 py-2 px-4 rounded-none hover:bg-grey  duration-75 cursor-pointer'>
          Show more <ArrowRight size={20} className='group-hover:translate-x-1 duration-75' />
        </Link>
      </div>
      <div className='overflow-x-auto w-full'>
        <div className='flex gap-x-2 w-max'>
          {products.map((product) => (
            <ProductCard product={product} key={product.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
