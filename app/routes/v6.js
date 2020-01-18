var express = require('express');
var Milight = require('node-milight-promise').MilightController;
var commands = require('node-milight-promise').commandsV6;

var router = express.Router();
module.exports = router;

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

router.get('/white/:ip/:zone/:brightness', white);
function white (req, res ) {
    let { ip, zone, brightness } = req.params;    
    let light = getMilight(ip);

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
            commands.rgbw.on(zone),
            commands.rgbw.whiteMode(zone),
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

  router.get('/rgb/:ip/:zone/:red/:green/:blue', rgb);
  function rgb(req, res) {

    let { ip, zone, red, green, blue } = req.params;    
    let light = getMilight(ip);

    console.info(req.params);
    console.info([red, green, blue ]);

    zone = parseInt(zone);
    red = parseInt(red);
    green = parseInt(green);
    blue = parseInt(blue);

    if (isNaN(zone) || isNaN(red) || isNaN(green) || isNaN(blue)) {
        console.log("send status 400");
        res.sendStatus(400);
        return;
    }

    console.info(`Setting rgb mode on zone ${zone}, colors: `, { red: red, green: green, blue: blue});

    light.sendCommands(
        commands.rgbw.on(zone),
        commands.rgbw.rgb(zone, red, green, blue),
        commands.rgbw.brightness(zone, 100),
        
    )

    res.status(200);
    res.send({ zone: zone, red: red, green: green, blue: blue});
  }