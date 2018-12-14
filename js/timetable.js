"use strict";

var dateNow = new Date();

var stations = {
  metalli: "Zug,Metalli-Bahnhof",
  bahnhofsplatz: "Zug,Bahnhofsplatz",
  kolinplatz: "Zug,Kolinplatz",
  schoenegg: "Zug,Schönegg"
};

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getConnections(from, to) {
  return new Promise(function(resolve, reject) {
    var requestURL = `https://fahrplan.search.ch/api/route.json?from=${from}&to=${to}&transportation_types=bus&num=6`;
    var request = new XMLHttpRequest();
    request.open("GET", requestURL);
    request.responseType = "json";
    request.onload = function() {
      if (request.status == 200) {
        resolve(request.response);
      } else {
        reject(request.statusText);
      }
    };
    request.onerror = function() {
      reject(request.statusText);
    };
    request.send();
  });
}

function combineJson(metalli, bhplatz, schoenegg) {

  var goodLines = [];
  var badLines = [];

  metalli.forEach(e => {

    var connection = e.legs[0];
    var line = connection.line;

    if (typeof line !== "undefined" && line === "3" || line === "14") {
      goodLines.push(connection);
    }

  });

  bhplatz.forEach(e => {

    var connection = e.legs[0];
    var line = connection.line;

    if (typeof line !== "undefined" && line === "5") {
      goodLines.push(connection);
    } else if (typeof line !== "undefined" && line === "1" || line === "2" || line === "13") {
      badLines.push(connection);
    }

  });

  schoenegg.forEach(e => {

    var connection = e.legs[0];
    var line = connection.line;

    if (typeof line !== "undefined" && line === "11") {
      goodLines.push(connection);
    }

  });

  goodLines.sort(function(a, b) {
    return new Date(a.departure) - new Date(b.departure);
  });

  badLines.sort(function(a, b) {
    return new Date(a.departure) - new Date(b.departure);
  });

  showConnections(goodLines, 1);
  showConnections(badLines, 0);

}

function showConnections(lines, flag) {

  var html = "";

  if (flag === 1) {

    html = `<div class="table"><h2>Grabenstrasse 🙌</h2>`;

    lines.forEach(e => {

      var line = e.line;
      var departureDate = new Date(e.departure);
      var departure = `${addZero(departureDate.getHours())}:${addZero(departureDate.getMinutes())}`;
      var diff = Math.floor((departureDate - dateNow) / 60000);
      var station = e.name;

      if (diff < 60) {
        html += `<div class="connection">`;
        html += `<div class="line line-${line}">${line}</div>`;
        html += `<div class="diff">${diff}'</div>`;
        html += `<div class="departure">${departure}</div>`;
        html += `<div class="station">${station}</div>`;
        html += `</div>`;
      }

    });

    html += "</div>";

    document.getElementById("goodLines").innerHTML = html;

  } else if (flag === 0) {

    html = `<div class="table"><h2>Ägeristrasse 🖕</h2>`;

    lines.forEach(e => {

      var line = e.line;
      var departureDate = new Date(e.departure);
      var departure = `${addZero(departureDate.getHours())}:${addZero(departureDate.getMinutes())}`;
      var diff = Math.floor((departureDate - dateNow) / 60000);
      var station = e.name;

      if (diff < 60) {
        html += `<div class="connection">`;
        html += `<div class="line line-${line}">${line}</div>`;
        html += `<div class="diff">${diff}'</div>`;
        html += `<div class="departure">${departure}</div>`;
        html += `<div class="station">${station}</div>`;
        html += `</div>`;
      }

    });

    html += "</div>";

    document.getElementById("badLines").innerHTML = html;
  }

}

function calcTables() {
  Promise.all([getConnections(stations.metalli, stations.kolinplatz), getConnections(stations.bahnhofsplatz, stations.kolinplatz), getConnections(stations.metalli, stations.schoenegg)])
    .then(function(responses) {
      var metalliConnections = responses[0].connections;
      var bahnhofsplatzConnections = responses[1].connections;
      var schoeneggConnections = responses[2].connections;
      combineJson(metalliConnections, bahnhofsplatzConnections, schoeneggConnections);
    })
    .catch(function(error) {
      console.log(error);
    });
};
