import React, {
  useEffect,
  useMemo,
  useState
} from 'react'
import PropTypes from 'prop-types';
import _ from 'lodash'
import CheckArea from '../tc_ui_toolkit/VerseCheck/CheckArea'
import ActionsArea from '../tc_ui_toolkit/VerseCheck/ActionsArea'
import GroupMenuComponent from './GroupMenuComponent'
import { getBestVerseFromBook } from '../helpers/verseHelpers'
import { removeUsfmMarkers } from '../utils/usfmHelpers'
import isEqual from 'deep-equal'
import {
  findCheck,
  findNextCheck,
  flattenGroupData,
  getAlignedGLText,
  getPhraseFromTw,
  getTitleFromIndex,
  parseTwToIndex
} from '../helpers/translationHelps/twArticleHelpers'
import CheckInfoCard from '../tc_ui_toolkit/CheckInfoCard'
import { parseTnToIndex } from '../helpers/translationHelps/tnArticleHelpers'
import ScripturePane from '../tc_ui_toolkit/ScripturePane'
import PopoverContainer from '../containers/PopoverContainer'
import { isNT, NT_ORIG_LANG, OT_ORIG_LANG } from '../common/BooksOfTheBible'
import complexScriptFonts from '../common/complexScriptFonts'
import TranslationHelps from '../tc_ui_toolkit/TranslationHelps'
import * as tHelpsHelpers from '../helpers/tHelpsHelpers'
import { getUsfmForVerseContent } from '../helpers/UsfmFileConversionHelpers'
import * as AlignmentHelpers from '../utils/alignmentHelpers'
import * as UsfmFileConversionHelpers from '../utils/UsfmFileConversionHelpers'
import VerseCheck from '../tc_ui_toolkit/VerseCheck'

const localStyles = {
  containerDiv:{
    display: 'flex',
    flexDirection: 'row',
    width: '97vw',
    height: '65vw',
  },
  centerDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '85%',
    overflowX: 'auto',
    marginLeft: '10px',
  },
  scripturePaneDiv: {
    display: 'flex',
    flexShrink: '0',
    height: '250px',
    paddingBottom: '20px',
  },
};

export const translationWords = 'translationWords'
export const translationNotes = 'translationNotes'

console.log('Checker.js - startup')
const name = 'Checker'

const Checker = ({
  alignedGlBible,
  bibles: bibles_,
  changeTargetVerse,
  checkingData,
  checkType,
  contextId,
  getLexiconData,
  glWordsData,
  initialSettings,
  saveCheckingData,
  saveSettings,
  showDocument,
  styles,
  targetBible: targetBible_,
  targetLanguageDetails,
  translate,
}) => {
  const [settings, _setSettings] = useState({
    paneSettings: [],
    paneKeySettings: {},
    toolsSettings: {},
    manifest: {}
  })
  const {
    paneSettings,
    paneKeySettings,
    toolsSettings,
    manifest
  } = settings
  const [bibles, setBibles] = useState({ })
  const [targetBible, setTargetBible] = useState(targetBible_)
  const [state, _setState] = useState({
    alignedGLText: '',
    article: null,
    check: null,
    currentCheck: null,
    currentCheckingData: null,
    groupTitle: '',
    groupPhrase: '',
    groupsData: null,
    groupsIndex: null,
    isCommentChanged: false,
    localNothingToSelect: false,
    mode: 'default',
    modified: false,
    newComment: '',
    newSelections: null,
    nothingToSelect: false,
    popoverProps: {
      popoverVisibility: false
    },
    selections: null,
    showHelpsModal: false,
    showHelps: true,
    verseText: '',
  })

  const {
    alignedGLText,
    article,
    check,
    currentCheck,
    currentCheckingData,
    groupTitle,
    groupPhrase,
    groupsData,
    groupsIndex,
    localNothingToSelect,
    isCommentChanged,
    mode,
    modified,
    newComment,
    newSelections,
    nothingToSelect,
    popoverProps,
    selections,
    showHelpsModal,
    showHelps,
    verseText,
  } = state

  function setState(newState) {
    _setState(prevState => ({ ...prevState, ...newState }))
  }

  function updateModeForSelections(newSelections) {
    const noSelections = (!newSelections.length)
    const newMode = noSelections ? 'select' : 'default'
    setState({
      mode: newMode
    })
  }

  useEffect(() => {
    if (contextId && checkingData && glWordsData) {
      let flattenedGroupData = null
      let newSelections = null
      let groupsIndex = null
      if (checkingData) {
        flattenedGroupData = flattenGroupData(checkingData)
      }

      const check = findCheck(flattenedGroupData, contextId, true)
      if (glWordsData) {
        if (checkType === translationNotes) {
          groupsIndex = parseTnToIndex(glWordsData)
        } else {
          groupsIndex = parseTwToIndex(glWordsData)
        }
      }

      const newState = {
        groupsData: flattenedGroupData,
        groupsIndex,
        currentCheckingData: checkingData,
        check,
        modified: false,
      }

      if (check) { // if found a match, use the selections
        newSelections = check.selections || []
        newState.selections = newSelections
        newState.newSelections = newSelections
      }

      setState(newState)

      if (flattenedGroupData && check?.contextId) {
        updateContext(check, groupsIndex)
        updateModeForSelections(newSelections)
      }
    }
  }, [contextId, checkingData, glWordsData]);

  function updateContext(newCheck, groupsIndex_ = groupsIndex) {
    const contextId = newCheck?.contextId
    const reference = contextId?.reference
    let verseText = getBestVerseFromBook(targetBible, reference?.chapter, reference?.verse)
    if (typeof verseText !== 'string') {
      console.log(`updateContext- verse data is not text`)
      verseText = getUsfmForVerseContent(verseText)
    }
    verseText = removeUsfmMarkers(verseText)
    const alignedGLText = getAlignedGLText(alignedGlBible, contextId);
    const groupTitle = getTitleFromIndex(groupsIndex_, contextId?.groupId)
    const groupPhrase =
      checkType === translationNotes
        ? contextId?.occurrenceNote
        : getPhraseFromTw(glWordsData, contextId?.groupId)

    let groupData
    if (glWordsData) {
      if (checkType === translationNotes) {
        groupData = {
          translate: {
            articles: glWordsData?.translate
          }
        }
      } else {
        groupData = {
          ...glWordsData,
          manifest: {}
        }
      }
    }

    let _article
    const articleId = contextId?.groupId
    const groupsIds = Object.keys(groupData)
    for (const _groupId of groupsIds) {
      const group = groupData[_groupId]
      const articles = group?.articles || {}
      _article = articles?.[articleId] || null
      if (_article) {
        const currentArticleMarkdown = tHelpsHelpers.convertMarkdownLinks(_article, gatewayLanguageId);
        _article = currentArticleMarkdown
        // const tHelpsModalMarkdown = tHelpsHelpers.convertMarkdownLinks(modalArticle, gatewayLanguageCode, articleCategory);
        break
      }
    }

    setState({
      alignedGLText,
      currentCheck: newCheck,
      verseText,
      groupTitle,
      groupPhrase,
      article: _article
    })
  }

  const tags = [];
  const commentText = '';
  const invalidated = false;
  const bookId = targetLanguageDetails?.book?.id
  const bookName = targetLanguageDetails?.book?.name
  const bookDetails = {
    id: bookId,
    name: bookName
  };
  const gatewayLanguageId = targetLanguageDetails?.gatewayLanguageId
  const gatewayLanguageOwner = targetLanguageDetails?.gatewayLanguageOwner

  const isVerseChanged = false;
  const setToolSettings = (NAMESPACE, fieldName, fieldValue) => {
    console.log(`${name}-setToolSettings ${fieldName}=${fieldValue}`)
    if (toolsSettings) {
      // Deep cloning object to avoid modifying original object
      const _toolsSettings = { ...toolsSettings };
      let componentSettings = _toolsSettings?.[NAMESPACE]
      if (!componentSettings) {
        componentSettings = { }
        _toolsSettings[NAMESPACE] = componentSettings
      }
      componentSettings[fieldName] = fieldValue
      setSettings({ toolsSettings: _toolsSettings }, true)
    }
  }

  /**
   * clear out bible data before saving settings
   * @param {object} _settings
   * @private
   */
  function _saveSettings(_settings) {
    if (saveSettings && _settings) {
      const newSettings = { ..._settings }
      const _paneSettings = [ ...newSettings.paneSettings ]
      for (let i = 0; i < _paneSettings.length; i++) {
        const _paneSetting = {..._paneSettings[i]} // shallow copy
        if (_paneSetting?.book) {
          delete _paneSetting.book // remove all the book data before saving
        }
        _paneSettings[i] = _paneSetting
      }
      newSettings.paneSettings = _paneSettings

      const _paneKeySettings = { ...newSettings.paneKeySettings }
      const keys = Object.keys(_paneKeySettings)
      for (const key of keys) {
        const _paneSetting = {..._paneKeySettings[key]} // shallow copy
        if (_paneSetting?.book) {
          delete _paneSetting.book // remove all the book data before saving
        }
        _paneKeySettings[key] = _paneSetting
      }
      newSettings.paneKeySettings = _paneKeySettings

      saveSettings(newSettings)
    }
  }

  function setSettings(newSettings, doSave = false) {
    const _settings = {
      ...settings,
      ...newSettings
    }

    _setSettings(_settings)
    doSave && _saveSettings(_settings)
  }

  const setToolSettingsScripture = (NAMESPACE, fieldName, _paneSettings) => {
    console.log(`${name}-setToolSettingsScripture ${fieldName}`, _paneSettings)
    const _paneKeySettings = {...paneKeySettings}

    for (const paneSettings of _paneSettings) {
      const languageId = paneSettings?.languageId
      const key = `${languageId}/${paneSettings?.bibleId}/${paneSettings?.owner}`
      _paneKeySettings[key] = paneSettings
    }

    const _settings = {
      paneSettings: _paneSettings,
      paneKeySettings: _paneKeySettings,
    }

    setSettings(_settings, true)
  }

  const addObjectPropertyToManifest = (fieldName, fieldValue) => {
    console.log(`${name}-addObjectPropertyToManifest ${fieldName}=${fieldValue}`)
    if (manifest) {
      const _manifest = {
        ...manifest,
        [fieldName]: fieldValue
      }
      setSettings({ manifest: _manifest }, true)
    }
  }

  const openAlertDialog = () => {
    console.log(`${name}-openAlertDialog`)
  }
  const handleEditVerse = () => {
    console.log(`${name}-handleEditVerse`)
  }
  const maximumSelections = 10
  const isVerseInvalidated = false
  const handleTagsCheckbox = () => {
    console.log(`${name}-handleTagsCheckbox`)
  }
  const validateSelections = (selections_) => {
    console.log(`${name}-validateSelections`, selections_)
  }
  const targetLanguageFont = manifest?.projectFont || ''

  const unfilteredVerseText = useMemo(() => {
    let unfilteredVerseText_ = ''
    const reference = currentContextId?.reference
    const chapter = reference?.chapter
    const verse = reference?.verse
    if (chapter && verse) {
      const verseData = targetBible?.[chapter]?.[verse]
      if (verseData) {
        unfilteredVerseText_ = verseData
        if (typeof verseData !== 'string') {
          unfilteredVerseText_ = getUsfmForVerseContent(verseData)
        }
      }
    }

    return unfilteredVerseText_
  }, [targetBible, currentContextId])

  const checkIfVerseChanged = () => {
    console.log(`${name}-checkIfVerseChanged`)
  }

  const checkIfCommentChanged = () => {
    console.log(`${name}-checkIfCommentChanged`)
  }
  const changeSelectionsInLocalState = (selections_) => {
    console.log(`${name}-changeSelectionsInLocalState`, selections_)
    setState({
      newSelections: selections_,
    });
  }
  const toggleNothingToSelect = (select) => {
    console.log(`${name}-toggleNothingToSelect`, select)
    setState({ localNothingToSelect: select })
  }

  const changeCurrentCheck = (newContext, noCheck = false) => {
    const newContextId = newContext?.contextId
    console.log(`${name}-changeCurrentContextId`, newContextId)

    const selectionsUnchanged = isEqual(selections, newSelections)
    if (noCheck || selectionsUnchanged) {
      if (newContextId) {
        let check = findCheck(groupsData, newContextId, false)
        updateContext(newContext)
        if (check) {
          const newSelections = check.selections || []
          setState({
            newSelections,
            selections: newSelections,
          })
          updateModeForSelections(newSelections)
        }
      }
    } else {
      console.log('Checker.changeCurrentContextId - unsaved changes')
    }
  }
  const direction = 'ltr'

  const currentContextId = currentCheck?.contextId
  const bookmarkEnabled = currentCheck?.reminders
  const isVerseEdited = currentCheck?.verseEdits

  const _saveSelection = () => {
    console.log(`${name}-saveSelection persist to file`)
    const newGroupsData = _.cloneDeep(groupsData);
    const checkInGroupsData = findCheck(newGroupsData, currentContextId)
    if (checkInGroupsData) {
      //save the selection changes
      const category = checkInGroupsData.category
      const newCheckData = _.cloneDeep(currentCheckingData);
      const checkInCheckingData = findCheck(newCheckData[category], currentContextId, false)
      if (checkInCheckingData) {
        checkInCheckingData.selections = newSelections
        checkInGroupsData.selections = newSelections
        const nextCheck = findNextCheck(groupsData, currentContextId, false)
        const nextContextId = nextCheck?.contextId
        const newState = {
          currentCheckingData: newCheckData,
          currentCheck: checkInCheckingData,
          groupsData: newGroupsData,
          mode: 'default',
          modified: true,
          nextContextId,
          selections: newSelections,
        }
        setState(newState);
        saveCheckingData && saveCheckingData(newState)

        if (nextContextId) {
          changeCurrentCheck(nextCheck, true)
        }
      }
    }
  }

  const _saveData = (key, value) => {
    console.log(`${name}-saveSelection persist to file`)
    const newGroupsData = _.cloneDeep(groupsData);
    const checkInGroupsData = findCheck(newGroupsData, currentContextId)
    if (checkInGroupsData) {
      //save the selection changes
      const category = checkInGroupsData.category
      const newCheckData = _.cloneDeep(currentCheckingData);
      const checkInCheckingData = findCheck(newCheckData[category], currentContextId, false)
      if (checkInCheckingData) {
        checkInCheckingData[kwy] = value
        checkInGroupsData[kwy] = value
        const newState = {
          currentCheckingData: newCheckData,
          currentCheck: checkInCheckingData,
          groupsData: newGroupsData,
          mode: 'default',
          modified: true,
          selections: newSelections,
        }
        setState(newState);
        saveCheckingData && saveCheckingData(newState)
      }
    }
  }

  const cancelSelection = () => {
    console.log(`${name}-cancelSelection`)
    setState({
      newSelections: selections,
      mode: 'default'
    });
  }

  const clearSelection = () => {
    console.log(`${name}-clearSelection`)
    setState({ newSelections: [] });
  }

  const toggleBookmark = () => {
    console.log(`${name}-toggleBookmark`)
    _saveData('reminders', !currentCheck?.reminders)
  }

  const changeMode = (mode) => {
    console.log(`${name}-changeMode`, mode)
    setState({ mode })
  }

  const cancelEditVerse = () => {
    console.log(`${name}-cancelEditVerse`)
  }

  const saveEditVerse = () => {
    console.log(`${name}-saveEditVerse`)
  }

  const cancelComment = () => {
    console.log(`${name}-cancelComment`)
    setState({
      mode: 'default',
      newComment: '',
      isCommentChanged: false,
    });
  }
  const saveComment = () => {
    console.log(`${name}-saveComment`)
    _saveData('comments', newComment)
    setState({
      mode: 'default',
      newComment: '',
      isCommentChanged: false,
    });
  }

  const handleComment = () => {
    e.preventDefault();
    console.log(`${name}-handleComment`)
    setState({ newComment: e.target.value });
  }

  const readyToDisplayChecker = groupsData && groupsIndex && currentContextId && verseText

  const getLexiconData_ = (lexiconId, entryId) => {
    console.log(`${name}-getLexiconData_`, {lexiconId, entryId})
    const lexiconData = getLexiconData && getLexiconData(lexiconId, entryId)
    return lexiconData
  }

  const onClosePopover = () => {
    console.log(`${name}-onClosePopover`)
    setState({
      popoverProps: {
        popoverVisibility: false,
      }
    })
  }

  const showPopover = (title, bodyText, positionCoord) => {
    console.log(`${name}-showPopover`, title)
    setState({
      popoverProps: {
        popoverVisibility: true,
        title,
        bodyText,
        positionCoord,
        onClosePopover: () => onClosePopover()
      }
    })
  }

  const toggleHelpsModal = () => {
    const _showHelpsModal = !showHelpsModal
    setState({
      showHelpsModal: _showHelpsModal
    })
  }

  const toggleHelps = () => {
    const _showHelps = !showHelps
    setState({
      showHelps: _showHelps
    })
  }

  function saveBibleToKey(bibles, key, bibleId, book) {
    let keyGroup = bibles[key]
    if (!keyGroup) { // if group does not exist, create new
      keyGroup = {}
      bibles[key] = keyGroup
    }
    keyGroup[bibleId] = book
  }

  /**
   * change content of verse
   * @param {string} chapter
   * @param {string} verse
   * @param {string} oldVerseText
   * @param {string} newVerseText
   */
  function editTargetVerse(chapter, verse, oldVerseText, newVerseText) {
    console.log(`editTargetVerse ${chapter}:${verse} - changed to ${newVerseText}`)

    //////////////////////////////////
    // first update component state

    const _bibles = [ ...bibles_]
    const _targetBible = {..._bibles[0]}
    _bibles[0] = _targetBible
    const targetBook = {..._targetBible?.book}
    _targetBible.book = targetBook
    const targetChapter = {...targetBook[chapter]}
    targetBook[chapter] = targetChapter
    targetChapter[verse] = newVerseText
    updateSettings(_bibles, targetBook)

    const verseText = removeUsfmMarkers(newVerseText)
    setState({
      verseText
    })

    //////////////////////////////////
    // now apply new verse text to selected aligned verse and call back to extension to save

    let _newVerseText = newVerseText
    if (typeof _newVerseText !== 'string') {
      _newVerseText = UsfmFileConversionHelpers.convertVerseDataToUSFM(_newVerseText)
    }

    const currentChapterData = targetBible?.[chapter]
    const currentVerseData = currentChapterData?.[verse]
    const { targetVerseObjects } = AlignmentHelpers.updateAlignmentsToTargetVerse(currentVerseData, _newVerseText)

    changeTargetVerse && changeTargetVerse(chapter, verse, newVerseText, targetVerseObjects)
  }

  function updateSettings(newBibles, targetBible) {
    const _bibles = {}
    let _paneSettings = []
    const _paneKeySettings = initialSettings?.paneKeySettings || {}
    if (newBibles?.length) {
      for (const bible of newBibles) {
        let languageId = bible?.languageId
        const owner = bible?.owner
        const book = bible?.book
        const bibleId = bible?.bibleId
        if (languageId === NT_ORIG_LANG || languageId === OT_ORIG_LANG) {
          languageId = 'originalLanguage'
        }
        const key = `${languageId}/${bibleId}/${owner}`
        const intialPaneSettings = _paneKeySettings?.[key]
        const langKey = `${languageId}_${owner}`
        saveBibleToKey(_bibles, langKey, bibleId, book)
        saveBibleToKey(_bibles, languageId, bibleId, book) // also save as default for language without owner
        const pane = intialPaneSettings || {
          ...bible,
          languageId
        }
        _paneSettings.push(pane)
        if (!intialPaneSettings) {
          _paneKeySettings[key] = pane
        }
      }
    } else {
      _paneSettings = []
    }

    const _toolsSettings = initialSettings?.toolsSettings ||
      {
        'CheckArea': {
          'fontSize': 100
        }
      }

    const _manifest = initialSettings?.manifest ||
      {
        language_name: targetBible?.manifest?.dublin_core?.language?.title || 'Current',
        projectFont: targetBible?.manifest?.projectFont || ''
      }

    setBibles(_bibles)
    setTargetBible(targetBible)
    setSettings({
      paneSettings: _paneSettings,
      paneKeySettings: _paneKeySettings,
      toolsSettings: _toolsSettings,
      manifest: _manifest,
      newComment: '',
    }, false)
  }

  useEffect(() => {
    updateSettings(bibles_, targetBible_)
  }, [bibles_, targetBible_])

  // build the title
  const { target_language, project } = manifest;
  let expandedScripturePaneTitle = project?.title || '';

  if (target_language?.book?.name) {
    expandedScripturePaneTitle = target_language.book.name;
  }


  const styleProps = styles || {}
  const _checkerStyles = {
    ...localStyles.containerDiv,
    ...styleProps,
  }

  return (
    readyToDisplayChecker ?
      <div id='checker' style={_checkerStyles}>
        <GroupMenuComponent
          bookName={bookName}
          changeCurrentContextId={changeCurrentCheck}
          contextId={currentContextId}
          direction={direction}
          groupsData={groupsData}
          groupsIndex={groupsIndex}
          targetLanguageFont={targetLanguageFont}
          translate={translate}
        />
        <div style={localStyles.centerDiv}>
          { bibles && Object.keys(bibles).length &&
            <div style={localStyles.scripturePaneDiv}>
              <ScripturePane
                addObjectPropertyToManifest={addObjectPropertyToManifest}
                bibles={bibles}
                complexScriptFonts={complexScriptFonts}
                contextId={currentContextId}
                currentPaneSettings={paneSettings}
                editVerseRef={null}
                editTargetVerse={editTargetVerse}
                expandedScripturePaneTitle={expandedScripturePaneTitle}
                getAvailableScripturePaneSelections={null}
                getLexiconData={getLexiconData_}
                makeSureBiblesLoadedForTool={null}
                projectDetailsReducer={{ manifest }}
                selections={selections}
                setToolSettings={setToolSettingsScripture}
                showPopover={showPopover}
                onExpandedScripturePaneShow={null}
                translate={translate}
              />
            </div>
          }
          <div>
            <CheckInfoCard
              getScriptureFromReference={null}
              onLinkClick={() => false}
              onSeeMoreClick={() => false}
              phrase={groupPhrase}
              seeMoreLabel={translate('see_more')}
              showSeeMoreButton={false}
              title={groupTitle}
            />
            <VerseCheck
              alignedGLText={alignedGLText}
              bookDetails={bookDetails}
              bookmarkEnabled={bookmarkEnabled}
              cancelEditVerse={cancelEditVerse}
              cancelComment={cancelComment}
              cancelSelection={cancelSelection}
              changeMode={changeMode}
              changeSelectionsInLocalState={changeSelectionsInLocalState}
              checkIfCommentChanged={checkIfCommentChanged}
              checkIfVerseChanged={checkIfVerseChanged}
              clearSelection={clearSelection}
              commentText={commentText}
              contextId={currentContextId}
              dialogModalVisibility = {false}
              isCommentChanged={isCommentChanged}
              isVerseChanged={isVerseChanged}
              isVerseEdited={isVerseEdited}
              handleEditVerse={handleEditVerse}
              handleGoToNext={null}
              handleGoToPrevious={null}
              handleOpenDialog={null}
              isVerseInvalidated={isVerseInvalidated}
              handleCloseDialog={null}
              handleComment={handleComment}
              handleSkip={null}
              handleTagsCheckbox={handleTagsCheckbox}
              localNothingToSelect={localNothingToSelect}
              manifest={manifest}
              maximumSelections={maximumSelections}
              mode={mode}
              newSelections={newSelections}
              nothingToSelect={nothingToSelect}
              openAlertDialog={openAlertDialog}
              saveComment={saveComment}
              saveEditVerse={saveEditVerse}
              saveSelection={_saveSelection}
              selections={selections}
              setToolSettings={setToolSettings}
              tags={tags}
              targetBible={targetBible}
              targetLanguageDetails={targetLanguageDetails}
              toggleBookmark={toggleBookmark}
              toggleNothingToSelect={toggleNothingToSelect}
              toolsSettings={toolsSettings}
              translate={translate}
              unfilteredVerseText={unfilteredVerseText}
              validateSelections={validateSelections}
              verseText={verseText}
            />
          </div>
        </div>
        {showDocument && <TranslationHelps
          modalArticle={article}
          article={article}
          expandedHelpsButtonHoverText={'Click to show expanded help pane'}
          modalTitle={'translationHelps'}
          translate={translate}
          isShowHelpsExpanded={showHelpsModal}
          openExpandedHelpsModal={toggleHelpsModal}
          sidebarToggle={toggleHelps}
          isShowHelpsSidebar={showHelps}
        />}
        { popoverProps?.popoverVisibility &&
          <PopoverContainer {...popoverProps} />
        }
      </div>
      :
      'Waiting for Data'
  );
};

Checker.propTypes = {
  styles:PropTypes.object,
  alignedGlBible: PropTypes.object,
  bibles: PropTypes.array,
  changeTargetVerse: PropTypes.func,
  checkingData: PropTypes.object.isRequired,
  checkType: PropTypes.string,
  contextId: PropTypes.object.isRequired,
  glWordsData: PropTypes.object.isRequired,
  getLexiconData: PropTypes.func,
  initialSettings: PropTypes.object,
  saveCheckingData: PropTypes.func,
  saveSettings: PropTypes.func,
  showDocument: PropTypes.bool,
  targetBible: PropTypes.object.isRequired,
  targetLanguageDetails: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
};
export default Checker;
