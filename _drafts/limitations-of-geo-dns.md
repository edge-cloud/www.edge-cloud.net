---
title: Limitations of DNS-based geolocation steering
date: 2019-01-15T16:04:00+00:00
author: Christian Elsen
excerpt: Exploring the limitations of DNS-based geolocation routing. Geolocation routing lets you choose the resources that serve your traffic based on the geographic location of your users, meaning the location that DNS queries originate from.
layout: single
permalink: /2019/01/15/limitations-of-geo-dns/
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
Describe what RIPE Atlas is

### Test Setup
Describe the Text Setup

{% include figure image_path="/content/uploads/2019/02/R53_Setup.png" caption="Figure 2: Desired Geoproximity Routing" %}

### Test Results
#### Overview
Overview of what can be seen 

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-US-Probes.png" caption="Figure 3: Mapping of RIPE Atlas probes to Origins" %}

#### Probe Details
Drill down on the probe results

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-Probe.png" caption="Figure 4: Detail view of RIPE Atlas probe results" %}

#### The good, bad and ugly
Go over 4 locations

{% include figure image_path="/content/uploads/2019/02/RIPE-Atlas-Details.png" caption="Figure 5: Zoom into subset of RIPE Atlas probe results" %}

### Summary
