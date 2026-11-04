USE test;
UPDATE `school_data` SET `data_json` = IF(length(${data_json})>0,${data_json},`data_json`) 
 WHERE `key_name` = ${key_name} ;