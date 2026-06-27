// Hand-authored seed collections that previously lived inline inside the pages
// (Messages / Meetings / Schedule). They belong to the data layer now, so the
// mock server is the single source of truth and the pages just read them
// through the store like every other collection.

export const MESSAGE_THREADS = [
  { n: 'Nigora Karimova', g: 'O‘qituvchi · Matematika', last: 'Ertangi yig‘ilishga tayyorman', tm: '14:42', un: 0, on: true, cat: 'teachers' },
  { n: 'Matematika bo‘limi', g: 'Guruh · 12 a‘zo', last: 'Siz: Yangi mavzular ro‘yxati...', tm: '13:20', un: 0, grp: true, cat: 'staff' },
  { n: 'Akbarova Dilnoza', g: 'Ota-ona · Akmal · 9-B', last: 'Rahmat ustoz!', tm: '12:18', un: 2, cat: 'parents' },
  { n: 'Aziz Tursunov', g: 'O‘qituvchi · Ingliz', last: 'Yangi guruh ochsak bo‘ladimi?', tm: '11:05', un: 1, on: true, cat: 'teachers' },
  { n: 'Halimova Zilola', g: 'O‘quvchi · 9-B', last: 'Uy ishini yubordim', tm: 'Du', un: 0, cat: 'students' },
  { n: 'Qabul bo‘limi', g: 'Guruh · 8 a‘zo', last: 'Bugun 6 ta yangi lid', tm: 'Du', un: 3, grp: true, cat: 'staff' },
  { n: 'Eshmatova Gulnora', g: 'Ota-ona · Otabek', last: 'To‘lov haqida savol', tm: 'Du', un: 0, cat: 'parents', flag: true },
];

export const MEETINGS_SEED = [
  { id: 'mt1', t: 'Haftalik filial yig‘ilishi', aud: 'Butun filial', cnt: 16, dNum: '19', d: 'today', tm: '17:00–18:00', loc: 'Konferens zal', who: 'Dilnoza Yo‘ldosheva', tone: 'var(--sf-primary)', soon: true, online: false },
  { id: 'mt2', t: 'Matematika bo‘limi · metodik', aud: 'Matematika bo‘limi', cnt: 12, dNum: '20', d: 'tomorrow', tm: '14:00–15:00', loc: 'Onlayn · Zoom', who: 'Nigora Karimova', tone: 'var(--sf-accent)', online: true },
  { id: 'mt3', t: 'Sotuv natijalari · oylik', aud: 'Sotuv · Marketing', cnt: 5, dNum: '23', d: 'date', tm: '11:00', loc: '301-xona', who: 'Rustam Olimov', tone: 'var(--sf-warn)', online: false },
  { id: 'mt4', t: 'Yangi o‘qituvchilar treningi', aud: 'Tanlangan · 6 kishi', cnt: 6, dNum: '24', d: 'date', tm: '10:00–13:00', loc: 'O‘quv zal', who: 'Malika Yusupova', tone: 'var(--sf-success)', online: false },
];

export const SCHEDULE_LESSONS = [
  { key: '301-08:00', n: 'Fizika', t: 'Malika Y.', c: 'var(--sf-accent)' },
  { key: '304-09:30', n: '9-B Alg', t: 'Nigora K.', c: 'var(--sf-primary)' },
  { key: '304-14:00', n: 'Alg Mid', t: 'Nigora K.', c: 'var(--sf-primary)' },
  { key: '302-11:00', n: 'Ingliz B2', t: 'Aziz T.', c: 'var(--sf-success)' },
  { key: '305-15:30', n: 'Geom', t: 'Bobur A.', c: 'var(--sf-ink-2)' },
  { key: '210-17:00', n: 'Kimyo', t: 'Jasur R.', c: 'var(--sf-warn)' },
  { key: '301-15:30', n: 'DTM', t: 'Malika Y.', c: 'var(--sf-accent)' },
];
