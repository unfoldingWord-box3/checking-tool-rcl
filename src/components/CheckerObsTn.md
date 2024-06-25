Checking Tool Example fo OBS translationNotes:

```js
import React, { useState, useEffect } from 'react';
import { NT_ORIG_LANG } from '../common/constants';
import Checker, { translationNotes } from './Checker'
import { lookupTranslationForKey } from '../utils/translations'
import { extractGroupData } from '../helpers/translationHelps/twArticleHelpers'
import { getParsedUSFM } from '../utils/usfmHelpers'
import { fetchStories } from './fetchOBS'
import { fetchObsNotes } from './fetchObsNotes'
import { tsvToGroupData7Cols } from '../helpers/translationHelps/browser/tsvToGroupData'

const LexiconData = require("../__tests__/fixtures/lexicon/lexicons.json");
const translations = require('../locales/English-en_US.json')
const glTn = require('../__tests__/fixtures/translationNotes/enTn_OBS.json')
const glTaData = require('../__tests__/fixtures/translationAcademy/enTa_1JN.json')
const ugntBible = require('../__tests__/fixtures/bibles/obs/ugntBible.json')
const enGlBible = require('../__tests__/fixtures/bibles/obs/enGlBible.json')
const targetBible = require('../__tests__/fixtures/bibles/obs/targetBible.json')
const checkingData = extractGroupData(glTn)

const translate = (key) => {
  const translation = lookupTranslationForKey(translations, key)
  return translation
};

var bookId = "obs"

//CODE FOR GENERATING OBS VERSE OBJECTS AND OBS TNOTES GROUPS

// const tit=getParsedUSFM(titBible);
// const obs = fetchStories("Door43-catalog", "es-419").then((obs) => {
//   console.log({obs,enGlBible,ugntBible,glTn,glTaData,checkingData})
//   const obsNotes = fetchObsNotes("Door43-catalog", "es-419").then((obsNotes) => {
//     const groupData = tsvToGroupData7Cols(obsNotes.content,"obs","path_to_resources",obsNotes.languageCode,"translationNotes",obs.stories,{categorized: true})
//     console.log({groupData})
//   })
// })


const contextId_ = {}

const project = {
  identifier: bookId,
  languageId: 'es-419'
}

const bibles = [
  {
    book: targetBible,
    languageId: 'es-419',
    bibleId: 'obs',
    owner: 'Door43-catalog'
  },
  {
    book: enGlBible,
    languageId: 'en',
    bibleId: 'obs',
    owner: 'unfoldingWord'
  }
]

console.log('CheckerTN.md - startup')

const App = () => {
  const [contextId, setCcontextId] = useState(contextId_)

  const loadLexiconEntry = (key) => {
    console.log(`loadLexiconEntry(${key})`)
  };
  const getLexiconData_ = (lexiconId, entryId) => {
    console.log(`loadLexiconEntry(${lexiconId}, ${entryId})`)
    const entryData = (LexiconData && LexiconData[lexiconId]) ? LexiconData[lexiconId][entryId] : null;
    return { [lexiconId]: { [entryId]: entryData } };
  };

  return (
    <>
      <div style={{ height: '600px', width: '850px' }}>
        <Checker
          styles={{ maxHeight: '500px', overflowY: 'auto' }}
          targetBible={targetBible}
          translate={translate}
          contextId={contextId}
          checkingData={checkingData}
          glWordsData={glTaData}
          alignedGlBible={enGlBible}
          checkType={translationNotes}
          bibles={bibles}
          getLexiconData={getLexiconData_}
        />
      </div>
    </>
  );
};

App();
```
