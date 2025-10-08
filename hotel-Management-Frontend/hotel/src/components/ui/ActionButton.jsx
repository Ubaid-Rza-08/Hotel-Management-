// components/ui/ActionButton.jsx
const ActionButton = ({ icon: Icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white transition-colors"
  >
    <div className={`${color} p-2 rounded-lg`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="font-medium text-gray-700">{label}</span>
  </button>
);
export default ActionButton;