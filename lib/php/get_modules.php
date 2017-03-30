<?php

$objectManager = require(__DIR__ . '/bootstrap.php');

$componentRegistrar = $objectManager->create(
    'Magento\Framework\Component\ComponentRegistrar'
);

$modules = $componentRegistrar->getPaths('module');

echo json_encode($modules, JSON_PRETTY_PRINT);
