---
title: Limitations of DNS-based geolocation steering
author: Christian Elsen
excerpt: Exploring the limitations of DNS-based geolocation routing. Geolocation routing lets you choose the resources that serve your traffic based on the geographic location of your users, meaning the location that DNS queries originate from.
layout: single
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Short intro text

### Geolocation Routing
Describe what GeoDNS is for

{% include figure image_path="/content/uploads/2019/02/DNS-Resolver.png" caption="Figure 1: DNS Resolver and authoritative name server" %}

### RIPE Atlas
[RIPE Atlas](https://atlas.ripe.net/) is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects on your Internet connection, but it will also allow you to run customized measurements against various Internet targets. And in the end every additional RIPE Atlas probe will benefit the overall Internet community.

Here we will be using RIPE Atlas customized measurements to investigate the performance of DNS-based geolocation routing. 

### Test Setup
Describe the Text Setup

For this article the test setup will consist of two origins where we want to steer traffic to. The test will focus on the US with one origin in the US East coast and one origin in the US West coast. 

A third origin will be placed into Kansas. With IP location based data a mostly unknown lake in Kansas takes over a special meaning. [The Cheney Reservoir](https://en.wikipedia.org/wiki/Cheney_Reservoir) is close to the geographical center of the continental US. As such the IP location company [Maxmind]() places all IP addresses for which it has no more information than that it is located somewhere in the US at this location. It is estimated that over 600 Million Internet IP addresses to point to Cheney Reservoir.
In the past Maxmind placed these IP addresses into the backyard of a Kansas family, whose life was [turned upside down](https://www.theguardian.com/technology/2016/aug/09/maxmind-mapping-lawsuit-kansas-farm-ip-address) as a result.

We will model this setup with AWS Route 53 [Geoproximity routing](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-geoproximity), where the AWS regions US-East-2 (Ohio) - as the US East coast location - and US-West-2 (Oregon) - as the US West coast location - receive neutral bias of 0. The origin at Cheney Reservoir receives a large negative bias, to create a small circle around this area. 

The result will look like depicted in Figure 2.

{% include figure image_path="/content/uploads/2019/02/R53_Setup.png" caption="Figure 2: Desired Geoproximity Routing" %}

The idea behind this test setup is to create a TXT DNS record which will return one of possible three results depending on the Client DNS resolver location:
 * "US-West-2" for resolvers located closest to the AWS region US-West-2 (Oregon) based on IP Geolocation data.
 * "US-East-2" for resolvers located closest to the AWS region US-East-2 (Ohio) based on IP Geolocation data.
 * "Unknown" for resolvers where IP Geolocation data only indicates them to be somewhere in the US and therefore places them into Kansas. 

In the test setup here the "Unknown" location for IP Geolocation data (yellow dot in Figure 2) is within the area that would be steered towards the US-East coast origin. Therefore even clients located in Portland, OR might get directed to the Ohio origin if their resolver's or EDNS0-provided client subnet cannot be correctly located. 
Breaking these clients out separately in the test setup will allow us to visualize this issue.

### Test Results
#### Overview
Overview of what can be seen 

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-US-Probes.png" caption="Figure 3: Mapping of RIPE Atlas probes to Origins" %}

<script src="https://gist.github.com/chriselsen/ff5d0d535781e61d879ff154e785259a.js"></script>

#### Probe Details
Drill down on the probe results

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-Probe.png" caption="Figure 4: Detail view of RIPE Atlas probe results" %}

#### The good, bad and ugly
Go over 4 locations

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-Details.png" caption="Figure 5: Zoom into subset of RIPE Atlas probe results" %}

### Summary
