# Map Census demographic data from counties -> commuting zones

library(tidyverse)
library(haven)
library(stringr)

# Crosswalk file
cty_to_cz_map <- read_dta("cw_cty_czone.dta")

# Functions to convert Census tables to long format
fix_census_table3 <- function(raw_table){
  
  names(raw_table) <- raw_table[1,]
  raw_table <- raw_table[2:nrow(raw_table),]
  
  long_table <- raw_table %>% 
    gather(description, data, -c(1:3)) %>% 
    separate(description, sep = ";", 
             into = c("coverage", "stat", "variable")) %>% 
    filter(stat != ' Margin of Error') %>% 
    mutate(variable = str_trim(variable)) %>% 
    select(-stat)
  
  return(long_table)
}

fix_census_table2 <- function(raw_table){
  
  names(raw_table) <- raw_table[1,]
  raw_table <- raw_table[2:nrow(raw_table),]
  
  long_table <- raw_table %>% 
    gather(description, data, -c(1:3)) %>% 
    separate(description, sep = ";", 
             into = c("stat", "variable")) %>% 
    mutate(stat = str_trim(stat)) %>% 
    filter(stat != 'Margin of Error') %>% 
    mutate(variable = str_trim(variable)) %>% 
    select(-stat) 
  
  return(long_table)
}

# Load county-level Census demographic data

age_and_sex <- fix_census_table3(read_csv("census_data/ACS_14_5YR_S0101_with_ann.csv"))

race <- fix_census_table2(read_csv("census_data/ACS_14_5YR_B03002_with_ann.csv"))

# Clean county data

cty_age <- age_and_sex %>% 
  filter(coverage == "Total") %>% 
  mutate(data = as.numeric(data)) %>% 
  spread(variable, data) %>% 
  select(1:4, `Total population`, starts_with("AGE")) %>% 
  mutate(age_0_to_19 = `AGE - Under 5 years` + `AGE - 5 to 9 years` + `AGE - 10 to 14 years` + `AGE - 15 to 19 years`,
         age_20_to_39 = `AGE - 20 to 24 years` + `AGE - 25 to 29 years` + `AGE - 30 to 34 years` + `AGE - 35 to 39 years`,
         age_40_to_64 = `AGE - 40 to 44 years` + `AGE - 45 to 49 years` + `AGE - 50 to 54 years` + `AGE - 55 to 59 years` + `AGE - 60 to 64 years`,
         age_over_64 = `AGE - 65 to 69 years` + `AGE - 70 to 74 years` + `AGE - 75 to 79 years` + `AGE - 80 to 84 years` + `AGE - 85 years and over`) %>% 
  select(-starts_with("AGE", ignore.case = FALSE)) %>% 
  gather(cat, pct, -c(1:5)) %>% 
  mutate(pop = round(`Total population` * (pct)/100)) %>% 
  select(-`Total population`, -pct, -coverage) %>% 
  spread(cat, pop)

cty_sex <- age_and_sex %>% 
  filter(coverage != "Total") %>% 
  mutate(data = as.numeric(data)) %>% 
  spread(variable, data) %>% 
  select(1:4, `Total population`) %>% 
  spread(coverage, `Total population`) %>% 
  rename(female = Female, male = Male)

cty_race <- race %>% 
  mutate(variable = str_trim(variable), data = as.numeric(data)) %>% 
  filter(variable %in% c("Total:",
                         "Not Hispanic or Latino: - White alone",
                         "Not Hispanic or Latino: - Black or African American alone",
                         "Not Hispanic or Latino: - Asian alone",
                         "Hispanic or Latino:")) %>% 
  spread(variable, data) %>% 
  rename(total_population = `Total:`,
         white = `Not Hispanic or Latino: - White alone`,
         black = `Not Hispanic or Latino: - Black or African American alone`,
         asian = `Not Hispanic or Latino: - Asian alone`,
         hispanic = `Hispanic or Latino:`)


# Merge county data and map to commuting zones

cty_data <- cty_age %>% 
  select(-Id) %>% 
  left_join(cty_sex %>% 
              select(-c(1,3)),
            by = "Id2") %>% 
  left_join(cty_race %>% 
              select(-c(1,3)),
            by = "Id2") %>% 
  rename(cty_fips = Id2, cty_name = Geography) 

cty_to_cz_map <- cty_to_cz_map %>% 
  mutate(czone = as.character(czone),
         cty_fips = as.character(cty_fips)) %>% 
  mutate(cty_fips = str_pad(cty_fips, width = 5, side = "left", pad = "0"))

cz_data <- cty_data %>% 
  left_join(cty_to_cz_map, by = "cty_fips") %>% 
  select(1, 2, czone, 3:13) 

cz_data_agg <- cz_data %>% 
  group_by(czone) %>% 
  summarize_each(funs(sum), -(1:3)) %>% 
  gather(demo_var, data, -c(czone, total_population)) %>% 
  mutate(demo_share = data/total_population) %>% 
  select(-data, -total_population) %>% 
  spread(demo_var, demo_share) %>% 
  select(1, 8, 10, 2:5, 6:7, 9, 11)

# Join health metrics data

cz_health_metrics <- read_csv("health_ineq_online_table_10.csv")

cz_all_data <- cz_health_metrics %>% 
  left_join(cz_data_agg %>% 
              mutate(czone = as.integer(czone)), 
            by = c("cz" = "czone")) %>% 
  mutate(location = paste0(czname, ", ", stateabbrv)) %>% 
  select(1:6, 79, 7:78)
  
write_csv(cz_all_data, "cz_health_and_demo_data.csv")
