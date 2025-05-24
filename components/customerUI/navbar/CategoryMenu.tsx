import Container from "@/components/layout/Container";

const CategoryMenu = ({ section, onMouseLeave }) => {
  return (
    <div onMouseLeave={onMouseLeave} className='absolute bg-white w-full left-0 border-t-4 border-primary'>
      <div className='w-fill py-6 font-bold'>
        <Container>
          <h1>{section.section.toUpperCase()}:</h1>
        </Container>
      </div>
      <Container className=' justify-center'>
        <SectionMenu section={section} />
      </Container>
    </div>
  );
};

// whats inside the drop down
function SectionMenu({ section }) {
  return (
    <div className='flex gap'>
      {section.categories.map((category, i) => {
        return <CategoryBlock key={i} category={category} />;
      })}
    </div>
  );
}

// blocks of categories
function CategoryBlock({ category }) {
  return (
    <div className='flex gap-4 py-6 pl-6 pr-12'>
      <div className=''>
        <img className='h-12' src='/racing-helmet.svg' alt='racing' />
      </div>
      <div className='flex flex-col'>
        <h1 className='font-display font-medium text-[20px] text-primary-dark pb-1'>{category.name}</h1>
        {category.applicableTypes.map((type, i) => {
          return (
            <div key={i} className='text-sm font-light'>
              {type.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryMenu;
