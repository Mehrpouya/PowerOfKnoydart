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
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 1 HOUR ) AND `time_created` <= NOW() ORDER BY `time_created`;";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][]=$row;
        }
        echo json_encode($returned_array);
    }else if ($type == "lastDay") {
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 1 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 10";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][]=$row;
        }
        echo json_encode($returned_array);
    } else if ($type == "lastWeek") {
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 7 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    } else if ($type == "lastMonth") {
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings`, `rain_readings`, `elster_readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 30 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }
        
        $rows = array();

        while ($row = $result->fetch_assoc()) {
            $rows[]=$row;
        }
        echo json_encode($rows);
    } else if($type=="between") {
        if (isset($_GET["from"],$_GET["to"])) {

            $startDate = strtotime($_GET["from"]);
            $endDate = strtotime($_GET["to"]);

        }
        $sql = "SELECT (`active_power`, `reactive_power`, `time_created`) FROM `readings` WHERE "
                . "`time_created` >= '" . $startDate
                . "' AND "
                . "`time_created` < '" . $endDate . "' GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 3600";

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