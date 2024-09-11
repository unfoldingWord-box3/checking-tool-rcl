import React from 'react'

/**
 * Look up translation for key value.
 * @param {object} translations - hierarchical object
 * @param {string} key - in format such as 'alert' or 'menu.label'
 * @returns {string}
 */
export function lookupTranslationForKey(translations, key) {
  const translation = `translate(${key})` // set to default value
  const steps = (key || '').split('.') // each level delimted by period
  let current = translations
  let newTranslation = null

  for (let step of steps ) { // drill down through each level
    if (step && current) {
      newTranslation = current[step]
      current = newTranslation
    } else { // not found
      current = null
    }
  }

  if (typeof newTranslation == 'string') {
    return decodeString(newTranslation)
  }
  return translation
}

/**
 * checks for html tags in text, if so it will return it wrapped in div
 * @param text
 * @returns {JSX.Element|string}
 */
function decodeString(text) {
  if (text.indexOf('<')) {
    return <div>{text}</div>
  }
  return text
}
