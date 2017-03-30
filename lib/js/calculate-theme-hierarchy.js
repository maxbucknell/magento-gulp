function calculateThemeHierarchy(theme, themes) {
  if (theme === null) {
    return [];
  }

  return [
    ...calculateThemeHierarchy(
      themes[theme].parent,
      themes
    ),
    theme
  ];
}

module.exports = calculateThemeHierarchy;
