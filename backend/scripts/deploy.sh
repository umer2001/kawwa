#!/bin/bash

gcloud functions deploy storeVideo \
--runtime=nodejs16 \
--trigger-http \
--entry-point=storeVideo \
--source=./

gcloud functions deploy embedBanner \
--runtime=nodejs16 \
--trigger-bucket=raw-kawwa \
--entry-point=embedBanner \
--source=./