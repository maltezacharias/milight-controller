# milight-controller
Control Milight Bridge with simple web api in node.js

I am using Milight RGBW bulbs with a simple Milight Wifi Bridge for my lighting solution and Alexa to control the lights. Two components are used:

  * [HA-Bridge](https://github.com/bwssytems/ha-bridge) to enable Alexa to connect
  * [node-milight-promise](https://github.com/mwittig/node-milight-promise) to send commands from node to the wifi bridge using the custom protocol used by the milight apps 
  * a custom WEB API to translate between the milight gateway and ha-bridge (in this repo)

DISCLAIMER: I'm not yet up to snuff with docker, so this might not be the best way of doing it.

SECURITY: Before I found the above library I used tcpdump to try and reverse engineer the protocol as the docs were hard to find and the manufacturer has taken them offline, so only mirrors remain.
While using tcpdump I discovered regular traffic to a chinese server (probably just a keep-alive of sorts). Anway I decided to put the wifi gateway behind a firewall and prevent it from connecting to the Internet.

## Build Docker Image

Prepare the docker image:

```
$ docker build -t milight-client .
```

## Use docker-compose to set it all up:

```
# Sample docker-compose file to combine habridge and milight-bridge
---
version: "2"
services:
  habridge:
    image: linuxserver/habridge # see linuxserver/habridge documentation
    container_name: habridge
    networks:
      - main
      - internal
    environment:
      - PUID=1001
      - PGID=1001
      - SEC_KEY=<ENTER-KEY>
      - TZ=Europe/London
    volumes:
      - /srv/habridge/docker:/config
    restart: always

  milight-bridge:
    image: milight-client
    container_name: milight-bridge
    networks:
      - internal
    restart: always

networks:
  internal:
    driver: bridge
  main:
    driver: macvlan
    driver_opts:
      parent: br0
    ipam:
      config:
        - subnet: 10.11.10.0/24
          ip_range: 10.11.10.128/27
          gateway: 10.11.10.1
```

### Example setup:

```
$ docker build -t milight-client .
Sending build context to Docker daemon  271.9kB
Step 1/7 : FROM node:lts
 ---> 7a73e56f893c
Step 2/7 : COPY app /app
 ---> 9c129c5f66ca
Step 3/7 : WORKDIR /app
 ---> Running in 1d485298d829
Removing intermediate container 1d485298d829
 ---> 111c6d424e0a
Step 4/7 : RUN npm install
 ---> Running in ec905e21746a

> nodemon@2.0.2 postinstall /app/node_modules/nodemon
> node bin/postinstall || exit 0

Love nodemon? You can now support the project via the open collective:
 > https://opencollective.com/nodemon/donate

npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.1.2 (node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.1.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})

added 157 packages from 84 contributors and audited 277 packages in 16.628s

1 package is looking for funding
  run `npm fund` for details

found 0 vulnerabilities

Removing intermediate container ec905e21746a
 ---> 95237c01ba20
Step 5/7 : ENV DEBUG=milight-controller:server
 ---> Running in d65e5b62e789
Removing intermediate container d65e5b62e789
 ---> 70364c527eeb
Step 6/7 : CMD node bin/www
 ---> Running in 33c71662dbb9
Removing intermediate container 33c71662dbb9
 ---> f2f379069184
Step 7/7 : EXPOSE 3000
 ---> Running in ce153c276009
Removing intermediate container ce153c276009
 ---> 805365986d3b
Successfully built 805365986d3b
Successfully tagged milight-client:latest

$ cd milight-habridge/
$ nano docker-compose.yaml # Adjust secret
$ docker-compose up
Creating milight-bridge ... done
Creating habridge       ... done
Attaching to milight-bridge, habridge
habridge          | [s6-init] making user provided files available at /var/run/s6/etc...exited 0.
milight-bridge    | Mon, 13 Jan 2020 22:32:46 GMT milight-controller:server Listening on port 3000
habridge          | [s6-init] ensuring user provided files have correct perms...exited 0.
habridge          | [fix-attrs.d] applying ownership & permissions fixes...
habridge          | [fix-attrs.d] done.
habridge          | [cont-init.d] executing container initialization scripts...
habridge          | [cont-init.d] 10-adduser: executing...
habridge          |
habridge          | -------------------------------------
habridge          |           _         ()
habridge          |          | |  ___   _    __
habridge          |          | | / __| | |  /  \
habridge          |          | | \__ \ | | | () |
habridge          |          |_| |___/ |_|  \__/
habridge          |
habridge          |
habridge          | Brought to you by linuxserver.io
habridge          | We gratefully accept donations at:
habridge          | https://www.linuxserver.io/donate/
habridge          | -------------------------------------
habridge          | GID/UID
habridge          | -------------------------------------
habridge          |
habridge          | User uid:    1001
habridge          | User gid:    1001
habridge          | -------------------------------------
habridge          |
habridge          | [cont-init.d] 10-adduser: exited 0.
habridge          | [cont-init.d] 30-config: executing...
habridge          | [cont-init.d] 30-config: exited 0.
habridge          | [cont-init.d] done.
habridge          | [services.d] starting services
habridge          | [services.d] done.
habridge          | 2020-01-13 22:32:47,916 [main] INFO  com.bwssystems.HABridge.HABridge - HA Bridge startup sequence...
habridge          | 2020-01-13 22:32:47,924 [main] INFO  com.bwssystems.HABridge.BridgeSettings - reading from config file: /config/ha-bridge.config
habridge          | 2020-01-13 22:32:48,049 [main] INFO  com.bwssystems.HABridge.HABridge - HA Bridge (v5.2.1) initializing....
habridge          | 2020-01-13 22:32:48,107 [main] INFO  spark.staticfiles.StaticFilesConfiguration - StaticResourceHandler configured with folder = /public
habridge          | 2020-01-13 22:32:48,114 [main] INFO  com.bwssystems.HABridge.SystemControl - System control service started....
habridge          | 2020-01-13 22:32:48,138 [main] INFO  com.bwssystems.HABridge.util.UDPDatagramSender - Initializing UDP response Socket...
habridge          | 2020-01-13 22:32:48.138:INFO::Thread-0: Logging initialized @435ms to org.eclipse.jetty.util.log.StdErrLog
habridge          | 2020-01-13 22:32:48,141 [main] INFO  com.bwssystems.HABridge.util.UDPDatagramSender - UDP response Socket initialized to: 50000
habridge          | 2020-01-13 22:32:48,143 [main] INFO  com.bwssystems.HABridge.plugins.http.HTTPHome - HTTP Home created.
habridge          | 2020-01-13 22:32:48,146 [main] INFO  com.bwssystems.HABridge.plugins.harmony.HarmonyHome - Harmony Home created. No Harmony devices configured.
habridge          | 2020-01-13 22:32:48,148 [main] INFO  com.bwssystems.HABridge.plugins.NestBridge.NestHome - Nest Home created. No Nest configured.
habridge          | 2020-01-13 22:32:48,149 [main] INFO  com.bwssystems.HABridge.plugins.hue.HueHome - Hue passthru Home created. No Hue passtrhu systems configured.
habridge          | 2020-01-13 22:32:48,150 [main] INFO  com.bwssystems.HABridge.plugins.hal.HalHome - HAL Home created. No HAL devices configured.
habridge          | 2020-01-13 22:32:48,151 [main] INFO  com.bwssystems.HABridge.plugins.mqtt.MQTTHome - MQTT Home created. No MQTT Clients configured.
habridge          | 2020-01-13 22:32:48,151 [main] INFO  com.bwssystems.HABridge.plugins.hass.HassHome - HomeAssistant Home created. No HomeAssistants configured.
habridge          | 2020-01-13 22:32:48,152 [main] INFO  com.bwssystems.HABridge.plugins.homewizard.HomeWizardHome - HomeWizard Home created. No HomeWizard gateways configured.
habridge          | 2020-01-13 22:32:48,153 [main] INFO  com.bwssystems.HABridge.plugins.exec.CommandHome - Command Home for system program execution created.
habridge          | 2020-01-13 22:32:48,154 [main] INFO  com.bwssystems.HABridge.plugins.tcp.TCPHome - TCP Home created.
habridge          | 2020-01-13 22:32:48,155 [main] INFO  com.bwssystems.HABridge.plugins.udp.UDPHome - UDP Home created.
habridge          | 2020-01-13 22:32:48,156 [main] INFO  com.bwssystems.HABridge.plugins.vera.VeraHome - Vera Home created. No Veras configured.
habridge          | 2020-01-13 22:32:48,157 [main] INFO  com.bwssystems.HABridge.plugins.fibaro.FibaroHome - Fibaro Home created. No Fibaros configured.
habridge          | 2020-01-13 22:32:48,158 [main] INFO  com.bwssystems.HABridge.plugins.domoticz.DomoticzHome - Domoticz Home created. No Domoticz devices configured.
habridge          | 2020-01-13 22:32:48,159 [main] INFO  com.bwssystems.HABridge.plugins.somfy.SomfyHome - Somfy Home created. No Somfys configured.
habridge          | 2020-01-13 22:32:48,160 [main] INFO  com.bwssystems.HABridge.plugins.lifx.LifxHome - LifxDevice Home created. No LifxDevices configured.
habridge          | 2020-01-13 22:32:48,161 [main] INFO  com.bwssystems.HABridge.plugins.openhab.OpenHABHome - OpenHAB Home created. No OpenHABs configured.
habridge          | 2020-01-13 22:32:48,163 [main] INFO  com.bwssystems.HABridge.plugins.fhem.FHEMHome - FHEM Home created. No FHEMs configured.
habridge          | 2020-01-13 22:32:48,165 [main] INFO  com.bwssystems.HABridge.plugins.broadlink.BroadlinkHome - Broadlink Home created. No Broadlinks configured.
habridge          | 2020-01-13 22:32:48,175 [main] WARN  com.bwssystems.HABridge.dao.GroupRepository - Error reading the file: /config/group.db - Does not exist or is not readable. continuing...
habridge          | 2020-01-13 22:32:48,175 [main] INFO  com.bwssystems.HABridge.devicemanagmeent.DeviceResource - HABridge device management service started....
habridge          | 2020-01-13 22:32:48,183 [Thread-0] INFO  spark.embeddedserver.jetty.EmbeddedJettyServer - == Spark has ignited ...
habridge          | 2020-01-13 22:32:48,185 [Thread-0] INFO  spark.embeddedserver.jetty.EmbeddedJettyServer - >> Listening on 0.0.0.0:80
habridge          | 2020-01-13 22:32:48.188:INFO:oejs.Server:Thread-0: jetty-9.4.z-SNAPSHOT
habridge          | 2020-01-13 22:32:48,196 [main] INFO  com.bwssystems.HABridge.hue.HueMulator - Hue emulator service started....
habridge          | 2020-01-13 22:32:48.221:INFO:oejs.session:Thread-0: DefaultSessionIdManager workerName=node0
habridge          | 2020-01-13 22:32:48.221:INFO:oejs.session:Thread-0: No SessionScavenger set, using defaults
habridge          | 2020-01-13 22:32:48.223:INFO:oejs.session:Thread-0: Scavenging every 660000ms
habridge          | 2020-01-13 22:32:48.236:INFO:oejs.AbstractConnector:Thread-0: Started ServerConnector@3d04357f{HTTP/1.1,[http/1.1]}{0.0.0.0:80}
habridge          | 2020-01-13 22:32:48.237:INFO:oejs.Server:Thread-0: Started @536ms
habridge          | 2020-01-13 22:32:48,238 [main] INFO  com.bwssystems.HABridge.upnp.UpnpSettingsResource - Description xml service started....
habridge          | 2020-01-13 22:32:48,243 [main] INFO  com.bwssystems.HABridge.upnp.UpnpListener - UPNP Discovery Listener starting....
habridge          | 2020-01-13 22:32:48,243 [main] INFO  com.bwssystems.HABridge.upnp.UpnpListener - UPNP Discovery Listener running and ready....
^CGracefully stopping... (press Ctrl+C again to force)
Stopping milight-bridge ... done
Stopping habridge       ... done

```

The habridge is set up using the macvlan driver in this example, in my case it's connected to my hosts main network device br0 and will receive it's own IP-Address.
Newer Alexa firmwares will only find ha-bridge running on port 80. As I already use this port on my server I wanted to give the docker container a separate IP. If port 80 is not in use
you can alternatively use host networking. Due to the nature of the UPNP protocol used regular port mapping (with bridge networking) won't work.


## Setup ha-bridge

Now find out the IP Address assigned to ha-bridge using docker network:

```
# docker network ls
NETWORK ID          NAME                        DRIVER              SCOPE
ea479215afda        milight-habridge_internal   bridge              local
57c9c9e7ce99        milight-habridge_main       macvlan             local

# docker network inspect milight-habridge_main

....
        "Containers": {
            "84fe8126e1d0bdf12f13238f6c84fdcd9b7d6477fd511e572e62482d80983caf": {
                "Name": "habridge",
                "EndpointID": "bf2fff08ac9258794a2248edaaa90242f99659da532d8bb88d167af4536d9e72",
                "MacAddress": "02:42:0a:0b:0a:80",
                "IPv4Address": "10.11.10.128/24",
                "IPv6Address": ""
            }
        },
....
```

1. Connect to habridge (default port is 8080, be sure to change to 80, otherwise Alexa will not detect it)
2. Add new devices
3. Configure Actions as shown here:

![Config Screenshot](/img/ha-bridge-settings.png)

The URL used is:

http://milight-bridge:3000/v6/white/<bridge-ip>/<zone>/<brightness>

Parameter  | Values
---------- | ------
bridge-ip  | IP-Adress of milight wifi bridge
zone       | 0 (All zones) 1-4 (Zones on remote)
brightness | -1 (Night light), 0 (off), 1-100 (Brightness in percent)

