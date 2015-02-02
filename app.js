var express = require('express');
var app = express();
var request = require('request');
var url = require('url');
var $ = require('cheerio');
var _ = require('lodash');
_.str = require('underscore.string');

var espnUri = 'http://scores.espn.go.com/nfl/boxscore';

app.get('/nfl/:gameId', function (req, res) {
  request(espnUri+'?&gameId='+req.params.gameId+'&noc='+(new Date()).getTime(), function (error, response, body) {
    if (!error && response.statusCode == 200) {
      return res.json(parseData(body)); // Show the HTML for the Google homepage.
    }

    return res.status(500).json({});
  });
})

function parseData(body){
  body = _.str.trim(body||'');

  var data = {away:{},home:{},period:{name:'Final',id:'F',timeLeft:0}};

  var timeStr = $(body).find('#gameStatusBarText').text();

  data.period.label = timeStr;

  //12:35 2nd Qtr
  if(timeStr.toLowerCase().indexOf('half') > -1){
    data.period.name = 'Half';
    data.period.id = '2';
  }
  else if(timeStr.indexOf(':') > -1){
    var min = parseInt(timeStr.split(':')[0], 0);
    var sec = parseInt(timeStr.split(':')[1], 0);
    data.period.timeLeft = (min*60)+sec;
    data.period.name = timeStr.split(' ').splice(1, 1).join(' ');
    data.period.id = timeStr.split(' ')[1][0];
  }

  var $teamInfos = $(body).find('.team-info');

  for (var i = 0; i < $teamInfos.length; i++) {
    var name = $($teamInfos[i]).find('h3 a').text();
    var score = parseInt($($teamInfos[i]).find('h3 span').text(), 0);

    data[(i === 0)?"away":"home"].name = name;
    data[(i === 0)?"away":"home"].score = score;
  };

  return data;
}

var server = app.listen(process.env.PORT || 3000, process.env.host || "0.0.0.0", function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
})