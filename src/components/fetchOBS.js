import JSZipUtils from 'jszip-utils'
import JSZip from 'jszip'
import { parse } from 'yaml'
import { VerseObjectUtils } from 'word-aligner'
import * as tokenizer from 'string-punctuation-tokenizer'
import { greedyWord } from 'string-punctuation-tokenizer/lib/tokenizers'

export function pad(num) {
  return String(num).padStart(2, '0')
}

export function warn(message) {
  const debug = false
  if (debug) alert(message)
}

export const fetchStories = async (owner, languageCode) => {
  console.log('Loading stories from internet')
  const latestRelease = await getLatestRelease(owner, languageCode)
  const latestVersion = await getLatestVersion(
    owner,
    languageCode,
    latestRelease['tag_name']
  )

  const storiesUrl = latestRelease['zipball_url']
  const result = {
    stories: {},
    alignedStories: {},
    tokenizedStories: {},
    metadata: { version: latestVersion, languageCode, owner, storiesUrl },
  }
  const obsFiles = await getZipFiles(storiesUrl)

  for (const fileName in obsFiles) {
    if (Object.hasOwnProperty.call(obsFiles, fileName)) {
      if (fileName.match(/\/content\/\d/gm)) {
        const name = Number(fileName.slice(-5, -3))
        const { alignedFrames, frames, tokenizedframes } = getStoryFromString(
          await obsFiles[fileName].async('string')
        )
        result.stories[name] = frames
        result.alignedStories[name] = alignedFrames
        result.tokenizedStories[name] = tokenizedframes
      }
    }
  }
  return result
}

export const getLatestRelease = async (owner, languageCode) => {
  const latestRelease = await (
    await fetch(
      `https://git.door43.org/api/v1/repos/${owner}/${languageCode}_obs/releases/latest?pre-release=true`
    ).catch(e => warn(e))
  )?.json()
  return latestRelease
}

export const getLatestVersion = async (owner, languageCode, tagName) => {
  const latestManifest = await (
    await fetch(
      `https://git.door43.org/api/v1/repos/${owner}/${languageCode}_obs/raw/manifest.yaml?ref=${tagName}`
    ).catch(e => warn(e))
  )?.text()

  const latestVersion = getVersionFromYamlManifest(latestManifest)

  return latestVersion
}

const getZipFiles = async url => {
  const data = await JSZipUtils?.getBinaryContent(url)
  var zip = new JSZip()
  await zip.loadAsync(data)
  return zip.files
}

const getVersionFromYamlManifest = yaml => {
  const manifest = parse(yaml)
  return manifest['dublin_core']?.version
}

const getStoryFromString = obsString => {
  let _markdown = obsString.replaceAll('\u200B', '').split(/\n\s*\n\s*/)
  const title = _markdown.shift().trim().slice(1)
  let bibleReference = _markdown.pop().trim().slice(1, -1)
  if (bibleReference === '') {
    bibleReference = _markdown.pop().trim().slice(1, -1)
  }
  let frameRef = 0
  let frames = {}
  let tokenizedframes = {}
  let alignedFrames = {}
  for (let i = 0; i < _markdown.length; i++) {
    if (_markdown[i].includes('[OBS Image]') === true) {
      frameRef++
    } else if (frameRef > 0) {
      const frameText = _markdown[i]
      const { aligned, tokens } = tokenizeObs(frameText)
      frames = {
        ...frames,
        [frameRef]: frameText,
      }
      tokenizedframes = {
        ...tokenizedframes,
        [frameRef]: { verseObjects: tokens },
      }
      alignedFrames = {
        ...alignedFrames,
        [frameRef]: { verseObjects: aligned },
      }
    }
  }
  return { frames, alignedFrames, tokenizedframes }
}

function tokenizeObs(text) {
  var wordObjectArray = tokenizer
    .tokenize({
      text,
      greedy: true,
      includePunctuation: true,
      includeWhitespace: true,
      includeNumbers: true,
      occurrences: true,
      verbose: true,
    })
    .reduce(
      function (verseObjects, token, index, tokens) {
        if (token.type === 'word' || token.type === 'number') {
          const word = {
            text: token.token,
            type: 'word',
            tag: 'w',
            occurrence: token.occurrence,
            occurrences: token.occurrences,
          }
          verseObjects.tokens.push(word)
          verseObjects.aligned.push({
            tag: 'zaln',
            type: 'milestone',
            strong: '',
            lemma: word.text,
            morph: '',
            occurrence: word.occurrence,
            occurrences: word.occurrences,
            content: word.text,
            children: [word],
            endTag: 'zaln-e\\*',
          })
        }
        if (token.type === 'punctuation' || token.type === 'whitespace') {
          if (
            verseObjects.tokens[verseObjects.tokens.length - 1]?.type === 'text'
          ) {
            verseObjects.tokens[verseObjects.tokens.length - 1].text +=
              token.token
            verseObjects.aligned[verseObjects.aligned.length - 1] =
              verseObjects.tokens[verseObjects.tokens.length - 1]
            return verseObjects
          }
          const text = {
            text: token.token,
            type: 'text',
          }
          verseObjects.tokens.push(text)
          verseObjects.aligned.push(text)
        }
        return verseObjects
      },
      { aligned: [], tokens: [] }
    )
  return wordObjectArray
}

// const getStoryFromString = obsString => {
//   let _markdown = obsString.replaceAll('\u200B', '').split(/\n\s*\n\s*/)
//   const title = _markdown.shift().trim().slice(1)
//   let bibleReference = _markdown.pop().trim().slice(1, -1)
//   if (bibleReference === '') {
//     bibleReference = _markdown.pop().trim().slice(1, -1)
//   }
//   let frameRef = 0
//   let frames = {}
//   let imageLinks = {}
//   for (let i = 0; i < _markdown.length; i++) {
//     if (_markdown[i].includes('[OBS Image]') === true) {
//       frameRef++
//       imageLinks = {
//         ...imageLinks,
//         [frameRef]: _markdown[i].replace(/!\[OBS Image\]\((.+?)\)/, '$1'),
//       }
//     } else if (frameRef > 0) {
//       frames = {
//         ...frames,
//         [frameRef]: frames[frameRef]
//           ? frames[frameRef] + '\n' + _markdown[i]
//           : _markdown[i],
//       }
//     }
//   }
//   return { title, frames, imageLinks, bibleReference }
// }
