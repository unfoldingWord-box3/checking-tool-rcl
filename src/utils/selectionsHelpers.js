import usfm from 'usfm-js';
import isEqual from 'deep-equal'
import { getUsfmForVerseContent } from '../helpers/UsfmFileConversionHelpers'
import { getVerses } from 'bible-reference-range'
import { delay } from '../tc_ui_toolkit/ScripturePane/helpers/utils'
import { checkSelectionOccurrences } from './selections'

/**
 * validata selections in verse string or object
 * @param {String|object} targetVerse - target bible verse.
 * @param {array} selections - array of selection objects [Obj,...]
 * @returns {object}
 */
export function validateVerseSelections(targetVerse, selections) {
  if (typeof targetVerse !== 'string') {
    targetVerse = getUsfmForVerseContent(targetVerse)
  }
  const filtered = usfm.removeMarker(targetVerse); // remove USFM markers
  const selectionsResults = _validateVerseSelections(filtered, selections)
  return selectionsResults
}


/**
 * validata selections in verse string
 * @param {String} filteredTargetVerse - target bible verse as string.
 * @param {array} selections - array of selection objects [Obj,...]
 * @returns {object}
 */
function _validateVerseSelections(filteredTargetVerse, selections) {
  const validSelections = checkSelectionOccurrences(filteredTargetVerse, selections);
  const selectionsChanged = (selections.length !== validSelections.length);
  return { selectionsChanged, validSelections }
}

/**
 * verify all selections for current verse
 * @param {string|object} targetVerse - new text for verse
 * @param {string} chapter
 * @param {string} verse
 * @param {string} bookId
 * @param {Object} groupsData - all the checks keyed by catagory
 * @param {Function} invalidateCheckCallback
 * @return {boolean}
 */
export const validateAllSelectionsForVerse = (targetVerse, bookId, chapter, verse, groupsData = null, invalidateCheckCallback = null) => {
  let filtered = null;
  let _selectionsChanged = false;

  const groupIds = Object.keys(groupsData)
  for (const groupId of groupIds) {
    const checks = groupsData[groupId]

    for (let j = 0, lenGI = checks.length; j < lenGI; j++) {
      const checkingOccurrence = checks[j]
      const selections = checkingOccurrence.selections
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
            filtered = usfm.removeMarker(targetVerse) // remove USFM markers
          }

          const { selectionsChanged } = _validateVerseSelections(filtered, selections)
          if (selectionsChanged) {
            invalidateCheckCallback && invalidateCheckCallback(checkingOccurrence)
            _selectionsChanged = true
          }
        }
      }
    }
  }
  return _selectionsChanged
};

/**
 * verify all selections
 * @param {Object} targetBible - target bible
 * @param {Object} groupsData - all the checks keyed by catagory
 * @param {Function} invalidateCheckCallback
 * @return {Promise<boolean>}
 */
export async function validateAllSelections(targetBible, groupsData = null, invalidateCheckCallback = null)  {
  let _selectionsChanged = false;
  const filteredVerses = {} // for caching verse content parsed to text

  const groupIds = Object.keys(groupsData)
  for (const groupId of groupIds) {
    const checks = groupsData[groupId]

    for (let j = 0, lenGI = checks.length; j < lenGI; j++) {
      const checkingOccurrence = checks[j];
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
          const { selectionsChanged } = _validateVerseSelections(targetVerse, selections)
          if (selectionsChanged) {
            invalidateCheckCallback && invalidateCheckCallback(checkingOccurrence)
            _selectionsChanged = true
          }
          await delay(10)
        }
      }
    }
  }

  return _selectionsChanged
}
