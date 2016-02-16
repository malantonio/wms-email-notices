#!/usr/bin/env bash

# Fill in these variables:
#
# * BRANCH_ID is the 3/4 letter id for the branch whose report you're checking
#   against. Use your report filename: if it looks like `EVI.EVII.All_Checked_out_items.20160209.txt`,
#   then the branch ID is `EVII` (`EVI` is the institution's ID)
#
# * SCRIPTS_PATH is the absolute path to a clone of `https://github.com/TrexlerLibrary/wms-report-scripts`
#   which contains the awk scripts used to parse/filter WMS generated reports
#
# * CHECKED_OUT_PATH is the absolute path to the `All_Checked_out_items` WMS report.
#
# * AWK is used to switch your version of awk (ex. the version of awk on OS X handles dates
#   differently than Linux, so you'll want to use gawk instead)

BRANCH_ID="EVII"
SCRIPTS_PATH="$HOME/wms-report-scripts"
CHECKED_OUT_PATH="$HOME/wms-reports/checked-out"
AWK="gawk"

# gets the latest report
LATEST_REPORT=$(ls -1 $CHECKED_OUT_PATH/*$BRANCH_ID*All_Checked_out* | tail -n 1)

# get items due in 3 days
$AWK -v n=+3 -f $SCRIPTS_PATH/checked-out/items-due.awk $LATEST_REPORT | \

# pipe to sort on field 12, which is Patron Barcode
$AWK -v field=12 -f $SCRIPTS_PATH/general/sort.awk | \

# convert to JSON
$AWK -f $SCRIPTS_PATH/general/to-json.awk | \

$(which node) $PWD/email.js
