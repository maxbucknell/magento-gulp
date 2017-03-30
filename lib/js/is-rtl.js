const rtlLanguages = ['ar'];

/**
 * Based on locale, should this theme be right to left?
 */
function isRtl (locale) {
  const language = locale.slice(0, 2);
  return rtlLanguages.includes(language);
}

module.exports = isRtl;
