// components/ui/ActivityItem.jsx
const ActivityItem = ({ title, description, time, icon: Icon }) => (
  <div className="flex items-start gap-3">
    <div className="bg-blue-100 p-2 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);
export default ActivityItem;