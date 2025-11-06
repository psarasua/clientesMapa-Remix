interface InputProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  error?: string;
  className?: string;
}

export function Input({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  value,
  error,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={value}
        className={`
          w-full border rounded-md px-3 py-2 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-300" : "border-gray-300"}
        `}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

interface SearchInputProps {
  placeholder: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder,
  defaultValue,
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}