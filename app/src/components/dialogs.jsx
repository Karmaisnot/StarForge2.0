import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal.jsx';
import { Button } from './primitives.jsx';
import { Field, SelectInput, TextArea, TextInput } from './form.jsx';

// Tone name → accent colour for the primary action button. Keeping the mapping
// here (not in callers) means every dialog stays visually consistent and a new
// tone is a one-line change.
const ACCENT = {
  success: 'var(--sf-success)',
  danger: 'var(--sf-danger)',
  warn: 'var(--sf-warn)',
  primary: 'var(--sf-primary)',
  accent: 'var(--sf-accent)',
};

// Yes/no confirmation. The destructive intent is conveyed by `tone`, which
// colours both the header icon and the confirm button.
export function ConfirmModal({ close, onConfirm, title, message, tone = 'primary', icon, confirmLabel, cancelLabel }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      sub={message}
      icon={icon}
      tone={tone}
      size="sm"
      onClose={close}
      footer={
        <>
          <Button kind="soft" onClick={close}>
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            kind="primary"
            accent={ACCENT[tone]}
            onClick={() => {
              onConfirm?.();
              close();
            }}
          >
            {confirmLabel || t('common.approve')}
          </Button>
        </>
      }
    />
  );
}

// Schema-driven form. `fields` is `[{ name, label, type?, required?, options?,
// placeholder?, value?, rows?, hint? }]`. Validation is required-only and lives
// in one place, so every create/edit/compose flow behaves identically.
export function FormModal({ close, onSubmit, title, sub, icon, tone = 'primary', fields = [], submitLabel }) {
  const { t } = useTranslation();
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.value ?? (f.type === 'select' ? f.options?.[0] ?? '' : '')])),
  );
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const isBlank = (f) => f.required && !String(values[f.name] ?? '').trim();
  const missing = fields.filter(isBlank);

  const set = (name) => (v) => setValues((s) => ({ ...s, [name]: v }));
  const submit = async () => {
    if (missing.length) {
      setTouched(true);
      return;
    }
    setSubmitError('');
    try {
      await onSubmit?.(values);
      close();
    } catch (err) {
      setSubmitError(err?.message || t('toast.error'));
    }
  };

  return (
    <Modal
      title={title}
      sub={sub}
      icon={icon}
      tone={tone}
      size="md"
      onClose={close}
      footer={
        <>
          <Button kind="soft" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button kind="primary" accent={ACCENT[tone]} onClick={submit}>
            {submitLabel || t('common.save')}
          </Button>
        </>
      }
    >
      <div className="sf-form">
        {submitError && <div role="alert" className="sf-form-error">{submitError}</div>}
        {fields.map((f) => {
          const invalid = touched && isBlank(f);
          const control = { value: values[f.name], onChange: set(f.name), placeholder: f.placeholder, 'aria-invalid': invalid || undefined };
          return (
            <Field key={f.name} label={f.label} required={f.required} invalid={invalid} hint={invalid ? t('ui.required') : f.hint}>
              {f.type === 'textarea' ? (
                <TextArea {...control} rows={f.rows} />
              ) : f.type === 'select' ? (
                <SelectInput {...control} options={f.options} />
              ) : (
                <TextInput {...control} type={f.type || 'text'} />
              )}
            </Field>
          );
        })}
      </div>
    </Modal>
  );
}

// Read-only record view. `rows` is `[[label, value], ...]`; arbitrary children
// render below for richer content.
export function DetailsModal({ close, title, sub, icon, tone = 'primary', rows = [], children }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      sub={sub}
      icon={icon}
      tone={tone}
      size="md"
      onClose={close}
      footer={
        <Button kind="primary" onClick={close}>
          {t('ui.close')}
        </Button>
      }
    >
      {rows.length > 0 && (
        <div className="sf-detail">
          {rows.map(([k, v], i) => (
            <div className="sf-detail-row" key={i}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      )}
      {children}
    </Modal>
  );
}
