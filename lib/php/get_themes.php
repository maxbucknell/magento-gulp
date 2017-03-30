<?php

$objectManager = require(__DIR__ . '/bootstrap.php');

$componentRegistrar = $objectManager->get(
    'Magento\Framework\Component\ComponentRegistrar'
);

$themeFactory = $objectManager->get(
    'Magento\Framework\View\Design\Theme\FlyweightFactory'
);

$themes = $componentRegistrar->getPaths('theme');

$themeObjectCache = [];

function getThemeObject($key)
{
    global $themeFactory, $themeObjectCache;

    if (isset($themeObjectCache[$key])) {
        return $themeObjectCache[$key];
    }

    list($area, $themePath) = explode('/', $key, 2);
    $themeObject = $themeFactory->create($themePath, $area);

    $themeObjectCache[$key] = $themeObject;

    return $themeObjectCache[$key];
}

function getThemeParent($key)
{
    global $themeObjectCache;

    $themeObject = getThemeObject($key);
    $parent = $themeObject->getParentTheme();

    if (!is_null($parent)) {
        $area = $parent->getArea();
        $path = $parent->getThemePath();
        $key = "{$area}/{$path}";

        $themeObjectCache[$key] = $parent;

        return $key;
    }

    return null;
}

$result = [];
foreach ($themes as $key => $location) {
    $parent = getThemeParent($key);

    $result[$key] = [
        'location' => $location,
        'parent' => $parent,
    ];
}

echo json_encode($result, JSON_PRETTY_PRINT);
