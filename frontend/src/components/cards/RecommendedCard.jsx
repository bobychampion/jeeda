import { Link } from 'react-router-dom';

export default function RecommendedCard({ template }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square bg-background-light overflow-hidden">
        <img
          src={template.images?.[0] || '/placeholder.jpg'}
          alt={template.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-text-dark mb-2">{template.name}</h4>
        <div className="flex items-center justify-between mb-2">
          {template.difficulty && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {template.difficulty}
            </span>
          )}
          {template.estimatedBuildTime && (
            <span className="text-xs text-gray-600">{template.estimatedBuildTime}</span>
          )}
        </div>
        <Link
          to={`/templates/${template.id}`}
          className="block w-full text-center px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition text-sm"
        >
          View Plan
        </Link>
      </div>
    </div>
  );
}

