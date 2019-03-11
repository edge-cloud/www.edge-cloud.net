---
title: How AT&T broke my IPv6 Internet connection
author: Christian Elsen
excerpt: Using RIPE Atlas to show how AT&T broke IPv6 on my home Internet connection.
layout: single
permalink: /2019/02/13/how-att-broke-my-ipv6/
categories:
  - EdgeCloud
tags:
  - IPv6
  - Network
toc: true
---
A few days ago I discovered that my [AT&T Internet](https://www.att.com/internet/) connection at Home wasn't working as expected. Websites were loading sluggish and access to Ubuntu's repo via APT flat-out failed. My first suspicion that there must be an issue with the IPv6 connectivity was confirmed after heading to [Test-IPv6.com](https://test-ipv6.com/).

It was time to start the troubleshooting and take a closer look:

# First look at RIPE Atlas
I have had a [RIPE Atlas](https://atlas.ripe.net/) probe directly connected to my AT&T Home-gateway for the last 5 years. RIPE Atlas is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks. The data collected by this probe allows me to gain interesting insights into my own Internet connectivity at home, but also the global Internet connectivity.  

In this case the status page for my RIPE Atlas probe showed me in plain English that "IPv6 Doesn't Work Properly" (See Figure 1).

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_Warning.png" caption="Figure 1: RIPE Atlas showing that IPv6 isn't working properly" %}

# Measurement targets

The RIPE Atlas error message talks about "stable and cooperating targets (i.e. targets known to respond to pings)". Looking at the built-in measurements, we can see that these targets include some of the [root name server](https://www.iana.org/domains/root/servers). The root name servers are a authoritative name server for the root zone (".") of the Domain Name System (DNS) of the Internet. Due to the important role of these name servers to the overall DNS architecture, these servers are implemented in a highly reliable way, using e.g. [Anycast](https://en.wikipedia.org/wiki/Anycast), making them stable anchor points throughout different international locations.

And as all but the "G" root server respond to ICMP echo requests (aka. "Ping") over IPv4 and IPv6, the root name servers are excellent targets for availability tests.
In the case of my RIPE Atlas probe, we can see that all Pings to root name servers over IPv6 are failing, while Pings over IPv4 are successful (See Figure 2).

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Fail.png" caption="Figure 2: Tests to Root DNS server over IPv6 failing while IPv4 is working" %}

This shows that the actual Internet connection is up and at least working as expected for IPv4 traffic, while IPv6 traffic is facing issues. Disabling IPv6 while AT&T fixes the issue should provide a temporary workaround, which isn't great.

# When did things break?

Next, let's have a look at the question when things broke. Drilling down on the measurements for the Ping test over IPv6 to the "A" root server, allows us to look at the moment when the RIPE Atlas probe was last able to successfully ping this name server. Here we can see that the last successful IPv6 contact to the "A" root name server happened on February 6th, 2019 at 8:53 UTC (See Figure 3).

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown.png" caption="Figure 3: Pin-pointing the date and time of the failure" %}

For the other root name servers the last IPv6 contact was also at the same time, indicating a general IPv6 connectivity issue on this AT&T connection.

# Where is the fault?

Now that we know that IPv6 is broken and when it broke, let's try to figure out where things are broken. Is the link between the AT&T home gateway and the next hop upstream router broken or is the culprit further down in the AT&T network? RIPE Atlas can also help answer this question.

To do so we create a One-off measurement from solely the affected Probe to one of the IPv6 addresses of [Google Public DNS](https://developers.google.com/speed/public-dns/docs/using) resolvers at 2001:4860:4860::8888. We could also use any other host that is known to respond to IPv6 pings.
Using the [RIPE Atlas API](https://atlas.ripe.net/docs/api/v2/manual/), this test can quickly be created via:

```
    curl --dump-header - -H "Content-Type: application/json" -H "Accept:
    application/json" -X POST -d '{
      "definitions":[
      {
        "target":"2001:4860:4860::8888",
        "af":6,
        "timeout":4000,
        "description":"Traceroute measurement to 2001:4860:4860::8888",
        "protocol":"ICMP",
        "resolve_on_probe":false,
        "packets":3,
        "size":48,
        "first_hop":1,
        "max_hops":32,
        "paris":16,
        "destination_option_size":0,
        "hop_by_hop_option_size":0,
        "dont_fragment":false,
        "skip_dns_check":false,
        "type":"traceroute"
      }],
      "probes":[
      {
        "value":"12345",
        "type":"probes",
        "requested":1
      }],
      "is_oneoff":true,
      "bill_to":"mymail@edge-cloud.net"
      }' https://atlas.ripe.net/api/v2/measurements//?key=YOUR_KEY_HERE
```

The result shows the Traceroute timing out after the 3rd IPv6 hop inside the AT&T network (See Figure 4).

{% include figure image_path="/content/uploads/2019/02/ATT_Broken.png" caption="Figure 4: Traceroute to Google's Public DNS on broken AT&T connection" %}

To have another data point and to understand how a successful IPv6 Traceroute to Google Public DNS resolvers should look like, let's run the same measurement from a RIPE Atlas probe that is also connected to AT&T - indicated by the same [ASN](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)). The RIPE Atlas website allows you to find probes based on various characteristics, such as IPv6 working state, ASN but also location. With this it was easy to find a probe that is connected to AT&T with a working IPv6 connection.

As expected, the traceroute to the Google Public DNS Resolver at 2001:4860:4860::8888 successfully completes after 9 hops (See Figure 5).

{% include figure image_path="/content/uploads/2019/02/ATT_Working.png" caption="Figure 5: Traceroute to Google's Public DNS on working AT&T connection" %}

This indicates that the issue is not just on the direct link between my AT&T home gateway and the next hop upstream, but deeper inside the AT&T network. Therefore this problem most likely affects other users within my neighborhood. And of course I was able to find other reports of this issue on the [AT&T Forum](https://forums.att.com/), [DSLReports](https://www.dslreports.com) and [Reddit](https://www.reddit.com/). Here is a small selection:
* AT&T Forum: [ipv6 broken?](https://forums.att.com/t5/AT-T-Fiber-Installation/ipv6-broken/m-p/5805237#M5197)
* DSLReports: [Replacement BGW210 and can't route IPV6](http://www.dslreports.com/forum/r31897147-Replacement-BGW210-and-can-t-route-IPV6)
* Reddit: [IPv6 Broken on AT&T U-verse Gigapower (Fiber) (Northeast Austin)](https://www.reddit.com/r/Austin/comments/7etbro/ipv6_broken_on_att_uverse_gigapower_fiber/)

Unfortunately the reported troubleshooting attempts from AT&T staff on these posts were pretty useless.

# Overall quality of AT&T's Internet offering

Before finishing up, let's have a look at the overall quality of the AT&T Internet connection at my home. For this we can compare the availability of the "A" root name server over IPv6 and IPv4 over the last 3 years.

First looking at IPv6, we can see frequent packet loss and even full outages (late 2017) for multiple days (See Figure 6). I would definitely not call this is a stellar performance for an ISP.

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown_MultYears.png" caption="Figure 6: RTT to A-Root Server over IPv6 over 3 years" %}

At least for IPv4 things look a little better since my upgrade to [GPON](https://en.wikipedia.org/wiki/Passive_optical_network) in mid 2017. Since then connectivity has been mosly stable with some packet loss, but no full outages (See Figure 7).

{% include figure image_path="/content/uploads/2019/02/ATT_RIPE_RootServers_Drilldown_MultYears_IPv4.png" caption="Figure 7: RTT to A-Root Server over IPv4 over 3 years" %}

# Summary

RIPE Atlas provides an awesome tool to keep an eye on the performance and availability of your own Internet connection, but also helps troubleshooting. Keep in mind that for none of the steps shown above I had to be actually at home. You can use RIPE Atlas from anywhere.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects, but it will also benefit the overall Internet community.

At this point I have no hope whatsoever that AT&T will fix this issue anytime soon. Getting in contact with a human at AT&T is already a daunting task and finding someone with knowledge of IPv6 who can actually fix this issue seems impossible. As AT&T also blocks 6in4 tunnels, I'll be forced to disable IPv6 on my home internet connection for the time being.
