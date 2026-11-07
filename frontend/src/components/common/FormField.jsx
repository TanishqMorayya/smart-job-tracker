export default function FormField({ label, name, error, ...inputProps }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} className={error ? 'invalid' : ''} {...inputProps} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
