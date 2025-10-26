export default function Button({ children, type = "button", disabled = false, className = "" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`w-full bg-black text-white py-2 rounded-md shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}