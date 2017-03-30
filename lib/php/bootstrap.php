<?php

use Magento\Framework\App\Bootstrap;

require(__DIR__ . '/../../../app/bootstrap.php');

$params = $_SERVER;
$params[\Magento\Store\Model\StoreManager::PARAM_RUN_CODE] = 'admin';
$params[\Magento\Store\Model\Store::CUSTOM_ENTRY_POINT_PARAM] = true;
$params['entryPoint'] = basename(__FILE__);

$objectManagerFactory = Bootstrap::createObjectManagerFactory(BP, $params);
$objectManager = $objectManagerFactory->create($params);

return $objectManager;
