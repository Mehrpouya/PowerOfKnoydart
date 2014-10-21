<?php

header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  // remove after dev


$ini = parse_ini_file("dbconfig.ini");
$username = $ini['username'];
$password = $ini['password'];
$database = $ini['database'];
$host = $ini['host'];
$db = new mysqli($host, $username, $password, $database);
$startDate = '2014-04-17 10:30:00';
$endDate = '2014-04-17 12:30:00';
$type = $_GET["type"];
if(!isset($type))$type="lastHour";
if ($db->connect_errno > 0) {
    die('Unable to connect to database [' . $db->connect_error . ']');
} else {
    if ($type == "lastHour") {
        $sql = "SELECT * FROM `readings` WHERE `datetime` >= DATE_SUB( '2014-04-17 12:30:00', INTERVAL 1 HOUR ) AND `datetime` <= '2014-04-17 12:30:00' ORDER BY `datetime`;";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    }else if ($type == "lastDay") {
        $sql = "SELECT * FROM `readings` WHERE `datetime` >= DATE_SUB( '2014-04-17 12:30:00', INTERVAL 1 DAY ) AND `datetime` <= '2014-04-17 12:30:00' GROUP BY UNIX_TIMESTAMP(`datetime`) DIV 10";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    } else if ($type == "lastWeek") {
        $sql = "SELECT * FROM `readings` WHERE `datetime` >= DATE_SUB( '2014-04-24 12:30:00', INTERVAL 7 DAY ) AND `datetime` <= '2014-04-24 12:30:00' GROUP BY UNIX_TIMESTAMP(`datetime`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    } else if ($type == "lastMonth") {
        $sql = "SELECT * FROM `readings` WHERE `datetime` >= DATE_SUB( '2014-05-24 12:30:00', INTERVAL 30 DAY ) AND `datetime` <= '2014-05-24 12:30:00' GROUP BY UNIX_TIMESTAMP(`datetime`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    } else if($type=="between") {
        if (isset($_GET["startDate"],$_GET["endDate"])) {
            $startDate = $_GET["from"];
            $endDate = $_GET["to"];
        }
        $sql = "SELECT * FROM `readings` WHERE "
                . "`datetime` >= '" . $startDate
                . "' AND "
                . "`datetime` < '" . $endDate . "' GROUP BY UNIX_TIMESTAMP(`datetime`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        $rows = array();
        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    }
    mysql_free_result($result);
    mysql_close();
}
?>