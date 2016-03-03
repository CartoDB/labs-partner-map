/*** How to add a new partner ***/

/* [IT CAN BE DONE MANUALLY] 1st Insert data as SQL */

INSERT INTO cbd_partners_ds_sc (city, country, description, logo, partner_s_name, region, url)
VALUES (city, country, description, logo, partner_s_name, region, url)

/* 2nd Georefence using City Names (city & country) */

/* [OPTIONAL] 3rd Stack data point if city has already 1+ partners */

--- Count number of partners that the city has already [num_partners]
--- Get the cartodb_id of the new partner [cdbid]
--- Run the following query:

UPDATE cbd_partners_ds_sc
SET the_geom_webmercator = ST_Translate(the_geom_webmercator,0,(num_partners+1)*30000)
WHERE cartodb_id = cdbid