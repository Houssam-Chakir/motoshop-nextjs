import { X } from "lucide-react";

export default function FilterPill({ filters, handleRemoveFilter }) {
  const { sort, size, brand, style, maxPrice, minPrice } = filters;
  const isFilter = (sort || size.length > 0 || brand.length > 0 || style.length > 0 || maxPrice < 30000 || minPrice > 0)


  return (
    <>
      {isFilter && (
        <Pill>
          <p>Clear all</p>
          <PillButton onClick={() => handleRemoveFilter('all')} />
        </Pill>
      )}
      {sort && (
        <Pill>
          <p>{sort}</p>
          <PillButton onClick={() => handleRemoveFilter('sort')} />
        </Pill>
      )}
      {(maxPrice < 30000 || minPrice > 0) && (
        <Pill>
          <p>price</p>
          <PillButton onClick={() => handleRemoveFilter('price')} />
        </Pill>
      )}
      {size.length > 0 && (
        <Pill>
          <p>size</p>
          <p className='text-gray-600 font-light'>({size.length})</p>
          <PillButton onClick={() => handleRemoveFilter('size')} />
        </Pill>
      )}
      {brand.length > 0 && (
        <Pill>
          <p>brand</p>
          <p className='text-gray-600 font-light'>({size.length})</p>
          <PillButton onClick={() => handleRemoveFilter('brand')} />
        </Pill>
      )}
      {style.length > 0 && (
        <Pill>
          <p>style</p>
          <p className='text-gray-600 font-light'>({style.length})</p>
          <PillButton onClick={() => handleRemoveFilter('style')} />
        </Pill>
      )}
    </>
  );
}

function Pill({ children }) {
  return <div className='flex text-gray-600 gap-1 justify-between items-center pl-3 border rounded-full text-sm hover:border-slate-400 cursor-default'>{children}</div>;
}

function PillButton({onClick}) {
  return (
    <button onClick={onClick} className="py-1.5 pr-2 cursor-pointer group">
      <X size={16} className='text-gray-600 group-hover:text-primary-dark' />
    </button>
  );
}
