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
if (!isset($type))
    $type = "lastHour";
if ($db->connect_errno > 0) {
    die('Unable to connect to database [' . $db->connect_error . ']');
} else {
    if ($type == "lastHour") {

        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();
        $returned_array['elster'] = array();

        // MAIN READINGS
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 1 HOUR ) AND `time_created` <= NOW() ORDER BY `time_created`";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][] = $row;
        }

        // RAIN + DAM
        $sql = "SELECT `rainfall`, `dam_level`, `flow`, `date_created` as `time_created`  FROM `rain_readings` WHERE `date_created` >= DATE_SUB( NOW(), INTERVAL 1 HOUR ) AND `date_created` <= NOW() ORDER BY `date_created`";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['levels'][] = $row;
        }

        // print_r($returned_array);

        echo json_encode($returned_array);
    } else if ($type == "lastDay") {

        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();
        $returned_array['elster'] = array();
        // MAIN READINGS
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 1 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 10";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][] = $row;
        }

        // RAIN + DAM
        $sql = "SELECT `rainfall`, `dam_level`, `flow`, `date_created` as `time_created` FROM `rain_readings` WHERE `date_created` >= DATE_SUB( NOW(), INTERVAL 1 DAY ) AND `date_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`date_created`) DIV 10";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {

            $returned_array['levels'][] = $row;
        }
        
        $sql = "select date_created,SUM(elster) as average_elster from (select distinct * from elster_readings where `date_created` >= DATE_SUB( NOW(), INTERVAL 1 DAY ) AND `date_created` <= NOW()) as foo  group by DATE(date_created), HOUR(date_created)";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['elster'][] = $row;
        }

        echo json_encode($returned_array);
    } else if ($type == "lastWeek") {

        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();
        $returned_array['elster'] = array();
        // MAIN READINGS
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 7 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][] = $row;
        }

        // RAIN + DAM
        $sql = "SELECT `rainfall`, `dam_level`, `flow`, `date_created` as `time_created` FROM `rain_readings` WHERE `date_created` >= DATE_SUB( NOW(), INTERVAL 7 DAY ) AND `date_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`date_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {

            $returned_array['levels'][] = $row;
        }
        $sql = "select date_created,SUM(elster) as average_elster from (select distinct * from elster_readings where `date_created` >= DATE_SUB( NOW(), INTERVAL 7 DAY ) AND `date_created` <= NOW()) as foo  group by DATE(date_created), HOUR(date_created)";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['elster'][] = $row;
        }
        echo json_encode($returned_array);
    } else if ($type == "lastMonth") {

        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();
        $returned_array['elster'] = array();
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= DATE_SUB( NOW(), INTERVAL 30 DAY ) AND `time_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`time_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][] = $row;
        }

        $sql = "SELECT `rainfall`, `dam_level`, `flow`, `date_created` as `time_created` FROM `rain_readings` WHERE `date_created` >= DATE_SUB( NOW(), INTERVAL 30 DAY ) AND `date_created` <= NOW() GROUP BY UNIX_TIMESTAMP(`date_created`) DIV 3600";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {

            $returned_array['levels'][] = $row;
        }
        $sql = "select date_created,SUM(elster) as average_elster from (select distinct * from elster_readings where `date_created` >= DATE_SUB( NOW(), INTERVAL 30 DAY ) AND `date_created` <= NOW()) as foo group by DATE(date_created), HOUR(date_created)";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['elster'][] = $row;
        }

        echo json_encode($returned_array);
    } else if ($type == "between") {
        if (isset($_GET["from"], $_GET["to"])) {

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
            $rows[] = $row;
        }
        echo json_encode($rows);
    } else if ($type == "since") {
        $start = $_GET["since"];
        $returned_array = array();
        $returned_array['readings'] = array();
        $returned_array['levels'] = array();

        // MAIN READINGS
        $sql = "SELECT `active_power`, `reactive_power`, `time_created` FROM `readings` WHERE `time_created` >= '" . $start . "' ORDER BY `time_created`";
        if (!$result = $db->query($sql)) {
            die('There was an error running the query [ ' . $db->error . ' ]');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['readings'][] = $row;
        }

        // RAIN + DAM
        $sql = "SELECT `rainfall`, `dam_level`, `flow`, `date_created` as `time_created`  FROM `rain_readings` WHERE `date_created` >= '" . $start . "' ORDER BY `date_created`";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array['levels'][] = $row;
        }

        // print_r($returned_array);

        echo json_encode($returned_array);
    }
    else if ($type == "lastReading") {

        $returned_array = array();
        // MAIN READINGS
        $sql = "SELECT `active_power` FROM `readings` ORDER BY `time_created` DESC limit 1";

        if (!$result = $db->query($sql)) {
            die('There was an error running the query [' . $db->error . ']');
        }

        while ($row = $result->fetch_assoc()) {
            $returned_array[] = $row;
        }
        echo json_encode($returned_array);
    }
    mysql_free_result($result);
    mysql_close();
}
?>