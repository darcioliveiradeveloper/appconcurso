export default function RadioOption({ 
  children, 
  selected = false, 
  state = 'default', // 'default' | 'correct' | 'incorrect'
  onClick, 
  disabled = false,
  index,
  className = '' 
}) {
  const states = {
    default: 'radio-option',
    correct: 'radio-option correct',
    incorrect: 'radio-option incorrect'
  };

  return (
    <div
      className={`${states[state]} ${selected ? 'selected' : ''} ${className}`}
      onClick={!disabled ? onClick : undefined}
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }}}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 text-left">
          {typeof children === 'string' ? (
            <span>{children}</span>
          ) : (
            children
          )}
        </div>
        {state === 'correct' && (
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {state === 'incorrect' && (
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}