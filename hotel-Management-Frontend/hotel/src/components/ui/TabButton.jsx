const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
      active
        ? 'border-blue-500 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {label}
  </button>
);
export default TabButton;