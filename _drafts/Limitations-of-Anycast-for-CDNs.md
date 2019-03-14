---
title: Limitations of Anycast for Content Distribution Networks (CDNs)
author: Christian Elsen
excerpt: Exploring the limitations of Anycast using AWS Global Accelerator and RIPE Atlas, through visualizing the real life results.
layout: single
permalink: /2019/03/22/limitations-of-anycast-for-cdns/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro Text. Refer previous article [Limitations of DNS-based geographic routing](/2019/03/01/limitations-of-geo-dns/).

# Anycast

Explain Anycast

{% include figure image_path="/content/uploads/2019/03/Anycast.png" caption="Figure 1: Unicast vs. Anycast" %}

## AWS Global Accelerator

Explain [AWS Global Accelerator](https://aws.amazon.com/global-accelerator/)

{% include figure image_path="/content/uploads/2019/03/Global-Accelerator-Concept.png" caption="Figure 2: Concept of AWS Global Accelerator" %}

# RIPE Atlas

In this post we will use RIPE Atlas to check the performance of a geographic routing enabled DNS entry.

[RIPE Atlas](https://atlas.ripe.net/) is a global network of hardware devices, called probes and anchors, that actively measure Internet connectivity. Anyone can access this data via Internet traffic maps, streaming data visualisations, and an API. RIPE Atlas users can also perform customised measurements to gain valuable data about their own networks.

I highly recommend you to consider [hosting a RIPE Atlas probe](https://atlas.ripe.net/get-involved/become-a-host/) yourself. Not only will you benefit from the data that it collects on your Internet connection, but it will also allow you to run customized measurements against various Internet targets. And in the end every additional RIPE Atlas probe will benefit the overall Internet community.

Here we will be using RIPE Atlas customized measurements to investigate the performance of DNS-based geographic routing.

# Test Setup

## AWS Global Accelerator Setup

{% include figure image_path="/content/uploads/2019/03/Test-Setup.png" caption="Figure 3: Test Setup with AWS Global Accelerator and two origins" %}

## RIPE Atlas setup

How is the RIPE Atlas test configured against the certificate

# Test Results

## Overview

With some Python code the gathered results can easily be turned into a GeoJSON file (See Figure 4).

{% include figure image_path="/content/uploads/2019/03/RIPE-Atlas-Probes-Anycast.png" caption="Figure 4: Mapping of RIPE Atlas probes to Origins" %}

## Probe Details

The way that I’ve setup the GeoJSON is to also display relevant information for each of the RIPE Atlas Probes (Figure 5).

{% include figure image_path="/content/uploads/2019/03/RIPE-Atlas-Probe-Detail.png" caption="Figure 5: Detail view of RIPE Atlas probe results" %}


## Explore the GeoJSON

You can explore this GeoJSON yourself below, as it is published as a [Gist to Github](https://gist.github.com/chriselsen/4756c3fb8c4f1ba3b3d14e2c22617665).

<script src="https://gist.github.com/chriselsen/4756c3fb8c4f1ba3b3d14e2c22617665.js"></script>

Give it a try and see what you'll discover!

## The good, bad and ugly

{% include figure image_path="/content/uploads/2019/03/RIPE-Atlas-Internet2.png" caption="Figure 6: Example of RIPE Atlas probe on US East Coast preferring the origin in US-West-2" %}

{% include figure image_path="/content/uploads/2019/03/RIPE-Atlas-Charter.png" caption="Figure 7: Example of RIPE Atlas probe on US West Coast preferring the origin in US-East-2" %}


# Summary

Summary
