var config = require('./config.json')
var ndjson = require('ndjson')
var through = require('through2')
var Email = require('email').Email
var Mustache = require('mustache')
var fs = require('fs')
var template = fs.readFileSync('./template.mustache', 'utf8')

Mustache.parse(template)

process.stdin
  .pipe(ndjson.parse())
  .pipe(groupByPatron())
  .pipe(sendEmail())

function groupByPatron () {
  var patron = {}
  var items = []
  var last

  return through.obj(function (item, _, next) {
    items.push(item)

    if (last && item.patron_barcode !== last.patron_barcode) {
      patron.patron_barcode = last.patron_barcode
      patron.first_name = last.first_name
      patron.last_name = last.last_name
      patron.email_address = last.email_address
      patron.items = items.splice(0, items.length - 1)

      this.push(patron)
      patron = {}
    }

    last = item
    return next()
  })
}

function sendEmail () {
  var testIds = config.testIds

  return through.obj(function (patron, _, next) {
    if (testIds.length) {
      if (testIds.indexOf(patron.patron_barcode) < 0)
        return next()
    }

    var body = Mustache.render(template, patron)

    // debug writes emails to html files in an emails/ directory
    if (config.debug) {
      try {
        fs.writeFileSync('./emails/' + patron.patron_barcode + '.html', body)
      } catch (e) {
        fs.mkdirSync('./emails')
        fs.writeFileSync('./emails/' + patron.patron_barcode + '.html', body)
      }

      return next()
    }

    var msg = new Email({
      to: patron.email_address,
      bodyType: 'html',
      body: body
    })

    if (config.email) {
      if (config.email.from)
        msg.from = config.email.from
      if (config.email.subject)
        msg.subject = config.email.subject
    }

    msg.send(function (err) {
      if (err)
        throw err

      next()
    })
  })
}
