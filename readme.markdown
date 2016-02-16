# WMS Email Notices

Mad science exploration of replacing WMS Circulation notifications with our own
email templates.

Relies on [our WMS report scripts][https://github.com/TrexlerLibrary/wms-report-scripts].

## tips

* **Don't actually use these.** I'm still figuring them out.
* Edit `send-notices.sh`'s variables to match your own system.
* Copy `config.sample.json` to `config.json` + add your own values.
* Add your own patron barcode to `config.json`'s `testIds` array so that if you
  _do_ send out emails they don't go to anyone who isn't expecting them.
