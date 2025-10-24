export default function InputField({ 
  label, 
  type = "text", 
  name,            
  value, 
  onChange, 
  error, 
  placeholder = "" 
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 text-left">
        {label}
      </label>
      <input
        name={name}                     
        type={type}
        value={value}
        onChange={onChange}              
        placeholder={placeholder}
        className={`mt-1 w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-md text-sm placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}