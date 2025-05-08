import Link from 'next/link';

export default async function Home() {
  return (
    <>
      <div>Links</div>
      <Link href="/products">Products page</Link>
      <div>admin</div>
      <Link href="/admin/product/add">add product</Link>
    </>
  );
}
