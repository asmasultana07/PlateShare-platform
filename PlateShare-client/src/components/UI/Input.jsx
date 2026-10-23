export default function Input({
  id,
  name,
  label,
  as = 'input',
  error,
  hint,
  className = '',
  controlClassName = '',
  controlWrapperClassName = 'input-with-icon',
  leading,
  trailing,
  bare = false,
  children,
  ...props
}) {
  const fieldId = id || name;
  const commonProps = {
    id: fieldId,
    name,
    className: controlClassName,
    'aria-invalid': Boolean(error),
    'aria-describedby': error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined,
    ...props,
  };

  let field;
  if (as === 'select') field = <select {...commonProps}>{children}</select>;
  else if (as === 'textarea')
    field = (
      <textarea {...commonProps}>
        {props.value === undefined ? children : undefined}
      </textarea>
    );
  else field = <input {...commonProps} />;

  if (bare) return field;
  const hasAdornment = leading || trailing;

  return (
    <div className={`ui-field ${className}`.trim()}>
      {label && <label htmlFor={fieldId}>{label}</label>}
      {hasAdornment ? (
        <span className={controlWrapperClassName}>
          {leading}
          {field}
          {trailing}
        </span>
      ) : (
        field
      )}
      {error && (
        <span id={`${fieldId}-error`} className="form-error" role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${fieldId}-hint`} className="field-hint">
          {hint}
        </span>
      )}
    </div>
  );
}
