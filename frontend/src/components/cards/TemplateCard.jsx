import { Link } from 'react-router-dom';

export default function TemplateCard({ template }) {
  return (
    <Link
      to={`/templates/${template.id}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-background-light overflow-hidden">
        <img
          src={template.images?.[0] || '/placeholder.jpg'}
          alt={template.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-text-dark mb-2">{template.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-text-dark">₦{template.basePrice || 0}</span>
          <div className="flex items-center space-x-2">
            {template.difficulty && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                {template.difficulty}
              </span>
            )}
            {template.estimatedBuildTime && (
              <span className="text-xs text-gray-600">~{template.estimatedBuildTime}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

