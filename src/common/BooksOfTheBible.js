export const NT_ORIG_LANG = 'el-x-koine';
export const NT_ORIG_LANG_BIBLE = 'ugnt';
export const OT_ORIG_LANG = 'hbo';
export const OT_ORIG_LANG_BIBLE = 'uhb';

/**
 * Nested version of the books of the bible object.
 */
export const BIBLE_BOOKS = {
  oldTestament: {
    'gen': 'Genesis',
    'exo': 'Exodus',
    'lev': 'Leviticus',
    'num': 'Numbers',
    'deu': 'Deuteronomy',
    'jos': 'Joshua',
    'jdg': 'Judges',
    'rut': 'Ruth',
    '1sa': '1 Samuel',
    '2sa': '2 Samuel',
    '1ki': '1 Kings',
    '2ki': '2 Kings',
    '1ch': '1 Chronicles',
    '2ch': '2 Chronicles',
    'ezr': 'Ezra',
    'neh': 'Nehemiah',
    'est': 'Esther',
    'job': 'Job',
    'psa': 'Psalms',
    'pro': 'Proverbs',
    'ecc': 'Ecclesiastes',
    'sng': 'Song of Solomon',
    'isa': 'Isaiah',
    'jer': 'Jeremiah',
    'lam': 'Lamentations',
    'ezk': 'Ezekiel',
    'dan': 'Daniel',
    'hos': 'Hosea',
    'jol': 'Joel',
    'amo': 'Amos',
    'oba': 'Obadiah',
    'jon': 'Jonah',
    'mic': 'Micah',
    'nam': 'Nahum',
    'hab': 'Habakkuk',
    'zep': 'Zephaniah',
    'hag': 'Haggai',
    'zec': 'Zechariah',
    'mal': 'Malachi',
  },
  newTestament: {
    'mat': 'Matthew',
    'mrk': 'Mark',
    'luk': 'Luke',
    'jhn': 'John',
    'act': 'Acts',
    'rom': 'Romans',
    '1co': '1 Corinthians',
    '2co': '2 Corinthians',
    'gal': 'Galatians',
    'eph': 'Ephesians',
    'php': 'Philippians',
    'col': 'Colossians',
    '1th': '1 Thessalonians',
    '2th': '2 Thessalonians',
    '1ti': '1 Timothy',
    '2ti': '2 Timothy',
    'tit': 'Titus',
    'phm': 'Philemon',
    'heb': 'Hebrews',
    'jas': 'James',
    '1pe': '1 Peter',
    '2pe': '2 Peter',
    '1jn': '1 John',
    '2jn': '2 John',
    '3jn': '3 John',
    'jud': 'Jude',
    'rev': 'Revelation',
  },
};

export const BIBLES_ABBRV_INDEX = {
  'gen': '01',
  'exo': '02',
  'lev': '03',
  'num': '04',
  'deu': '05',
  'jos': '06',
  'jdg': '07',
  'rut': '08',
  '1sa': '09',
  '2sa': '10',
  '1ki': '11',
  '2ki': '12',
  '1ch': '13',
  '2ch': '14',
  'ezr': '15',
  'neh': '16',
  'est': '17',
  'job': '18',
  'psa': '19',
  'pro': '20',
  'ecc': '21',
  'sng': '22',
  'isa': '23',
  'jer': '24',
  'lam': '25',
  'ezk': '26',
  'dan': '27',
  'hos': '28',
  'jol': '29',
  'amo': '30',
  'oba': '31',
  'jon': '32',
  'mic': '33',
  'nam': '34',
  'hab': '35',
  'zep': '36',
  'hag': '37',
  'zec': '38',
  'mal': '39',
  'mat': '41',
  'mrk': '42',
  'luk': '43',
  'jhn': '44',
  'act': '45',
  'rom': '46',
  '1co': '47',
  '2co': '48',
  'gal': '49',
  'eph': '50',
  'php': '51',
  'col': '52',
  '1th': '53',
  '2th': '54',
  '1ti': '55',
  '2ti': '56',
  'tit': '57',
  'phm': '58',
  'heb': '59',
  'jas': '60',
  '1pe': '61',
  '2pe': '62',
  '1jn': '63',
  '2jn': '64',
  '3jn': '65',
  'jud': '66',
  'rev': '67',
};

export const ALL_BIBLE_BOOKS = {
  ...BIBLE_BOOKS.oldTestament,
  ...BIBLE_BOOKS.newTestament,
};

export function getAllBibleBooks(translate=k=>k) {
  const bibleBooks = {};

  Object.keys(BIBLE_BOOKS.oldTestament).forEach(key => {
    bibleBooks[key] = translate('book_list.ot.'+key, { book_id: key });
  });
  Object.keys(BIBLE_BOOKS.newTestament).forEach(key => {
    bibleBooks[key] = translate('book_list.nt.'+key, { book_id: key });
  });
  return bibleBooks;
}

export function isNT(bookId) {
  return Object.keys(BIBLE_BOOKS.newTestament).includes(bookId)
}

export default BIBLE_BOOKS;
