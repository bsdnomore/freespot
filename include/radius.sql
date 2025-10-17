

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `radius`
--

-- --------------------------------------------------------

--
-- Структура таблицы `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `nas`
--

CREATE TABLE `nas` (
  `id` int NOT NULL,
  `nasname` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shortname` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'other',
  `ports` int DEFAULT NULL,
  `secret` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'secret',
  `server` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `community` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT 'RADIUS Client'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `nasreload`
--

CREATE TABLE `nasreload` (
  `nasipaddress` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reloadtime` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radacct`
--

CREATE TABLE `radacct` (
  `radacctid` bigint NOT NULL,
  `acctsessionid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `realm` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nasipaddress` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `nasportid` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nasporttype` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acctstarttime` datetime DEFAULT NULL,
  `acctupdatetime` datetime DEFAULT NULL,
  `acctstoptime` datetime DEFAULT NULL,
  `acctinterval` int DEFAULT NULL,
  `acctsessiontime` int UNSIGNED DEFAULT NULL,
  `acctauthentic` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectinfo_start` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectinfo_stop` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acctinputoctets` bigint DEFAULT NULL,
  `acctoutputoctets` bigint DEFAULT NULL,
  `calledstationid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `callingstationid` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `acctterminatecause` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `servicetype` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `framedprotocol` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `framedipaddress` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedipv6address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedipv6prefix` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedinterfaceid` varchar(44) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `delegatedipv6prefix` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `class` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Триггеры `radacct`
--
DELIMITER $$
CREATE TRIGGER `after_radacct_insert` AFTER INSERT ON `radacct` FOR EACH ROW BEGIN
    INSERT INTO radacct_archive (
        radacctid, acctsessionid, acctuniqueid, username, realm,
        nasipaddress, nasportid, nasporttype, acctstarttime, 
        acctupdatetime, acctstoptime, acctinterval, acctsessiontime,
        acctauthentic, connectinfo_start, connectinfo_stop,
        acctinputoctets, acctoutputoctets, calledstationid,
        callingstationid, acctterminatecause, servicetype,
        framedprotocol, framedipaddress, framedipv6address,
        framedipv6prefix, framedinterfaceid, delegatedipv6prefix, class
    ) VALUES (
        NEW.radacctid, NEW.acctsessionid, NEW.acctuniqueid, NEW.username, NEW.realm,
        NEW.nasipaddress, NEW.nasportid, NEW.nasporttype, NEW.acctstarttime,
        NEW.acctupdatetime, NEW.acctstoptime, NEW.acctinterval, NEW.acctsessiontime,
        NEW.acctauthentic, NEW.connectinfo_start, NEW.connectinfo_stop,
        NEW.acctinputoctets, NEW.acctoutputoctets, NEW.calledstationid,
        NEW.callingstationid, NEW.acctterminatecause, NEW.servicetype,
        NEW.framedprotocol, NEW.framedipaddress, NEW.framedipv6address,
        NEW.framedipv6prefix, NEW.framedinterfaceid, NEW.delegatedipv6prefix, NEW.class
    )
    ON DUPLICATE KEY UPDATE
        acctstoptime = NEW.acctstoptime,
        acctupdatetime = NEW.acctupdatetime,
        acctsessiontime = NEW.acctsessiontime,
        acctinputoctets = NEW.acctinputoctets,
        acctoutputoctets = NEW.acctoutputoctets,
        acctterminatecause = NEW.acctterminatecause$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_radacct_update` AFTER UPDATE ON `radacct` FOR EACH ROW BEGIN
    INSERT INTO radacct_archive (
        radacctid, acctsessionid, acctuniqueid, username, realm,
        nasipaddress, nasportid, nasporttype, acctstarttime, 
        acctupdatetime, acctstoptime, acctinterval, acctsessiontime,
        acctauthentic, connectinfo_start, connectinfo_stop,
        acctinputoctets, acctoutputoctets, calledstationid,
        callingstationid, acctterminatecause, servicetype,
        framedprotocol, framedipaddress, framedipv6address,
        framedipv6prefix, framedinterfaceid, delegatedipv6prefix, class
    ) VALUES (
        NEW.radacctid, NEW.acctsessionid, NEW.acctuniqueid, NEW.username, NEW.realm,
        NEW.nasipaddress, NEW.nasportid, NEW.nasporttype, NEW.acctstarttime,
        NEW.acctupdatetime, NEW.acctstoptime, NEW.acctinterval, NEW.acctsessiontime,
        NEW.acctauthentic, NEW.connectinfo_start, NEW.connectinfo_stop,
        NEW.acctinputoctets, NEW.acctoutputoctets, NEW.calledstationid,
        NEW.callingstationid, NEW.acctterminatecause, NEW.servicetype,
        NEW.framedprotocol, NEW.framedipaddress, NEW.framedipv6address,
        NEW.framedipv6prefix, NEW.framedinterfaceid, NEW.delegatedipv6prefix, NEW.class
    )
    ON DUPLICATE KEY UPDATE
        acctstoptime = NEW.acctstoptime,
        acctupdatetime = NEW.acctupdatetime,
        acctsessiontime = NEW.acctsessiontime,
        acctinputoctets = NEW.acctinputoctets,
        acctoutputoctets = NEW.acctoutputoctets,
        acctterminatecause = NEW.acctterminatecause$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Структура таблицы `radacct_archive`
--

CREATE TABLE `radacct_archive` (
  `radacctid` bigint NOT NULL,
  `acctsessionid` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `acctuniqueid` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `realm` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `nasipaddress` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `nasportid` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nasporttype` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acctstarttime` datetime DEFAULT NULL,
  `acctupdatetime` datetime DEFAULT NULL,
  `acctstoptime` datetime DEFAULT NULL,
  `acctinterval` int DEFAULT NULL,
  `acctsessiontime` int UNSIGNED DEFAULT NULL,
  `acctauthentic` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectinfo_start` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `connectinfo_stop` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acctinputoctets` bigint DEFAULT NULL,
  `acctoutputoctets` bigint DEFAULT NULL,
  `calledstationid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `callingstationid` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `acctterminatecause` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `servicetype` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `framedprotocol` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `framedipaddress` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedipv6address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedipv6prefix` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `framedinterfaceid` varchar(44) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `delegatedipv6prefix` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `class` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archived_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radcheck`
--

CREATE TABLE `radcheck` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `attribute` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `op` char(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '==',
  `value` varchar(253) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radgroupcheck`
--

CREATE TABLE `radgroupcheck` (
  `id` int UNSIGNED NOT NULL,
  `groupname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `attribute` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `op` char(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '==',
  `value` varchar(253) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radgroupreply`
--

CREATE TABLE `radgroupreply` (
  `id` int UNSIGNED NOT NULL,
  `groupname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `attribute` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `op` char(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '=',
  `value` varchar(253) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radpostauth`
--

CREATE TABLE `radpostauth` (
  `id` int NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `pass` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `reply` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `authdate` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `class` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radreply`
--

CREATE TABLE `radreply` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `attribute` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `op` char(2) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '=',
  `value` varchar(253) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `radusergroup`
--

CREATE TABLE `radusergroup` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `groupname` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `priority` int NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Индексы таблицы `nas`
--
ALTER TABLE `nas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `nasname` (`nasname`);

--
-- Индексы таблицы `nasreload`
--
ALTER TABLE `nasreload`
  ADD PRIMARY KEY (`nasipaddress`);

--
-- Индексы таблицы `radacct`
--
ALTER TABLE `radacct`
  ADD PRIMARY KEY (`radacctid`),
  ADD UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  ADD KEY `username` (`username`),
  ADD KEY `framedipaddress` (`framedipaddress`),
  ADD KEY `framedipv6address` (`framedipv6address`),
  ADD KEY `framedipv6prefix` (`framedipv6prefix`),
  ADD KEY `framedinterfaceid` (`framedinterfaceid`),
  ADD KEY `delegatedipv6prefix` (`delegatedipv6prefix`),
  ADD KEY `acctsessionid` (`acctsessionid`),
  ADD KEY `acctsessiontime` (`acctsessiontime`),
  ADD KEY `acctstarttime` (`acctstarttime`),
  ADD KEY `acctinterval` (`acctinterval`),
  ADD KEY `acctstoptime` (`acctstoptime`),
  ADD KEY `nasipaddress` (`nasipaddress`),
  ADD KEY `class` (`class`);

--
-- Индексы таблицы `radacct_archive`
--
ALTER TABLE `radacct_archive`
  ADD PRIMARY KEY (`radacctid`),
  ADD UNIQUE KEY `acctuniqueid` (`acctuniqueid`),
  ADD KEY `username` (`username`),
  ADD KEY `callingstationid` (`callingstationid`),
  ADD KEY `acctstarttime` (`acctstarttime`),
  ADD KEY `acctstoptime` (`acctstoptime`);

--
-- Индексы таблицы `radcheck`
--
ALTER TABLE `radcheck`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`(32));

--
-- Индексы таблицы `radgroupcheck`
--
ALTER TABLE `radgroupcheck`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupname` (`groupname`(32));

--
-- Индексы таблицы `radgroupreply`
--
ALTER TABLE `radgroupreply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groupname` (`groupname`(32));

--
-- Индексы таблицы `radpostauth`
--
ALTER TABLE `radpostauth`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`),
  ADD KEY `class` (`class`);

--
-- Индексы таблицы `radreply`
--
ALTER TABLE `radreply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`(32));

--
-- Индексы таблицы `radusergroup`
--
ALTER TABLE `radusergroup`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`(32));

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `nas`
--
ALTER TABLE `nas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radacct`
--
ALTER TABLE `radacct`
  MODIFY `radacctid` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radcheck`
--
ALTER TABLE `radcheck`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radgroupcheck`
--
ALTER TABLE `radgroupcheck`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radgroupreply`
--
ALTER TABLE `radgroupreply`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radpostauth`
--
ALTER TABLE `radpostauth`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radreply`
--
ALTER TABLE `radreply`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `radusergroup`
--
ALTER TABLE `radusergroup`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
