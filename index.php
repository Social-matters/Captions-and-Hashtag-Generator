
<?php
// Ensure proper routing for a React SPA on Hostinger
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

// Serve the index.html file for all routes
include_once("index.html");
?>
