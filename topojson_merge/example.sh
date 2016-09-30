#!/bin/bash

topojson \
  -o commuterZones.json \
  -e crosswalk.csv \
  --id-property=+idColInShapefile,+idColInCrosswalk \
  -p zone=nameOfCommuterZoneColumn \
  -- zones=countyShapefile.shp

topojson-merge \
  --in-object=zones \
  --out-object=zones \
  --key='d.properties.zone' \  # or   --key='d.properties ? d.properties.zone : "" ' \
  -o commuterZones.json \
  -- commuterZones.json


# My attempt

# Step 1
topojson \
  -o counties.json \
  -e cty_cz_st_crosswalk.csv \
  --id-property=+GEOID,+cty \
  -p zone=cz \
  -- zones=tl_2014_us_county.shp

# Step 2
topojson-merge \
  --in-object=zones \
  --out-object=zones \
  --key='d.properties ? d.properties.zone : "" ' \
  -o commuterZones.json \
  -- counties.json