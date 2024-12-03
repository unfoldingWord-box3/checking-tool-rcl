import React from 'react';
import PropTypes from 'prop-types';
import ContainerDimensions from 'react-container-dimensions';
import {
  getTitleWithId, getTranslation, isLTR,
} from '../helpers/utils';
import Verse from '../Verse';
import ThreeDotMenu from '../ThreeDotMenu';
import './Pane.styles.css';
// constants
const PANECHAR = 9;

/**
 * create content for title container with selected overall justification
 * @param {boolean} isLTR - justification to use, if true do LTR
 * @param {string} headingText
 * @param {string} localizedDescription
 * @param {string} fontClass
 * @param {string} fullTitle
 * @return {*}
 */
function getTitleContainerContent(isLTR, headingText, localizedDescription, fontClass, fullTitle) {
  const styles = { textAlign: isLTR ? 'left' : 'right' };
  const paneTitleClassName = fontClass ? `pane-title-text ${fontClass}` : 'pane-title-text';
  const headingClassName = fullTitle || headingText.length > 21 ? `${paneTitleClassName} hint--bottom hint--medium` : paneTitleClassName;
  const paneSubtitleClassName = fontClass ? `pane-subtitle-text hint--bottom hint--medium ${fontClass}` : `pane-subtitle-text hint--bottom hint--medium`;

  return (
    <div className="pane-title-container-content" style={styles}>
      <span
        style={{ lineHeight: 1, padding: fontClass.includes('Awami') ? '0px 0px 6px' : '0px' }}
        className={headingClassName}
        aria-label={fullTitle || headingText}>
        {headingText.length > 21 ? headingText.slice(0, 21) + '...' : headingText}
      </span>
      <ContainerDimensions>
        {
          ({ width }) => (
            <span
              className={paneSubtitleClassName}
              style={{ lineHeight: fontClass && fontClass.includes('Awami') ? 1 : 2, textAlign: isLTR ? 'left' : 'right' }}
              aria-label={fullTitle || localizedDescription}>
              {
                localizedDescription.length > width / PANECHAR ?
                  localizedDescription.slice(0, Math.round(width / PANECHAR)) + '...' :
                  localizedDescription
              }
            </span>
          )
        }
      </ContainerDimensions>
    </div>
  );
}

/**
 * create title container content with selected justification
 * @param {boolean} isLTR - justification to use
 * @param {string} headingText
 * @param {string} localizedDescription
 * @param {function} clickToRemoveResourceLabel
 * @param {number} index
 * @param {function} removePane
 * @return {*}
 */
function TitleContainer({
  addObjectPropertyToManifest,
  changePaneFontSize,
  changePaneFontType,
  clickToRemoveResourceLabel,
  complexScriptFonts,
  font,
  fontSize,
  fontClass,
  fullTitle,
  headingText,
  index,
  isHebrew,
  isTargetBible,
  isLTR,
  localizedDescription,
  removePane,
  removeResourceLabel,
  selectFontLabel,
  shiftPosition,
  viewURL,
}) {
  if (isLTR) {
    return <>
      {getTitleContainerContent(isLTR, headingText, localizedDescription, fontClass, fullTitle)}
      <ThreeDotMenu
        font={font}
        index={index}
        isHebrew={isHebrew}
        fontSize={fontSize}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        removePane={removePane}
        isTargetBible={isTargetBible}
        selectFontLabel={selectFontLabel}
        complexScriptFonts={complexScriptFonts}
        changePaneFontSize={changePaneFontSize}
        changePaneFontType={changePaneFontType}
        removeResourceLabel={removeResourceLabel}
        clickToRemoveResourceLabel={clickToRemoveResourceLabel}
        addObjectPropertyToManifest={addObjectPropertyToManifest}
        viewURL={viewURL}
        shiftPosition={shiftPosition}
      />
    </>;
  } else { // arrange rtl
    return <>
      <ThreeDotMenu
        font={font}
        index={index}
        fontSize={fontSize}
        isHebrew={isHebrew}
        removePane={removePane}
        isTargetBible={isTargetBible}
        selectFontLabel={selectFontLabel}
        changePaneFontSize={changePaneFontSize}
        changePaneFontType={changePaneFontType}
        complexScriptFonts={complexScriptFonts}
        removeResourceLabel={removeResourceLabel}
        clickToRemoveResourceLabel={clickToRemoveResourceLabel}
        addObjectPropertyToManifest={addObjectPropertyToManifest}
        viewURL={viewURL}
        shiftPosition={shiftPosition}
      />
      {getTitleContainerContent(isLTR, headingText, localizedDescription, fontClass, fullTitle)}
    </>;
  }
}

const Pane = ({
  addObjectPropertyToManifest,
  bibleId,
  changePaneFontSize,
  changePaneFontType,
  chapter,
  clickToRemoveResourceLabel,
  complexScriptFonts,
  description,
  direction,
  font,
  fontClass,
  fontSize,
  fullTitle,
  index,
  isTargetBible,
  languageName,
  preRelease,
  removePane,
  removeResourceLabel,
  selectFontLabel,
  shiftPosition,
  translate,
  verse,
  verseElements,
}) => {
  const isLTR_ = isLTR(direction);
  const viewURL = bibleId === 'viewURL';
  const headingText = (bibleId !== 'targetBible') && !viewURL ?
    getTitleWithId(languageName, bibleId, undefined, preRelease)
    : (languageName || '');
  const localizedDescription = getTranslation(translate, `pane.${description}`, description);
  const verseContainerStyle = fontSize ? { fontSize: `${fontSize}%` } : {};
  const isHebrew = (bibleId === 'uhb');

  return (
    <div className="pane-container">
      <div className={isLTR_ ? 'pane-title-container-rtl' : 'pane-title-container-ltr'}>
        <TitleContainer
          addObjectPropertyToManifest={addObjectPropertyToManifest}
          changePaneFontSize={changePaneFontSize}
          changePaneFontType={changePaneFontType}
          clickToRemoveResourceLabel={clickToRemoveResourceLabel}
          complexScriptFonts={complexScriptFonts}
          font={font}
          fontSize={fontSize}
          fontClass={fontClass}
          fullTitle={fullTitle}
          headingText={headingText}
          index={index}
          isLTR={isLTR_}
          isHebrew={isHebrew}
          isTargetBible={isTargetBible}
          localizedDescription={localizedDescription}
          removePane={removePane}
          removeResourceLabel={removeResourceLabel}
          selectFontLabel={selectFontLabel}
          shiftPosition={shiftPosition}
          viewURL={viewURL}
        />
      </div>
      <div className={isLTR_ ? 'verse-content-container-ltr' : 'verse-content-container-rtl'} style={verseContainerStyle}>
        <Verse
          verse={verse}
          bibleId={bibleId}
          chapter={chapter}
          translate={translate}
          direction={direction}
          fontClass={fontClass}
          verseElements={verseElements}
        />
      </div>
    </div>
  );
};

Pane.propTypes = {
  addObjectPropertyToManifest: PropTypes.func.isRequired,
  bibleId: PropTypes.string.isRequired,
  changePaneFontSize: PropTypes.func.isRequired,
  changePaneFontType: PropTypes.func.isRequired,
  chapter: PropTypes.number.isRequired,
  clickToRemoveResourceLabel: PropTypes.string.isRequired,
  complexScriptFonts: PropTypes.object.isRequired,
  description: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  fontSize: PropTypes.number,
  fontClass: PropTypes.string,
  font: PropTypes.string.isRequired,
  fullTitle: PropTypes.string,
  index: PropTypes.number.isRequired,
  isTargetBible: PropTypes.bool.isRequired,
  languageName: PropTypes.string.isRequired,
  preRelease: PropTypes.string,
  removePane: PropTypes.func.isRequired,
  removeResourceLabel: PropTypes.string.isRequired,
  selectFontLabel: PropTypes.string.isRequired,
  shiftPosition: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  verse: PropTypes.oneOfType(PropTypes.number, PropTypes.string).isRequired,
  verseElements: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.array,
  ]).isRequired,
  viewURL: PropTypes.bool,
};

Pane.defaultProps = { verseElements: [] };

export default Pane;
