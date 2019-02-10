---
id: 415
title: TCP Throughput tests between Amazon AWS regions
date: 2013-06-28T12:00:20+00:00
author: Christian Elsen
excerpt: Looking at Single TCP session throughput performance between Amazon AWS regions and comparing it to the throughput between a similar setup across the Internet.
layout: single
permalink: /2013/06/28/tcp-throughput-amazon-aws-regions/
redirect_from:
  - /2013/06/28/tcp-throughput-amazon-aws-regions/amp/
categories:
  - EdgeCloud
tags:
  - AWS
  - Performance
---
In a [previous post](https://www.edge-cloud.net/2013/06/07/measuring-network-throughput/) I wrote about "Measuring Network Throughput". Today I want to share a few quick performance test results that I assembled for the single TCP session throughput between the Amazon AWS Oregon and N. Virginia regions.

### Amazon AWS

The test series uses one <a href="https://aws.amazon.com/ec2/previous-generation/" target="_blank">m1.medium instance</a> in each region. The latency between the two instances gives us an RTT of 88 ms and therefore allows us to calculate the theoretical maximum throughput based on the bandwidth-delay product.

I'm again using iperf with varying TCP window sizes for this test.

<div id="attachment_435" style="width: 635px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/Broken-TCP-throughput.png" alt="Figure 1: Single TCP stream throughput between AWS regions" width="625" height="293" class="size-full wp-image-435" srcset="/content/uploads/2013/06/Broken-TCP-throughput.png 625w, /content/uploads/2013/06/Broken-TCP-throughput-500x234.png 500w" sizes="(max-width: 625px) 100vw, 625px" />

  <p class="wp-caption-text">
    <br />Figure 1: Single TCP stream throughput between AWS regions
  </p>
</div>

Figure 1 shows the single TCP stream throughput between the two AWS regions. One can see that the throughput in both directions nicely ramps up with the increase of the TCP window size. Yet it stays behind the theoretical maximum, which is expected due to limitations of the OS (e.g. buffer sizes), the physical hardware running the OS and of course protocol overhead.

Looking at the traceroute between the two instances one can clearly see that Amazon uses its own links to connect the regions.

_Side Note:_ The network team at Amazon AWS should brush up their skills on <a href="https://en.wikipedia.org/wiki/Reverse_DNS_lookup" target="_blank">Reverse DNS lookups</a> as almost none of the routing hops' IP addresses resolves to DNS names. But the Autonomous System (AS) number of hops clearly shows that the IP addresses belong to Amazon.

### "Broken" example, not Amazon AWS

Let's have a look at another example, not Amazon AWS. This time the two workloads reside in data centers in Miami (Florida) and Las Vegas (Nevada). The RTT between the two workloads is 75 ms. In this case the sites are not connected via dedicated links, but instead both sites are connected to the internet via 100 MBits/sec uplinks. Thus the traffic between the sites traverses the Internet.

<div id="attachment_434" style="width: 635px" class="wp-caption aligncenter">
  <img src="/content/uploads/2013/06/AmazonAWS-throughput1.png" alt="Figure 2: Broken single TCP stream throughput (Not Amazon AWS)" width="625" height="299" class="size-full wp-image-434" srcset="/content/uploads/2013/06/AmazonAWS-throughput1.png 625w, /content/uploads/2013/06/AmazonAWS-throughput1-500x239.png 500w" sizes="(max-width: 625px) 100vw, 625px" />

  <p class="wp-caption-text">
    <br />Figure 2: Broken single TCP stream throughput (Not Amazon AWS)
  </p>
</div>

Here Figure 2 shows that in this example there is certainly something wrong with the connection. Throughput from Las Vegas to Miami remains extremely low at around 4-5 MBits/sec with any TCP window size. Yet, throughput from Miami to Las Vegas scales up with increasing TCP window size to acceptable values.

This shows the clear benefit of Amazons own dedicated links between its AWS regions.
