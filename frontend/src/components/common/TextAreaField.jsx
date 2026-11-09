export default function TextAreaField({ label, name, error, ...areaProps }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} className={error ? 'invalid' : ''} {...areaProps} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
