import { parse } from 'yaml'

export function pad(num) {
  return String(num).padStart(2, '0')
}

export function warn(message) {
  const debug = false
  if (debug) alert(message)
}

export const fetchObsNotes = async (owner, languageCode) => {
  console.log('Loading notes from internet')
  const latestRelease = await getLatestRelease(owner, languageCode)
  const latestVersion = await getLatestVersion(
    owner,
    languageCode,
    latestRelease['tag_name']
  )

  const tsvFileUrl = `https://git.door43.org/${owner}/${languageCode}_obs-tn/raw/tag/${latestRelease['tag_name']}/tn_OBS.tsv`
  const tsvFileContents = await (await fetch(tsvFileUrl)).text()

  const result = {
    content: tsvFileContents,
    metadata: { version: latestVersion, languageCode, owner, tsvFileUrl },
  }

  return result
}

export const getLatestRelease = async (owner, languageCode) => {
  const latestRelease = await (
    await fetch(
      `https://git.door43.org/api/v1/repos/${owner}/${languageCode}_obs-tn/releases/latest?pre-release=false`
    ).catch(e => warn(e))
  )?.json()
  return latestRelease
}

export const getLatestVersion = async (owner, languageCode, tagName) => {
  const latestManifest = await (
    await fetch(
      `https://git.door43.org/api/v1/repos/${owner}/${languageCode}_obs-tn/raw/manifest.yaml?ref=${tagName}`
    ).catch(e => warn(e))
  )?.text()

  const latestVersion = getVersionFromYamlManifest(latestManifest)

  return latestVersion
}

const getVersionFromYamlManifest = yaml => {
  const manifest = parse(yaml)
  return manifest['dublin_core']?.version
}
