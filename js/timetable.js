"use strict";

const dateNow = new Date();

const stations = {
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

function fixDateString(date) {
  return date.replace(" ", "T").concat("+01:00");
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

    let connection = e.legs[0];
    let line = connection.line;

    if (typeof line !== "undefined" && line === "3" || line === "14") {
      goodLines.push(connection);
    }

  });

  bhplatz.forEach(e => {

    let connection = e.legs[0];
    let line = connection.line;

    if (typeof line !== "undefined" && line === "5") {
      goodLines.push(connection);
    } else if (typeof line !== "undefined" && line === "1" || line === "2" || line === "13") {
      badLines.push(connection);
    }

  });

  schoenegg.forEach(e => {

    let connection = e.legs[0];
    let line = connection.line;

    if (typeof line !== "undefined" && line === "11") {
      goodLines.push(connection);
    }

  });

  goodLines.sort(function(a, b) {
    return new Date(fixDateString(a.departure)) - new Date(fixDateString(b.departure));
  });

  badLines.sort(function(a, b) {
    return new Date(fixDateString(a.departure)) - new Date(fixDateString(b.departure));
  });

  showConnections(goodLines, 1);
  showConnections(badLines, 0);

}

function showConnections(lines, flag) {

  if (flag === 1) {

    let html = `<div class="table"><h2>Grabenstrasse 🙌</h2>`;

    lines.forEach(e => {

      let line = e.line;
      let departureDate = new Date(fixDateString(e.departure));
      let departure = `${addZero(departureDate.getHours())}:${addZero(departureDate.getMinutes())}`;
      let diff = Math.floor((departureDate - dateNow) / 60000);
      let station = e.name;

      if (diff <= 40) {
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

    let html = `<div class="table"><h2>Ägeristrasse 🖕</h2>`;

    lines.forEach(e => {

      let line = e.line;
      let departureDate = new Date(fixDateString(e.departure));
      let departure = `${addZero(departureDate.getHours())}:${addZero(departureDate.getMinutes())}`;
      let diff = Math.floor((departureDate - dateNow) / 60000);
      let station = e.name;

      if (diff <= 40) {
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
      let metalliConnections = responses[0].connections;
      let bahnhofsplatzConnections = responses[1].connections;
      let schoeneggConnections = responses[2].connections;
      combineJson(metalliConnections, bahnhofsplatzConnections, schoeneggConnections);
    })
    .catch(function(error) {
      console.log(error);
    });
};
