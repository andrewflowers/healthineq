# Step 1: Label each county with its commuting zone
topojson \
  -o counties.json \
  -e cty_cz_st_crosswalk.csv \
  --id-property=+GEOID,+cty \
  -p zone=cz \
  -- commuting_zones=cb_2014_us_county_5m.shp

# Step 2: merging counties into commuting zones
topojson-merge \
  --in-object=commuting_zones \
  --out-object=commuting_zones \
  --key='d.properties ? d.properties.zone : "" ' \
  -o commuting_zones.json \
  -- counties.json

# Step 3: combining commuting zone and state boundaries
topojson \
  -o cz_and_states.json \
  -p \
  -- states=cb_2014_us_state_5m.shp commuting_zones.json 