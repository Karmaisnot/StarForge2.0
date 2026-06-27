import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { ConfirmModal, DetailsModal, FormModal } from '../components/dialogs.jsx';
import { Icons } from '../components/Icons.jsx';
import { exportRows, downloadReport } from '../lib/export.js';

// Single source of truth for the write-actions shared across every page. Each
// handler opens a real dialog (confirm / form / details) and only fires the
// success toast once the user commits. Pages keep calling the same named
// methods, so all 19 screens gain working modals without per-page wiring.
//
// Every handler accepts an optional override object so a page with richer
// context (e.g. a custom field schema) can specialise without forking logic.
export function useActions() {
  const { t } = useTranslation();
  const { push } = useToast();
  const { open } = useModal();

  return useMemo(() => {
    const toast = (tone, title, desc) => push({ tone, title, desc });
    // Guards callers wired as `onClick={a.approve}`, where the click event —
    // not a name — arrives as the argument.
    const named = (v) => (typeof v === 'string' ? v : undefined);
    // Same guard for option objects: a bare `onClick={a.exportData}` passes a
    // synthetic event, which we treat as "no options".
    const opts = (o) => (o && typeof o === 'object' && !o.nativeEvent && !o.target ? o : {});

    return {
      // ---- Forms (create / edit / compose) ----
      create: (o = {}) =>
        open(({ close }) => (
          <FormModal
            close={close}
            icon={Icons.plus}
            tone="primary"
            title={o.title || t('ui.createTitle')}
            sub={o.sub}
            submitLabel={o.submitLabel || t('common.add')}
            fields={
              o.fields || [
                { name: 'name', label: t('ui.fName'), required: true, placeholder: t('ui.fNamePh') },
                { name: 'category', label: t('ui.fCategory') },
                { name: 'note', label: t('ui.fNote'), type: 'textarea' },
              ]
            }
            onSubmit={(v) => {
              o.onSubmit?.(v);
              toast('success', t('toast.created'), v.name || o.title || t('toast.createdDesc'));
            }}
          />
        )),

      save: (o = {}) =>
        open(({ close }) => (
          <FormModal
            close={close}
            icon={Icons.settings}
            title={o.title || t('ui.editTitle')}
            submitLabel={t('common.save')}
            fields={
              o.fields || [
                { name: 'name', label: t('ui.fName'), required: true, value: o.name },
                { name: 'note', label: t('ui.fNote'), type: 'textarea' },
              ]
            }
            onSubmit={(v) => {
              o.onSubmit?.(v);
              toast('success', t('toast.saved'), v.name || t('toast.savedDesc'));
            }}
          />
        )),

      send: (o = {}) =>
        open(({ close }) => (
          <FormModal
            close={close}
            icon={Icons.chat}
            tone="primary"
            title={o.title || t('ui.sendTitle')}
            submitLabel={t('common.send')}
            fields={
              o.fields || [
                { name: 'to', label: t('messages.tfTo'), required: true, value: o.to, placeholder: t('ui.toPh') },
                { name: 'text', label: t('ui.message'), type: 'textarea', required: true, rows: 4, placeholder: t('messages.msgPlaceholder') },
              ]
            }
            onSubmit={(v) => {
              o.onSubmit?.(v);
              toast('success', t('toast.sent'), t('toast.sentDesc'));
            }}
          />
        )),

      task: (o = {}) =>
        open(({ close }) => (
          <FormModal
            close={close}
            icon={Icons.check}
            tone="accent"
            title={o.title || t('messages.qaTask')}
            submitLabel={t('messages.modeTask')}
            fields={
              o.fields || [
                { name: 'to', label: t('messages.tfTo'), required: true, value: o.to },
                { name: 'task', label: t('ui.taskDesc'), type: 'textarea', required: true, rows: 3, placeholder: t('messages.taskPlaceholder') },
                { name: 'due', label: t('messages.tfDue'), type: 'date' },
              ]
            }
            onSubmit={(v) => {
              o.onSubmit?.(v);
              toast('success', t('toast.taskAssigned'), v.to);
            }}
          />
        )),

      // Real export: builds the chosen file in-browser from the page's columns
      // + rows and downloads it. `o.rows` is the current (filtered) view;
      // `o.allRows` the unfiltered set, so the scope selector is meaningful.
      exportData: (raw = {}) => {
        const o = opts(raw);
        return open(({ close }) => (
          <FormModal
            close={close}
            icon={Icons.download}
            title={o.title || t('ui.exportTitle')}
            sub={o.sub || t('ui.exportSub')}
            submitLabel={t('common.export')}
            fields={
              o.fields || [
                { name: 'format', label: t('ui.format'), type: 'select', options: ['XLSX', 'CSV', 'JSON'] },
                { name: 'scope', label: t('ui.scope'), type: 'select', options: [t('ui.scopeAll'), t('ui.scopeFiltered')] },
              ]
            }
            onSubmit={(v) => {
              const filtered = v.scope === t('ui.scopeFiltered');
              const rows = filtered ? o.rows || [] : o.allRows || o.rows || [];
              const columns = o.columns || [];
              const filename = columns.length && rows.length
                ? exportRows({ format: v.format, name: o.name || t('ui.exportTitle'), columns, rows })
                : null;
              o.onSubmit?.(v);
              toast('info', t('toast.exported'), filename || `${v.format} · ${v.scope}`);
            }}
          />
        ));
      },

      // ---- Confirmations ---- (each runs the page's real mutation, then toasts)
      // Real report: confirms, then downloads a self-contained HTML report built
      // from `o.sections` / `o.table`.
      report: (raw = {}) => {
        const o = opts(raw);
        return open(({ close }) => (
          <ConfirmModal
            close={close}
            icon={Icons.doc}
            tone="primary"
            title={o.title || t('toast.report')}
            message={o.message || t('toast.reportDesc')}
            confirmLabel={t('common.report')}
            onConfirm={() => {
              const filename = o.sections || o.table
                ? downloadReport({ title: o.title || t('toast.report'), subtitle: o.subtitle, sections: o.sections, table: o.table })
                : null;
              o.onConfirm?.();
              toast('info', t('toast.report'), filename || t('toast.reportDesc'));
            }}
          />
        ));
      },

      // Generic confirmation — pages pass their own copy and mutation. The
      // approve/reject/flag handlers above are pre-styled specialisations; this
      // covers every other yes/no action (pause a branch, archive, etc.).
      confirm: (o = {}) =>
        open(({ close }) => (
          <ConfirmModal
            close={close}
            icon={o.icon || Icons.check}
            tone={o.tone || 'primary'}
            title={o.title}
            message={o.message}
            confirmLabel={o.confirmLabel || t('common.approve')}
            onConfirm={() => {
              o.onConfirm?.();
              if (o.toast !== false) toast(o.toastTone || 'info', o.title, o.desc);
            }}
          />
        )),

      approve: (raw, o = {}) => {
        const name = named(raw);
        return open(({ close }) => (
          <ConfirmModal
            close={close}
            icon={Icons.check}
            tone="success"
            title={t('toast.approved')}
            message={name ? t('ui.approveQ', { name }) : t('toast.approvedDesc')}
            confirmLabel={t('common.approve')}
            onConfirm={() => {
              o.onConfirm?.();
              toast('success', t('toast.approved'), name || t('toast.approvedDesc'));
            }}
          />
        ));
      },

      reject: (raw, o = {}) => {
        const name = named(raw);
        return open(({ close }) => (
          <ConfirmModal
            close={close}
            icon={Icons.x}
            tone="danger"
            title={t('toast.rejected')}
            message={name ? t('ui.rejectQ', { name }) : t('toast.rejectedDesc')}
            confirmLabel={t('common.reject')}
            onConfirm={() => {
              o.onConfirm?.();
              toast('danger', t('toast.rejected'), name || t('toast.rejectedDesc'));
            }}
          />
        ));
      },

      flag: (raw, o = {}) => {
        const name = named(raw);
        return open(({ close }) => (
          <ConfirmModal
            close={close}
            icon={Icons.flag}
            tone="warn"
            title={t('toast.flagged')}
            message={name ? t('ui.flagQ', { name }) : t('chats.flag')}
            confirmLabel={t('chats.flag')}
            onConfirm={() => {
              o.onConfirm?.();
              toast('warn', t('toast.flagged'), name);
            }}
          />
        ));
      },

      // ---- Read-only detail ----
      open: (label, o = {}) =>
        open(({ close }) => (
          <DetailsModal
            close={close}
            icon={o.icon || Icons.search}
            tone={o.tone || 'primary'}
            title={o.title || label || t('toast.opened')}
            sub={o.sub}
            rows={o.rows || []}
          >
            {!o.rows && <p className="sf-detail-empty">{o.body || t('ui.detailsBody', { name: label || '' })}</p>}
          </DetailsModal>
        )),

      // Genuinely not-yet-built features keep the lightweight toast.
      soon: () => toast('info', t('toast.comingSoon'), t('toast.comingSoonDesc')),
    };
  }, [t, push, open]);
}
