export default function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="label">{label}</label>}
      <input
        id={id}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}