<?php <?php

define(‘PRIVATE_KEY’, ‘F37Yb*@AD9YkQx4’);

if ($_SERVER[‘REQUEST_METHOD’] === ‘POST’    
        && $_REQUEST['thing'] === PRIVATE_KEY)
{    
    echo shell_exec("git pull");
}
?>
