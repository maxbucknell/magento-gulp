<?php

use Magento\Framework\Translate;
use Magento\Framework\View\DesignInterface;
use Magento\Framework\App\State;

$themeArg = explode(
    '/',
    $argv[1],
    2
);
$locale = $argv[2];

$area = $themeArg[0];
$theme = $themeArg[1];

/**
 * @var \Magento\Framework\ObjectManagerInterface $objectManager
 */
$objectManager = require(__DIR__ . '/bootstrap.php');

/**
 * @var DesignInterface $viewDesign
 */
$viewDesign = $objectManager->create(DesignInterface::class);

$viewDesign->setArea($area);
$viewDesign->setDesignTheme($theme);

/**
 * @var State $appState
 */
$appState = $objectManager->get(State::class);

$appState->setAreaCode($area);

/**
 * @var Translate $translate
 */
$translate = $objectManager->get(
    Translate::class,
    [
        'viewDesign' => $viewDesign,
        'appState' => $appState
    ]
);

$translate->setLocale($locale);

$translate->loadData(null, true);

echo json_encode($translate->getData(), JSON_PRETTY_PRINT);
