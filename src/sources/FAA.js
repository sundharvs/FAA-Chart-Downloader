const fs = require('fs');
const fetch = require('node-fetch');
const chalk = require('chalk');
const log = console.log;

module.exports = {
  filesWritten: 0,
  filesSkipped: 0,
  airport: null,
  overwrite: false,
  init(code, overwrite) {
    this.airport = code;
    this.overwrite = overwrite;
    return 'https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=' + code;
  },
  async getFile(type, url, name) {
    await fs.access("output/" + this.airport + "/"+type+"/" + name + ".pdf", err => {
      if (err || this.overwrite) {
        fetch(url).then(res => {
          const dest = fs.createWriteStream("output/" + this.airport + "/"+type+"/" + name + ".pdf");
          res.body.pipe(dest);
          log(chalk.green(type) + ": " + chalk.yellow(name));
          this.filesWritten++;
        });
      } else {
        this.filesSkipped++;
      }
    });
  },
  async callback($) {

    let diagram = $("#charts .chartLink a").attr('href');

    fetch(diagram).then(res => {
      const dest = fs.createWriteStream("output/" + this.airport + "/" + this.airport + "_airport-diagram.pdf");
      res.body.pipe(dest);
      log(chalk.cyan("Airport info diagram downloaded"));
    });

    $("#charts h3:contains('Standard Terminal Arrival (STAR) Charts')").parent().children("span").each((e, el) => {
      let item = $(el).children("a");
      this.getFile('STAR', item.attr('href'), item.text().replace('/', '&'));
    });

    $("#charts h3:contains('Departure Procedure (DP) Charts')").parent().children("span").each((e, el) => {
      let item = $(el).children("a");
      this.getFile('DEPARTURES', item.attr('href'), item.text().replace('/', '&'));
    });

    $("#charts h3:contains('Instrument Approach Procedure (IAP) Charts')").parent().children("span").each((e, el) => {
      let item = $(el).children("a");
      this.getFile('IAP', item.attr('href'), item.text().replace('/', '&'));
    });

  }
};