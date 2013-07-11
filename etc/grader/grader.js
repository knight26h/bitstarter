#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var path = require('path');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var CHECKURL_DEFAULT = "";

var bURLfile = false;

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!path.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var DownloadURLFileExists = function(infile) {
    var instr = infile.toString();
    if (instr=="") return "";
    //console.log("DownloadURLFileExists::%s",instr);  
    bURLfile = true;    
    var urlfile = "urlfile.dat";
    var response2console = buildfn(urlfile);
    //rest.get(instr).on('complete', response2console);
    rest.get(instr).on('complete', response2console);
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, bURLfile ) {
    if ( bURLfile == true ) {
      $ = cheerioHtmlFile(urlfile);    
    }
    else {
      $ = cheerioHtmlFile(htmlfile);
    }
    
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var buildfn = function( urlfile ) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
            process.exit(1);
        } else {
            //console.error("Wrote %s", urlfile);
            fs.writeFileSync(urlfile, result);
        }
        CheckProc();
    };
    return response2console;
};

var CheckProc = function () {
    var checkJson = checkHtmlFile(program.file, program.checks, program.url);
    var outJson = JSON.stringify(checkJson, null, 4);    
    console.log(outJson);
}

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to url', clone(DownloadURLFileExists), CHECKURL_DEFAULT)
        .parse(process.argv);
        
        if ( bURLfile == false ) {
            CheckProc();
        }
    
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
