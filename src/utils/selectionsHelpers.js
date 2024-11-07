import usfm from 'usfm-js';
import { checkSelectionOccurrences } from 'selections';
import isEqual from 'deep-equal'

/**
 *
 * @param {String} filteredTargetVerse - target bible verse.
 * @param {array}  selections - array of selection objects [Obj,...]
 * @returns {boolean}
 */
export function validateVerseSelections(filteredTargetVerse, selections) {
  const validSelections = checkSelectionOccurrences(filteredTargetVerse, selections);
  const selectionsChanged = (selections.length !== validSelections.length);
  return selectionsChanged
}

/**
 * verify all selections for current verse
 * @param {string} targetVerse - new text for verse
 * @param {string} chapter
 * @param {string} verse
 * @param {string} bookId
 * @param {Object[]} groupsIndex - array of all the checks
 * @param {Function} invalidateCheckCallback
 * @return {Function}
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
          filtered = usfm.removeMarker(targetVerse); // remove USFM markers
        }

        const selectionsChanged = validateVerseSelections(filtered, selections);
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
 * @param {string} targetVerse - new text for verse
 * @param {Object[]} groupsIndex - array of all the checks
 * @param {Function} invalidateCheckCallback
 * @return {Function}
 */
export const validateAllSelections = (targetVerse, groupsIndex = null, invalidateCheckCallback = null) => {
  let _selectionsChanged = false;

  for (let j = 0, lenGI = groupsIndex.length; j < lenGI; j++) {
    const checkingOccurrence = groupsIndex[j];
    const selections = checkingOccurrence.selections;

    if (selections && selections.length) {
      const filtered = usfm.removeMarker(targetVerse); // remove USFM markers

      const selectionsChanged = validateVerseSelections(filtered, selections);
      if (selectionsChanged) {
        invalidateCheckCallback && invalidateCheckCallback(checkingOccurrence)
        _selectionsChanged = true
      }
    }
  }

  return _selectionsChanged
};

