import usfm from 'usfm-js';
import { checkSelectionOccurrences } from 'selections';
import isEqual from 'deep-equal'
import { getUsfmForVerseContent } from '../helpers/UsfmFileConversionHelpers'
import { getVerses } from 'bible-reference-range'
import { delay } from '../tc_ui_toolkit/ScripturePane/helpers/utils'

/**
 * validata selections in verse string or object
 * @param {String|object} targetVerse - target bible verse.
 * @param {array} selections - array of selection objects [Obj,...]
 * @returns {boolean}
 */
export function validateVerseSelections(targetVerse, selections) {
  if (typeof targetVerse !== 'string') {
    targetVerse = getUsfmForVerseContent(targetVerse)
  }
  const filtered = usfm.removeMarker(targetVerse); // remove USFM markers
  const selectionsChanged = _validateVerseSelections(filtered, selections)
  return selectionsChanged
}


/**
 * validata selections in verse string
 * @param {String} filteredTargetVerse - target bible verse as string.
 * @param {array} selections - array of selection objects [Obj,...]
 * @returns {boolean}
 */
function _validateVerseSelections(filteredTargetVerse, selections) {
  const validSelections = checkSelectionOccurrences(filteredTargetVerse, selections);
  const selectionsChanged = (selections.length !== validSelections.length);
  return selectionsChanged
}

/**
 * verify all selections for current verse
 * @param {string|object} targetVerse - new text for verse
 * @param {string} chapter
 * @param {string} verse
 * @param {string} bookId
 * @param {Object[]} groupsIndex - array of all the checks
 * @param {Function} invalidateCheckCallback
 * @return {boolean}
 */
export const validateAllSelectionsForVerse = (targetVerse, bookId, chapter, verse, groupsIndex = null, invalidateCheckCallback = null) => {
  let filtered = null;
  let _selectionsChanged = false;

  for (let j = 0, lenGI = groupsIndex.length; j < lenGI; j++) {
    const checkingOccurrence = groupsIndex[j];
    const selections = checkingOccurrence.selections;
    const reference = {
      bookId,
      chapter,
      verse
    }

    if (isEqual(reference, checkingOccurrence.contextId?.reference)) {
      if (selections && selections.length) {
        if (!filtered) { // for performance, we filter the verse only once and only if there is a selection
          if (typeof targetVerse !== 'string') {
            targetVerse = getUsfmForVerseContent(targetVerse)
          }
          filtered = usfm.removeMarker(targetVerse); // remove USFM markers
        }

        const selectionsChanged = _validateVerseSelections(filtered, selections);
        if (selectionsChanged) {
          invalidateCheckCallback && invalidateCheckCallback(checkingOccurrence)
          _selectionsChanged = true
        }
      }
    }
  }

  return _selectionsChanged
};

/**
 * verify all selections
 * @param {Object} targetBible - target bible
 * @param {Object[]} groupsIndex - array of all the checks
 * @param {Function} invalidateCheckCallback
 * @return {Promise<boolean>}
 */
export async function validateAllSelections(targetBible,groupsIndex = null, invalidateCheckCallback = null)  {
  let _selectionsChanged = false;
  const filteredVerses = {} // for caching verse content parsed to text

  for (let j = 0, lenGI = groupsIndex.length; j < lenGI; j++) {
    const checkingOccurrence = groupsIndex[j];
    const selections = checkingOccurrence.selections;

    if (selections && selections.length) {
      const reference = checkingOccurrence.reference
      const chapter = reference.chapter
      const verse = reference.verse
      const ref = `${chapter}:${verse}`

      let targetVerse = filteredVerses[ref]
      if (!targetVerse) {
        targetVerse = getVerses(targetBible, ref);
        if (typeof targetVerse !== 'string') {
          targetVerse = getUsfmForVerseContent(targetVerse)
        }
        targetVerse = usfm.removeMarker(targetVerse) // remove USFM markers
        filteredVerses[ref] = targetVerse
      }
      if (targetVerse) {
        const selectionsChanged = _validateVerseSelections(targetVerse, selections)
        if (selectionsChanged) {
          invalidateCheckCallback && invalidateCheckCallback(checkingOccurrence)
          _selectionsChanged = true
        }
        await delay(10)
      }
    }
  }

  return _selectionsChanged
}
