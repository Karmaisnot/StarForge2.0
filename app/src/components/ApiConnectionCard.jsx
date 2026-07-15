import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '../api/config.js';
import { AUTH_SESSION_CHANGED, authSessionSource, loginWithPassword, logoutCurrentSession } from '../api/auth.js';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button, Card, Pill } from './primitives.jsx';
import { Field, TextInput } from './form.jsx';

function errorMessage(error, fallback) {
  return error?.data?.message || error?.message || fallback;
}

export function ApiConnectionCard() {
  const { t } = useTranslation();
  const { push } = useToast();
  const { refresh, reset } = useStore();
  const [source, setSource] = useState(authSessionSource);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = () => setSource(authSessionSource());
    window.addEventListener(AUTH_SESSION_CHANGED, sync);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED, sync);
  }, []);

  const reconnect = useCallback(async () => {
    setPending(true);
    setError('');
    const results = await refresh();
    const unavailable = results.filter((loaded) => !loaded).length;
    setPending(false);
    push({
      tone: unavailable ? 'warn' : 'success',
      title: unavailable ? t('connection.connectedPartial') : t('connection.refreshed'),
      desc: unavailable ? t('connection.connectedPartialDesc', { count: unavailable }) : t('connection.refreshedDesc'),
    });
  }, [push, refresh, t]);

  const connect = useCallback(async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await loginWithPassword({ username, password });
      setUsername('');
      setPassword('');
      setSource(authSessionSource());
      await reconnect();
    } catch (err) {
      setPassword('');
      setError(errorMessage(err, t('connection.loginFailed')));
      setPending(false);
    }
  }, [password, reconnect, t, username]);

  const disconnect = useCallback(async () => {
    setPending(true);
    setError('');
    try {
      await logoutCurrentSession();
      push({ tone: 'info', title: t('connection.disconnected'), desc: t('connection.disconnectedDesc') });
    } catch (err) {
      push({ tone: 'warn', title: t('connection.disconnectedLocal'), desc: errorMessage(err, t('connection.disconnectedLocalDesc')) });
    } finally {
      setSource(authSessionSource());
      reset();
      setPending(false);
    }
  }, [push, reset, t]);

  const isMock = API_CONFIG.useMock;
  const isEnvironmentSession = source === 'environment';
  const isStoredSession = source === 'storage';
  const status = isMock ? 'mock' : source ? 'connected' : 'disconnected';
  const statusTone = status === 'connected' ? 'success' : status === 'mock' ? 'accent' : 'neutral';

  return (
    <Card
      title={t('connection.title')}
      action={<Pill tone={statusTone} dot>{t(`connection.status.${status}`)}</Pill>}
      className="sf-connection-card"
    >
      {isMock ? (
        <div className="sf-connection-note">
          <p>{t('connection.mockNote')}</p>
          <code>VITE_USE_MOCK=false</code>
        </div>
      ) : isEnvironmentSession ? (
        <div className="sf-connection-note">
          <p>{t('connection.environmentNote')}</p>
          <Button kind="soft" onClick={reconnect} disabled={pending}>{pending ? t('connection.loading') : t('connection.refresh')}</Button>
        </div>
      ) : isStoredSession ? (
        <div className="sf-connection-live">
          <div>
            <strong>{t('connection.sessionActive')}</strong>
            <p>{t('connection.sessionActiveNote')}</p>
          </div>
          <div className="sf-connection-actions">
            <Button kind="soft" onClick={reconnect} disabled={pending}>{pending ? t('connection.loading') : t('connection.refresh')}</Button>
            <Button kind="ghost" onClick={disconnect} disabled={pending}>{t('connection.logout')}</Button>
          </div>
        </div>
      ) : (
        <form className="sf-connection-form" onSubmit={connect}>
          <p className="sf-connection-copy">{t('connection.loginNote')}</p>
          <div className="sf-connection-fields">
            <Field label={t('connection.username')}>
              <TextInput value={username} onChange={setUsername} autoComplete="username" disabled={pending} required />
            </Field>
            <Field label={t('connection.password')}>
              <TextInput value={password} onChange={setPassword} type="password" autoComplete="current-password" disabled={pending} required />
            </Field>
          </div>
          {error ? <div className="sf-form-error" role="alert">{error}</div> : null}
          <div className="sf-connection-actions">
            <Button kind="primary" type="submit" disabled={pending}>{pending ? t('connection.loading') : t('connection.login')}</Button>
            <span>{t('connection.storageNote')}</span>
          </div>
        </form>
      )}
    </Card>
  );
}
