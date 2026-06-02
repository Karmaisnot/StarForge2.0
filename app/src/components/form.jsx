// Controlled form-field primitives. Presentational — the caller owns the value
// and onChange; these only render the label/control/hint shell consistently.

export function Field({ label, required, hint, invalid, children }) {
  return (
    <label className="sf-field">
      <span className="sf-field-l">
        {label}
        {required && <em aria-hidden="true">*</em>}
      </span>
      {children}
      {hint && <span className={'sf-field-hint' + (invalid ? ' err' : '')}>{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, type = 'text', ...rest }) {
  return (
    <input
      className="sf-input"
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, rows = 3, ...rest }) {
  return (
    <textarea
      className="sf-input sf-textarea"
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      {...rest}
    />
  );
}

export function SelectInput({ value, onChange, options = [], ...rest }) {
  return (
    <select
      className="sf-input sf-select"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      {...rest}
    >
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
