import ProductCard from "./ProductCard";

interface SectionTypes {
  products: ProductCard[];
}

//TODO: Finish the slider
export default function ProductCardsSlider({ products }: SectionTypes) {
  return (
    <section>
      <div className='flex gap-2 overflow-scroll'>
        {/* {products.map((product) => {
          return <ProductCardTest product={product} key={product.sku} />;
        })} */}
        {products.map((product) => {
          return <ProductCard product={product} key={product.title} />;
        })}
      </div>
    </section>
  );
}
