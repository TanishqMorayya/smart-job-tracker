export default function SelectField({ label, name, error, options, placeholder, ...selectProps }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} className={error ? 'invalid' : ''} {...selectProps}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
