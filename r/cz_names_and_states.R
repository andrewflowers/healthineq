# Names of commuting zones and states

library(tidyverse)
library(haven)

cz_characteristics <- read_csv("../health_ineq_data/health_ineq_online_table_10.csv")

cz_names <- cz_characteristics %>% 
  select(czname, stateabbrv)

cz_names %>% 
  rename(state = stateabbrv, city = czname) %>% 
  write_csv("../gh-pages/data/cz_names_and_states.csv")