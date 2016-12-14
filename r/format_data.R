# Format raw Health Inequality data for visualization

library(tidyverse)
library(haven)

cz_characteristics <- read_csv("health_ineq_online_table_10.csv")

# Sample table

sample_data <- cz_characteristics %>% 
  select(czname, stateabbrv, cur_smoke_q1, bmi_obese_q1, exercise_any_q1, poor_share) %>% 
  unite(location, czname, stateabbrv, sep = ", ") %>% 
  head(50)

sample_data %>% 
  write_csv("sample_table_data.csv")
  
cz_names <- cz_characteristics %>% 
  select(czname, stateabbrv)

cz_names %>% 
  rename(state = stateabbrv, city = czname) %>% 
  write_csv("cz_names_and_states.csv")


# Merge demographic data
