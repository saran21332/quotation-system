-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: productpnc
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int NOT NULL,
  `device_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `contract_type` varchar(10) DEFAULT NULL,
  `contract_duration` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_carts_product` (`product_id`),
  KEY `fk_cart_device` (`device_id`),
  KEY `fk_carts_user` (`user_id`),
  CONSTRAINT `fk_cart_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`),
  CONSTRAINT `fk_carts_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=345 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (38,5,3,NULL,1,'2025-06-26 17:16:26','2025-06-26 17:16:26',500000.00,'yearly',1),(39,5,4,NULL,1,'2025-06-26 17:16:31','2025-06-26 17:16:31',1200.00,'yearly',1),(40,5,5,NULL,1,'2025-06-26 17:16:34','2025-06-26 17:16:34',500.00,'yearly',1),(334,4,31,NULL,2,'2025-07-07 15:18:37','2025-07-09 11:43:17',250000.00,'yearly',1),(335,4,22,NULL,2,'2025-07-07 15:18:38','2025-07-09 10:14:41',100000.00,'yearly',1),(336,4,7,NULL,1,'2025-07-09 11:24:28','2025-07-09 11:24:28',20000.00,'yearly',1),(337,4,3,NULL,2,'2025-07-09 11:24:29','2025-07-09 13:39:01',500000.00,'yearly',1),(343,4,15,NULL,1,'2025-07-09 11:43:20','2025-07-09 11:43:20',2000.00,NULL,NULL),(344,4,25,NULL,1,'2025-07-09 11:43:41','2025-07-09 11:43:41',30000.00,NULL,NULL);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'software',NULL),(2,'device',NULL),(3,'Sensor',2),(4,'CCTV',2),(5,'Computer',2),(6,'Wifi',2);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `quantity` int NOT NULL DEFAULT '0',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `image` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES (9,'Smart LED','หลอดไฟพร้อมเซนเซอร์อัจฉริยะ',50,1200.00,'omniflow.jpg','2025-06-12 10:29:59','2025-06-12 10:29:59'),(10,'PTZ CCTV','กล้อง CCTV IP camera',50,1500.00,'PTZ.png','2025-06-12 10:32:24','2025-06-12 10:32:24'),(11,'Digital Signage','กล้อง CCTV IP camera',50,2500.00,'Signage.jpg','2025-06-12 10:34:54','2025-06-12 10:34:54'),(12,'PM2.5 sensor','sesor ตรวจจับ PM2.5',50,500.00,'PM2.5.jpg','2025-06-12 10:42:46','2025-06-12 10:42:46'),(13,'Temperature sensor','sesor ตรวจจับอุณหภูมิ',50,800.00,'temperature.jpg','2025-06-12 10:45:01','2025-06-12 10:45:01');
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_requests`
--

DROP TABLE IF EXISTS `otp_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_requests`
--

LOCK TABLES `otp_requests` WRITE;
/*!40000 ALTER TABLE `otp_requests` DISABLE KEYS */;
INSERT INTO `otp_requests` VALUES (10,'seatiasaran101@gmail.com','471063','2025-06-20 13:56:49',1,'2025-06-20 13:46:49'),(11,'seatiasaran@gmial.com','288380','2025-06-26 14:04:29',0,'2025-06-26 13:54:29'),(12,'Seatiasaran@gmail.com','101973','2025-06-26 14:29:12',0,'2025-06-26 14:19:12'),(13,'saranseatia@gmail.com','788723','2025-06-26 14:42:45',0,'2025-06-26 14:32:45'),(14,'seatiasaran101@gmail.com','490981','2025-06-26 14:44:13',0,'2025-06-26 14:34:13'),(15,'saranseatia@gmail.com','914402','2025-06-26 14:53:56',0,'2025-06-26 14:43:56'),(16,'seatiasaran@gmail.com','379166','2025-06-26 14:54:43',1,'2025-06-26 14:44:43'),(17,'seatiasaran101@gmail.com','553593','2025-06-26 15:00:36',1,'2025-06-26 14:50:36'),(18,'seatiasaran@gmail.com','846023','2025-06-26 15:07:47',1,'2025-06-26 14:57:47'),(19,'seatiasaran@gmail.com','614854','2025-06-26 15:33:37',1,'2025-06-26 15:23:37'),(20,'seatiasaran@gmail.com','883775','2025-06-26 15:44:14',1,'2025-06-26 15:34:14'),(21,'seatiasaran@gmail.com','167880','2025-06-26 15:52:15',1,'2025-06-26 15:42:15'),(22,'seatiasaran@gmail.com','174957','2025-06-26 16:20:02',1,'2025-06-26 16:10:03'),(23,'seatiasaran@gmail.com','539750','2025-06-26 16:29:24',1,'2025-06-26 16:19:24'),(24,'seatiasaran@gmail.com','680964','2025-06-27 08:57:29',1,'2025-06-27 08:47:29'),(25,'seatiasaran@gmail.com','666440','2025-06-27 13:23:36',1,'2025-06-27 13:13:36'),(26,'seatiasaran@gmail.com','231945','2025-06-27 13:41:39',1,'2025-06-27 13:31:39'),(27,'seatiasaran@gmail.com','991906','2025-06-27 13:48:01',1,'2025-06-27 13:38:01'),(28,'seatiasaran@gmail.com','248668','2025-06-27 13:49:35',1,'2025-06-27 13:39:35'),(29,'seatiasaran@gmail.com','103552','2025-06-27 13:57:10',1,'2025-06-27 13:47:10'),(30,'seatiasaran@gmail.com','179382','2025-06-27 14:03:45',1,'2025-06-27 13:53:45'),(31,'saranseatia101@gmail.com','449552','2025-06-27 14:25:44',0,'2025-06-27 14:15:44'),(32,'seatiasaran101@gmail.com','406139','2025-06-27 14:26:27',1,'2025-06-27 14:16:27'),(33,'seatiasaran@gmail.com','847836','2025-06-27 16:59:35',1,'2025-06-27 16:49:35'),(34,'seatiasaran@gmail.com','286582','2025-06-27 17:44:07',1,'2025-06-27 17:34:07'),(35,'seatiasaran@gmail.com','497322','2025-06-30 14:17:47',1,'2025-06-30 14:07:47'),(36,'seatiasaran@gmail.com','884026','2025-07-01 11:22:52',0,'2025-07-01 11:12:52'),(37,'seatiasaran@gmail.com','727696','2025-07-01 11:28:52',0,'2025-07-01 11:18:52'),(38,'seatiasaran@gmail.com','285280','2025-07-01 11:29:30',0,'2025-07-01 11:19:30'),(39,'seatiasaran@gmail.com','627418','2025-07-01 11:30:49',1,'2025-07-01 11:20:49'),(40,'seatiasaran@gmail.com','299491','2025-07-01 15:17:19',1,'2025-07-01 15:07:19'),(41,'seatiasaran@gmail.com','766560','2025-07-01 17:48:11',1,'2025-07-01 17:38:11'),(42,'seatiasaran@gmail.com','341523','2025-07-01 17:49:36',0,'2025-07-01 17:39:36'),(43,'seatiasaran@gmail.com','861154','2025-07-02 09:16:57',1,'2025-07-02 09:06:57'),(44,'seatiasaran@gmail.com','856736','2025-07-02 09:27:17',1,'2025-07-02 09:17:17'),(45,'Seatiasaran@gmail.com','835263','2025-07-02 10:28:09',1,'2025-07-02 10:18:09'),(46,'seatiasaran@gmail.com','320033','2025-07-02 10:44:05',1,'2025-07-02 10:34:05'),(47,'seatiasaran@gmail.com','812668','2025-07-03 13:35:53',0,'2025-07-03 13:25:53'),(48,'seatiasaran@gmail.com','223522','2025-07-03 13:37:51',0,'2025-07-03 13:27:51'),(49,'seatiasaran@gmail.com','602264','2025-07-03 13:48:25',0,'2025-07-03 13:38:25'),(50,'seatiasaran@gmail.com','413841','2025-07-03 13:48:51',0,'2025-07-03 13:38:51'),(51,'seatiasaran@gmail.com','961612','2025-07-03 13:54:09',0,'2025-07-03 13:44:09'),(52,'seatiasaran@gmail.com','344962','2025-07-03 14:06:51',1,'2025-07-03 13:56:51'),(53,'seatiasaran@gmail.com','528274','2025-07-03 14:09:41',1,'2025-07-03 13:59:41'),(54,'seatiasaran@gmail.com','147298','2025-07-03 14:16:32',1,'2025-07-03 14:06:32'),(55,'seatiasaran@gmail.com','789935','2025-07-03 14:17:42',1,'2025-07-03 14:07:42'),(56,'seatiasaran@gmail.com','719616','2025-07-03 16:16:13',1,'2025-07-03 16:06:13'),(57,'seatiasaran@gmail.com','592930','2025-07-03 17:18:37',1,'2025-07-03 17:08:37'),(58,'seatiasaran@gmail.com','713100','2025-07-07 09:05:41',1,'2025-07-07 08:55:41'),(59,'seatiasaran101@gmail.com','217198','2025-07-07 09:10:06',1,'2025-07-07 09:00:06'),(60,'seatiasaran101@gmail.com','902456','2025-07-07 09:33:36',0,'2025-07-07 09:23:36'),(61,'seatiasaran101@gmail.com','947202','2025-07-07 09:34:01',0,'2025-07-07 09:24:01'),(62,'seatiasaran101@gmail.com','938548','2025-07-07 09:45:26',1,'2025-07-07 09:35:26'),(63,'seatiasaran101@gmail.com','319467','2025-07-07 09:51:14',1,'2025-07-07 09:41:14'),(64,'nussanun581@gmail.com','624423','2025-07-07 09:56:27',1,'2025-07-07 09:46:27'),(65,'nussanun581@gmail.com','399299','2025-07-07 09:57:24',1,'2025-07-07 09:47:24'),(66,'seatiasaran101@gmail.com','666580','2025-07-07 09:57:59',1,'2025-07-07 09:47:59'),(67,'seatiasaran@gmail.com','547037','2025-07-09 04:50:32',1,'2025-07-09 11:40:32'),(68,'seatiasaran@gmail.com','111271','2025-07-09 06:49:48',1,'2025-07-09 13:39:48'),(69,'seatiasaran@gmail.com','296323','2025-07-09 06:57:16',1,'2025-07-09 13:47:16');
/*!40000 ALTER TABLE `otp_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `product_condition` text,
  `platform_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `price` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `price_yearly` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `platform_id` (`platform_id`),
  KEY `fk_product_category` (`category_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`platform_id`) REFERENCES `platform` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (3,'Smart city ','ระบบเมืองอัจฉริยะทั้งความปลอดภัยและความสะดวกสะบาย','',6,1,'smartcity.jpg',10,500000.00,'2025-06-12 10:59:29','2025-07-03 17:28:12',500000.00),(4,'omniflow','หลอดไฟอัจฉริยะพร้อมระบบ sensor','หลอดไฟส่องสว่างสำหรับ การใช้ร่วมกับระบบเซนเซอร์จึงจำเป็นต้องมีการติดเซนเซอร์พร้อมกับ smart pole',NULL,3,'omniflow.jpg',20,1200.00,'2025-06-12 11:01:22','2025-06-30 09:35:33',NULL),(5,'PM2.5 sensor','sensor ตรวจจับ pm2.5','ใช้ในการตรวจจับ pm2.5 เพื่อยกระดับความปลอดภัยภายในเมือง',NULL,3,'PM2.5.jpg',20,500.00,'2025-06-12 11:02:21','2025-06-30 09:36:14',NULL),(7,'cloud PBX','PlanetCloud PBX (Cloud phone system) ระบบตู้โทรศัพท์สาขาบนคลาวด์ เป็นระบบการติดต่อสื่อสารที่อยู่บนพื้นฐานอินเตอร์เน็ต ในรูปแบบ Software as a Services (SaaS) เหมาะสำหรับองค์กรธุรกิจในทุกระดับชั้น ที่ต้องการลดค่าใช้จ่ายในการดำเนินธุรกิจ และทำให้การติดต่อมีประสิทธิภาพที่สามารถวัดผลได้ สื่อสารถึงกันได้ทั่วโลก คุณภาพดี บริการเชื่อถือได้','',NULL,1,'cloudPBX.jpg',10,20000.00,'2025-06-18 11:40:22','2025-07-03 17:28:26',20000.00),(8,'IP camera','กล้อง IP สำหรับ ตรวจจับใบหน้าได้','สามารถเลือก solution ใช้ร่วมกับกล้องได้ ทั้งตรวจจับใบหน้าและระบุผู้ต้องสงสัย',NULL,4,'1750221844119-ipcamera.jpg',10,3000.00,'2025-06-18 11:44:04','2025-06-30 09:39:24',NULL),(9,'temperature sensor','sensor สำหรับตรวจจับอุณหภูมิ','หากต้องการให้มีการตรวจจับอุณหภูมิ ',NULL,3,'1750221968574-temperature.jpg',10,500.00,'2025-06-18 11:46:08','2025-06-30 09:40:52',NULL),(10,'Humidity sensor','sensor สำหรับตรวจจับมนุษย์','ตัวเลือกสำหรับการตรวจจับผู้คน เพื่อคววามปลอดภัยภายในเมือง',NULL,3,'1750222044065-humandity.jpg',10,1000.00,'2025-06-18 11:47:24','2025-06-30 09:41:29',NULL),(11,'rounter wifi','router wifi สำหรับ public wifi','ถ้าต้องารเพิ่มสัญญาณ wifi ให้มีประสิทธิภาพมากขึ้น',NULL,5,'1750222148691-rounter.jpg',10,2500.00,'2025-06-18 11:49:08','2025-06-30 09:42:34',NULL),(12,'Digital Signage','จอแสดงผลแบบ digital','หากต้องการให้มีการแสดงผลโฆษณาหรือสื่อออนไลน์ทางหน้าจอ',NULL,5,'1750222276234-digitalsignage.jpg',10,35000.00,'2025-06-18 11:51:16','2025-06-30 09:44:11',NULL),(13,'SOS emergency','ปุ่มขอความช่วยเหลือกรณีฉุกเฉิน','เพิ่มความปลอดภัยของเมืองขึ้นอีกระดับด้วยปุ่มขอความช่วยเหลือและระบบ vdo call เพื่อรายงานสถานการณ์',NULL,3,'1750222372051-sos.jpg',10,1000.00,'2025-06-18 11:52:52','2025-06-30 09:45:01',NULL),(14,'cambium Networks','Wireless Point-To-Point Solution','สาย network ที่มีความเสถียรเหมาะกับการใช้งานในทุกสภาพอากาศ',NULL,6,'1750227111801-cambium.jpg',10,1500.00,'2025-06-18 13:11:51','2025-06-30 09:45:49',NULL),(15,'Kymeta – U8 Antenna','The Kymeta™ u8 antenna is designed for integrators to create mobile satellite terminals with enhanced communications. Leveraging Kymeta’s revolutionary metamaterials-based technology, the u8 antenna has been re-engineered for increased RF performance and adaptability for greater flexibility to address customers’ needs.','ระบบ LAN ที่ช่วยให้การทำงานมีประสิทธิภาพมากขึ้น',NULL,6,'1750227196371-Kymeta.png',10,2000.00,'2025-06-18 13:13:16','2025-06-30 09:46:19',NULL),(16,'Cobham SAILOR 800 VSAT\n','The Cobham SAILOR 800 VSAT is a standardized high-performance 3-axis stabilized Ku-band antenna system with an 83 cm reflector dish. It provides the same or better radio performance than a typical 1m antenna.\nThese claims are supported by industry 3rd party testing, which has shown that Cobham SAILOR 800 VSAT provides the best performance for an antenna in the 80 cm class.','VSAT ที่าพร้อมกับระบบความปลอดภัยในการใช้งาน network',NULL,6,'1750227260126-Cobham.jpg',10,2500.00,'2025-06-18 13:14:20','2025-06-30 09:47:02',NULL),(17,'H-Pico Heights Remote Gateway','The Heights™ Networking Platform is engineered to elevate your services with unparalleled horsepower, efficiency and intelligence. The Heights platform was designed with the service provider and its multiuser environments in mind, from concept to operation.','Networking to elevate your services with unparalleled',NULL,6,'1750227330992-H-Pico.png',10,1500.00,'2025-06-18 13:15:31','2025-06-30 09:48:03',NULL),(18,'CDM-760 Trunking and Broadcast','The CDM-760 Advanced High-Speed Trunking Modem builds on our award-winning family of high-speed, ultra efficient trunking modems. The CDM-760 further enhances our offerings to include ultra wide band symbol rates, near theoretical performance with minimal implementation loss, our proprietary DVB-S2 Efficiency Boost technology, Super Jumbo Frame (SJF) Ethernet support and many other value-added features.','ระบบ high-speed trunking เพื่อยกระดับความเร็วในการใช้ network ',NULL,6,'1750227386173-CDM-760.png',10,1500.00,'2025-06-18 13:16:26','2025-06-30 09:49:02',NULL),(19,'FX Series WAN Optimization','When it comes to Internet access over satellite, high-speed connectivity does not necessarily equate to a fast broadband user experience (as what end-users expect when connected onto 4G, wireless or wireline terrestrial networks). To users, a crisp web browsing experience, responsive user interaction together with rapid content display speeds are paramount for delivering a good QoE (Quality of Experience).','WAN  ตรวจจับการเข้าถึงอินเทอร์เน็ตของสำนักงาน',NULL,6,'1750227437234-FX-Series.png',10,3000.00,'2025-06-18 13:17:17','2025-06-30 09:49:44',NULL),(20,'Netperformer Interface Converter (MEMOTEC)','The NetPerformer Satellite Routers combine the functionality of a data router, a multiplexer and a voice gateway in a single device, enabling users to create converged networks and transport any type of traffic over satellite or terrestrial links.).','transport any type of traffic over satellite or terrestrial links',NULL,6,'1750227485164-SDM-9606.png',10,3000.00,'2025-06-18 13:18:05','2025-06-30 09:50:05',NULL),(21,'HPOD High Power Outdoor BUC and SSPA','Comtech EF Data’s (CEFD) series of High-Power Outdoor (HPOD) C-, X-, and Ku-Band Solid-State Power Amplifiers (SSPAs) provide a cost-effective, more linear replacement for TWT amplifiers in satellite communications terminals. The HPOD delivers its rated power, guaranteed at the 1 dB compression point to the transmit waveguide flange.','',NULL,5,'1750227543812-HPOD.png',10,5000.00,'2025-06-18 13:19:03','2025-07-03 17:20:08',NULL),(22,'The NextGen Meeting Room','“โซลูชั่นสำหรับห้องประชุม และพื้นที่การทำงานร่วมกันแบบ Hybrid ที่เป็นได้มากกว่า ห้องประชุมอัจฉริยะ (Smart Meeting Room)”\nด้วยเทคโนโลยีจากพาร์ทเนอร์ระดับสากล และประสบการณ์ของ PlanetComm','หากองค์กรของคุณกำลังมองหาโซลูชั่นสำหรับอัพเกรด หรือปรับปรุงห้องประชุมเก่า\nแพลนเน็ตคอม ขอเสนอแพ็คเกจสำหรับห้องประชุมที่รองรับผู้เข้าร่วมตั้งแต่ 4-10 ท่าน แบบสำเร็จรูปพร้อม\nบริการแบบครบวงจรให้คุณไม่ต้องวุ่นวายหาอุปกรณ์ หาผู้รับเหมา และยังได้ใช้งานอย่างรวดเร็ว ไร้กังวล\nด้วยทีมงานมืออาชีพ และบริการหลังการขายจากเร',NULL,1,'1751250503596-meetingroom.png',10,NULL,'2025-06-30 09:28:23','2025-06-30 09:28:23',100000.00),(23,'SmartNode 4520 Series','Connect with confidence using the SmartNode 4520 Series Router. Integrating a complete enterprise router with local PSTN and remote packetvoice, the SN4520 supports eight simultaneous calls for a new standard in toll-bypass, remote/branch office connectivity, and enhanced carrier services.','',NULL,6,'1751279883690-SN4520.png',10,1500.00,'2025-06-30 17:38:03','2025-07-03 17:27:38',NULL),(25,'iPhone16','จอ 25 นิ้ว','',NULL,5,'1751536248625-iPhone_16_Ultramarine_PDP_Image_Position_1a_Ultramarine_Color__TH-TH.webp',10,30000.00,'2025-07-03 16:50:48','2025-07-03 17:20:57',NULL),(31,'nCipher','Security empowers world-leading organizations by delivering trust, integrity and control to their business critical information and applications. The cryptographic solutions secure emerging technologies – cloud, IoT, blockchain, digital payments – and help meet new compliance mandates.','',NULL,1,'1751857277507-nCipher.png',15,NULL,'2025-07-07 10:01:17','2025-07-07 10:04:14',250000.00);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_device`
--

DROP TABLE IF EXISTS `product_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_device` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `device_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `type` enum('default','addon') DEFAULT 'default',
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `product_device_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  CONSTRAINT `product_device_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_device`
--

LOCK TABLES `product_device` WRITE;
/*!40000 ALTER TABLE `product_device` DISABLE KEYS */;
INSERT INTO `product_device` VALUES (1,3,9,2,'default'),(2,3,10,2,'default'),(3,3,11,2,'default'),(4,3,12,2,'default'),(5,3,13,2,'default'),(6,3,9,0,'addon'),(7,3,10,0,'addon'),(8,3,11,0,'addon'),(9,3,12,0,'addon'),(10,3,13,0,'addon');
/*!40000 ALTER TABLE `product_device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation`
--

DROP TABLE IF EXISTS `quotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_no` varchar(50) DEFAULT NULL,
  `quotation_date` timestamp NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_company` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_address` text,
  `customer` varchar(255) DEFAULT NULL,
  `customer_tel` varchar(50) DEFAULT NULL,
  `customer_fax` varchar(50) DEFAULT NULL,
  `customer_code` varchar(50) DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT NULL,
  `vat_percent` decimal(5,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `vat_amount` decimal(10,2) DEFAULT NULL,
  `grand_total` decimal(10,2) DEFAULT NULL,
  `remark` text,
  `validity_days` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `guest_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `guest_id` (`guest_id`),
  CONSTRAINT `quotation_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation`
--

LOCK TABLES `quotation` WRITE;
/*!40000 ALTER TABLE `quotation` DISABLE KEYS */;
INSERT INTO `quotation` VALUES (1,NULL,'2025-07-03 07:13:48',NULL,'Saran Seatia','planetcomm co.td','seatiasaran@gmail.com','157 ซอยรามอินทรา 34 ถนน รามอินทรา กรุงเทพมหานคร',NULL,'0652356723','021231234',NULL,0.00,7.00,634000.00,44380.00,678380.00,NULL,30,'2025-07-03 14:13:48','2025-07-03 14:13:48',NULL,4),(3,NULL,'2025-07-03 07:29:04',NULL,'Saran Seatia','planetcomm co.td','seatiasaran@gmail.com','157 ซอยรามอินทรา 34 ถนน รามอินทรา กรุงเทพมหานคร',NULL,'0652356723','021231234',NULL,0.00,7.00,634000.00,44380.00,678380.00,NULL,30,'2025-07-03 14:29:04','2025-07-03 14:29:04',NULL,4),(6,NULL,'2025-07-03 07:32:40',NULL,'Saran Seatia','planetcomm co.td','seatiasaran@gmail.com','157 ซอยรามอินทรา 34 ถนน รามอินทรา กรุงเทพมหานคร',NULL,'0652356723','021231234',NULL,0.00,7.00,634000.00,44380.00,678380.00,NULL,30,'2025-07-03 14:32:40','2025-07-03 14:32:40',NULL,4),(7,NULL,'2025-07-03 07:35:35',NULL,'Saran Seatia','planetcomm co.td','seatiasaran@gmail.com','157 ซอยรามอินทรา 34 ถนน รามอินทรา กรุงเทพมหานคร',NULL,'0652356723','021231234',NULL,0.00,7.00,634000.00,44380.00,678380.00,NULL,30,'2025-07-03 14:35:35','2025-07-03 14:35:35',NULL,4),(8,NULL,'2025-07-03 07:58:59',NULL,'Saran Seatia','planetcomm co.td','seatiasaran@gmail.com','157 ซอยรามอินทรา 34 ถนน รามอินทรา กรุงเทพมหานคร',NULL,'0652356723','021231234',NULL,0.00,7.00,634000.00,44380.00,678380.00,NULL,30,'2025-07-03 14:58:59','2025-07-03 14:58:59',NULL,4),(9,NULL,'2025-07-03 09:05:27',NULL,'saran seatia','example company','seatiasaran@gamil.com','thailand bangkok',NULL,'0812345678','02-1234567','CUST001',10.00,7.00,570600.00,39942.00,610542.00,NULL,30,'2025-07-03 16:05:27','2025-07-03 16:05:27',NULL,4),(10,NULL,'2025-07-03 09:18:11',NULL,'nassanun pumchampa','','nussanun101@gmail.com','',NULL,'0652356489','',NULL,0.00,7.00,16500.00,1155.00,17655.00,NULL,30,'2025-07-03 16:18:11','2025-07-03 16:18:11',NULL,42),(11,NULL,'2025-07-03 09:45:29',NULL,'l;p','','nussanun2004@gmail.com','',NULL,'0959151772','',NULL,0.00,7.00,225000.00,15750.00,240750.00,NULL,30,'2025-07-03 16:45:29','2025-07-03 16:45:29',NULL,4),(12,NULL,'2025-07-03 09:48:24',NULL,'ตาลจ้า','','nussanun2004@gmail.com','',NULL,'0959151772','',NULL,0.00,7.00,225000.00,15750.00,240750.00,'',365,'2025-07-03 16:48:24','2025-07-03 16:48:24',NULL,4),(13,NULL,'2025-07-07 02:05:10',NULL,'Nussanun Pumchampa','','Nussanun@gmail.com','',NULL,'0652356767','',NULL,0.00,7.00,138000.00,9660.00,147660.00,NULL,30,'2025-07-07 09:05:10','2025-07-07 09:05:10',NULL,43),(14,NULL,'2025-07-09 04:24:52',NULL,'saran','','seatiasaran@gmail.com','',NULL,'0652356723','',NULL,0.00,7.00,970000.00,67900.00,1037900.00,NULL,30,'2025-07-09 11:24:52','2025-07-09 11:24:52',NULL,4),(15,NULL,'2025-07-09 04:42:10',NULL,'Nussanun Pumchampa','','Nussanun101@gmail.com','',NULL,'0959151772','',NULL,0.00,7.00,50500.00,3535.00,54035.00,NULL,30,'2025-07-09 11:42:10','2025-07-09 11:42:10',NULL,45);
/*!40000 ALTER TABLE `quotation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation_item`
--

DROP TABLE IF EXISTS `quotation_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_id` int DEFAULT NULL,
  `product_code` varchar(50) DEFAULT NULL,
  `product_description` text,
  `quantity` int DEFAULT NULL,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `net_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `quotation_id` (`quotation_id`),
  CONSTRAINT `quotation_item_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotation` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation_item`
--

LOCK TABLES `quotation_item` WRITE;
/*!40000 ALTER TABLE `quotation_item` DISABLE KEYS */;
INSERT INTO `quotation_item` VALUES (1,1,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(2,1,NULL,'Smart city ',1,500000.00,500000.00),(3,1,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(4,1,NULL,'cloud PBX',1,20000.00,20000.00),(5,1,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(6,1,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(7,1,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(8,1,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(9,3,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(10,3,NULL,'Smart city ',1,500000.00,500000.00),(11,3,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(12,3,NULL,'cloud PBX',1,20000.00,20000.00),(13,3,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(14,3,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(15,3,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(16,3,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(17,6,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(18,6,NULL,'Smart city ',1,500000.00,500000.00),(19,6,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(20,6,NULL,'cloud PBX',1,20000.00,20000.00),(21,6,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(22,6,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(23,6,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(24,6,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(25,7,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(26,7,NULL,'Smart city ',1,500000.00,500000.00),(27,7,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(28,7,NULL,'cloud PBX',1,20000.00,20000.00),(29,7,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(30,7,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(31,7,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(32,7,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(33,8,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(34,8,NULL,'Smart city ',1,500000.00,500000.00),(35,8,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(36,8,NULL,'cloud PBX',1,20000.00,20000.00),(37,8,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(38,8,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(39,8,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(40,8,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(41,9,NULL,'Netperformer Interface Converter (MEMOTEC)',1,100000.00,100000.00),(42,9,NULL,'H-Pico Heights Remote Gateway',1,500000.00,500000.00),(43,9,NULL,'omniflow',1,1500.00,1500.00),(44,9,NULL,'cloud PBX',1,20000.00,20000.00),(45,9,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(46,9,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(47,9,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(48,9,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(49,10,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(50,10,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(51,10,NULL,'FX Series WAN Optimization',1,3000.00,3000.00),(52,10,NULL,'CDM-760 Trunking and Broadcast',1,1500.00,1500.00),(53,10,NULL,'H-Pico Heights Remote Gateway',1,1500.00,1500.00),(54,10,NULL,'Cobham SAILOR 800 VSAT\n',1,2500.00,2500.00),(55,11,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(56,11,NULL,'cloud PBX',1,20000.00,20000.00),(57,11,NULL,'Digital Signage',3,35000.00,105000.00),(58,12,NULL,'Cloud PBX555',1,100000.00,100000.00),(59,12,NULL,'cloud PBX',1,20000.00,20000.00),(60,12,NULL,'Digital Signage',3,35000.00,105000.00),(61,13,NULL,'The NextGen Meeting Room',1,100000.00,100000.00),(62,13,NULL,'iPhone16',1,30000.00,30000.00),(63,13,NULL,'HPOD High Power Outdoor BUC and SSPA',1,5000.00,5000.00),(64,13,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(65,14,NULL,'nCipher',1,250000.00,250000.00),(66,14,NULL,'The NextGen Meeting Room',2,100000.00,200000.00),(67,14,NULL,'cloud PBX',1,20000.00,20000.00),(68,14,NULL,'Smart city ',1,500000.00,500000.00),(69,15,NULL,'iPhone16',1,30000.00,30000.00),(70,15,NULL,'SmartNode 4520 Series',1,1500.00,1500.00),(71,15,NULL,'HPOD High Power Outdoor BUC and SSPA',2,5000.00,10000.00),(72,15,NULL,'Netperformer Interface Converter (MEMOTEC)',1,3000.00,3000.00),(73,15,NULL,'FX Series WAN Optimization',2,3000.00,6000.00);
/*!40000 ALTER TABLE `quotation_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation_logs`
--

DROP TABLE IF EXISTS `quotation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `action` varchar(50) NOT NULL DEFAULT 'created',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pdf_filename` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `fk_quotation_logs_quotation` (`quotation_id`),
  CONSTRAINT `fk_quotation_logs_quotation` FOREIGN KEY (`quotation_id`) REFERENCES `quotation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `quotation_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation_logs`
--

LOCK TABLES `quotation_logs` WRITE;
/*!40000 ALTER TABLE `quotation_logs` DISABLE KEYS */;
INSERT INTO `quotation_logs` VALUES (5,8,4,'Saran ','created','2025-07-03 07:58:59'),(6,9,4,'Saran ','created','2025-07-03 09:05:28'),(8,11,4,'Saran ','created','2025-07-03 09:45:30'),(9,12,4,'Saran ','created','2025-07-03 09:48:24'),(11,14,4,'Saran ','created','2025-07-08 21:24:52'),(12,15,45,'Nussanun','created','2025-07-08 21:42:10');
/*!40000 ALTER TABLE `quotation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `user_agent` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (73,45,'c1ac18d2589b754d043a97fcf7a57744','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 11:40:48'),(74,45,'369984c21d1b94391c084e891fc9f2e7','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 11:40:52'),(75,45,'6a7fbdbec034eaf5aa840e9c48a35007','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 13:40:07'),(76,45,'607230c702e063629bb596e3d9ad7037','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 13:40:30'),(77,45,'5e831f58f701036143f24e0183e200f1','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 13:47:31'),(78,45,'6aae34b700a7b6bf656f2b2e1e0c4d68','::ffff:172.18.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',1,'2025-07-09 13:47:36');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(200) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_temp_user` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'Saran','Saran ','0652356723',NULL,'$2b$10$T3sV8Jk1p68GYB55RLUnIO68P5YtXmp1XVimpnHTPmkq8irFfAHRi','admin','2025-06-18 09:38:50',1,0),(5,'Siriwan',NULL,NULL,NULL,'$2b$10$xJKLdfIn.GSMU8Omh22TFuX5x/EAJJojOTDd77QWKH46iLJ4iDnLi','user','2025-06-18 09:39:18',1,0),(45,'user_b477e339','Nussanun','0652356764','seatiasaran@gmail.com','$2b$10$bIW6s98NFnXFi9TIkU2YwO8Inri7eIKKANtykO0.Si2JFmJctA7WK','user','2025-07-09 11:40:32',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-09 14:47:57
