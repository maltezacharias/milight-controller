var express = require('express');
var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commandsV6;

var milightInstances = {};
function getMilight(ip) {
    if (!milightInstances.hasOwnProperty(ip)) {
        milightInstances[ip] = new Milight({
            ip: ip,
            type: 'v6'
        })
    } 
    return milightInstances[ip];
}


module.exports = function (req, res, next) {
    // /v6/:ip/:zone/:brightness
    let { ip, zone, brightness } = req.params;    

    let light = getMilight(req.params.ip);

    zone = parseInt(zone);
    brightness = parseInt(brightness);

    if (isNaN(zone) ||isNaN(brightness)) {
        res.sendStatus(400);
        return;
    }

    if (brightness < 0) {
        // Enter night light mode
        console.info(`Setting night mode on zone ${zone}`);
        light.sendCommands(
            commands.rgbw.nightMode(zone),
        )
    } else if (brightness !== 0) {
        console.info(`Setting brightness ${brightness} on zone ${zone}`);
        light.sendCommands(
            commands.rgbw.whiteMode(zone),
            commands.rgbw.on(zone),
            commands.rgbw.brightness(zone,brightness),
            
        )
    } else {
        console.info(`Switching of zone ${zone}`);
        light.sendCommands(
            commands.rgbw.off(zone),
        )
    }

    res.status(200);
    res.send({ zone: zone, brightness: brightness});
  }
