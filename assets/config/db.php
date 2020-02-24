<?php
class DB {
    protected static $con;
    private function __construct(){
        try{
            self::$con = new PDO(
                'mysql:charset=utf8mb4;host=localhost;port=3306;dbname=cmuoeaam_oryan',
                'cmuoeaam_amunoz', 'shinji5290623');
            self::$con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$con->setAttribute(PDO::ATTR_PERSISTENT, false);
        } catch(PDOException $e){
            echo "No se pudo conectar la base de datos, Error:" . $e;
            exit;
        }
    }

    public static function getConn(){
        if(!self::$con){
            new DB();
        }
        return self::$con;
    }
}

/*
$host="127.0.0.1";
$port=3333;
$socket="";
$user="root";
$password="";
$dbname="";

$con = new mysqli($host, $user, $password, $dbname, $port, $socket)
	or die ('Could not connect to the database server' . mysqli_connect_error());

//$con->close();


*/

?>
