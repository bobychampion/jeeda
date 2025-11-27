import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="block bg-background-light rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-white overflow-hidden">
        <img
          src={category.imageUrl || '/placeholder.jpg'}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-text-dark">{category.name}</h3>
      </div>
    </Link>
  );
}

