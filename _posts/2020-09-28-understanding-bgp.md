---
title: Better understanding BGP
author: Christian Elsen
excerpt: Primer to better understanding BGP
layout: single
permalink: /2020/09/28/understanding-bgp/
header:
  og_image: /content/uploads/2020/09/title-understanding-bgp.png
categories:
  - EdgeCloud
tags:
  - BGP
  - Network
toc: true
toc_sticky: true
---

In a [previous post](https://www.edge-cloud.net/2020/09/18/understanding-routing/) we took a look at some of the fundamental principles of IP routing. Today we want to look at some more details of related BGP Routing protocol concepts. While these principles and concepts are generic, we will again use examples based on AWS networking, along with examples from running an [Autonomous System](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)) on the Internet.

This blog post is not intended to be an all encompassing primer on BGP. Instead I've seen numerous people confused by some of these principles and concepts while either designing networks or troubleshooting them. Therefore it appears to be a good idea to select and explain them explicitly.

# Routing Protocols

A [Routing Protocol](https://en.wikipedia.org/wiki/Routing_protocol) specifies how routers communicate with each other to exchange information about the network and as a result populate and update the local route tables. While there are many different routing protocols, they all fall into the categories of either Interior gateway protocols or Exterior gateway protocols. [Interior gateway protocols (IGPs)](https://en.wikipedia.org/wiki/Interior_gateway_protocol), such as e.g. [OSPF](https://en.wikipedia.org/wiki/Open_Shortest_Path_First), [RIP](https://en.wikipedia.org/wiki/Routing_Information_Protocol), or [IS-IS](https://en.wikipedia.org/wiki/IS-IS), exchange routing information within a single routing domain, thereby under the control of a single administration. [Exterior gateway protocols (EGP)](https://en.wikipedia.org/wiki/Exterior_gateway_protocol), such as e.g. [BGP](https://en.wikipedia.org/wiki/Border_Gateway_Protocol) exchange routing information between autonomous systems.

# BGP

Border Gateway Protocol (BGP) is an [Exterior gateway protocols (EGP)](https://en.wikipedia.org/wiki/Exterior_gateway_protocol) designed to exchange routing and reachability information across Autonomous Systems (AS) on an Internet scale. It can be used for routing within an autonomous system, which is called Interior Border Gateway Protocol /  Internal BGP (iBGP). Or it can be used - as on the Internet - to route between AS, which is called Exterior Border Gateway Protocol / External BGP (eBGP). Here we will focus on the eBGP use case.

# BGP Best Path Selection Algorithm

Within BGP the [Best Path Selection Algorithm](https://www.noction.com/blog/bgp-best-path-selection-algorithm) is used to select the best route, which is then installed into the local route table. As the Internet route table - used in the [Default Free Zone](https://en.wikipedia.org/wiki/Default-free_zone) - holds approximately 850,000 IPv4 and 95,000 IPv6 routes as of today and because some of these routes might be received from multiple peer - e.g. Transit Provider and direct peering, this selection is no easy task.
Unless the default settings within a BGP enabled router are changed, the Best Path Selection Algorithm selects the shortest path as the best path, where shortest path means the least amount of AS in the path.

In the following we want to look in more detail at the three most important selection criteria within the BGP Best Path Selection Algorithm:
 * **Local Preference** or often "Local_Pref" for short is the second criteria that is considered. The default Local_Pref is 100 and routes with a higher local preference are preferred.
 * **AS_PATH** is the fourth criteria considered. Routes with the shortest AS_PATH attribute are preferred.
 * **Multi-exit discriminator (MED)** is the sixth selection criteria considered. Here routes with a lower MED value are preferred with 0 being the default value.

## Local_Pref

As previously seen, Local_Pref is one of the first Best Path Selection Algorithm criteria that a router looks at. It is evaluated before the AS path length. While the default value of Local_Pref is 100, routes that have a higher Local_Pref value are preferred. An important characteristic to consider is that Local_Pref is local in the sense that the attribute is only propagated over iBGP sessions (within your AS) and not over eBGP sessions (to external ASes). You might see BGP route tables with empty entries for Local_Pref for a given route, sometimes along with other routes that do have an explicit entry. In this case the empty entries just mean that the deafult value of 100 applies.

In practice Local_Pref can be used to specify how traffic should leave our AS, therefore it can guide the exit path (See Figure 1). Here ASN 1 prefers the path to ASN2, as the Local_Pref on the corresponding interface has a higher value. 

{% include figure image_path="/content/uploads/2020/09/Understanding-BGP-Local_Pref.png" caption="Figure 1: Local_Pref dictates how traffic leaves a local ASN, where path with a higher Local_Pref value being preferred." class="webfeedsFeaturedVisual" %}

This is typically used for traffic engineering purposes, where an ASN wants to prefer a certain kind of peer over another. Usually this is done for financial reasons, as traffic exchanged over e.g. a Transit peering might incur cost, while traffic exchanged over a direct peering might be settlement free.

As a result a typical mapping of BGP session types to Local_Pref values could look like this:

|BGP Session|Local_Pref|
|---|---|
|**Private Peering**|500|
|**Direct Peering via IXP**|400|
|**Peering via IXP Route Server**|300|
|**Transit**|200|

Here we generally prefer settlement-free peering with higher Local_Pref over paid transit with lower Local_Pref.

## AS_PATH length

A common mechanism to manage traffic across AS with BGP is to make a BGP AS_PATH longer via [AS path prepending](https://www.noction.com/blog/as-path-and-as-path-prepending). Prepending means adding one or more AS numbers to the left side of the AS path. Normally this is done using one’s own AS number, while announcing routes to another AS.

With that we can influence how traffic will reach our ASN. Similar to what I described before we might not only have a commercial interest in reducing the cost that we pay for Transit for traffic leaving our ASN, but also for traffic entering our ASN. We have seen that we can perform traffic engineering for egress traffic via Local_Pref, using AS path prepending can be used for traffic engineering on ingress traffic (See Figure 2). Here ASN 1 makes its path artificially longer towards ASN 3 by prepending its own ASN once. 

{% include figure image_path="/content/uploads/2020/09/Understanding-BGP-AS-Path-Prepending.png" caption="Figure 2: AS_PATH prepending makes the AS path length artificially longer, therefore influencing inbound traffic to an ASN." %}

With this we could use AS path prepending for IP prefixes originated or announced by our ASN over various types of BGP session types like this to optimize for cost:

|BGP Session|AS path prepending|
|---|---|
|**Private Peering**|None|
|**Direct Peering via IXP**|1x|
|**Peering via IXP Route Server**|2x|
|**Transit**|3x|

In this case we tell other ASNs to prefer path via our settlement-free peering through lower AS_PATH length over paid transit through longer AS_PATH length.

## Multi-Exit Discriminator (MED)

Multi-Exit Discriminator (MED) is used for the case that more than one link between two ASN exists. I can be used to influence which of these links is then used (See Figure 3). It is important to point out that the MED value is not transitive. Therefore it is not passed on by the receiving AS and therefore can solely be used to influence traffic between directly neighboring AS.

In this case traffic from the neighboring ASN 2 will ingress via device R1 as the MED on the corresponding link is lower.

{% include figure image_path="/content/uploads/2020/09/Understanding-BGP-MED.png" caption="Figure 3: Multi-Exit Discriminator (MED) suggests how traffic should enter an ASN. Path with lower MED value are preferred." %}

When using AWS you will encounter MED when using a BGP-based Site-to-Site (IPSec) VPN connection while using a Virtual Private Gateway (VGW). In this case only one of the two tunnels is used by AWS to actively send traffic from the VPC to the Customer Gateway (CGW). As AWS customers very frequently leverage Firewall devices as Customer Gateway (CGW) devices and not L3 routers, asymmetric traffic might cause issues with stateful firewall rules. To prevent these issues, AWS indicates the active VPN tunnel through MED, thereby encouraging customers to use that same tunnel for return traffic.

You can see below that the IPSec tunnel with the next hop address *169.254.63.25* has a lower MED - displayed as Metric. Therefore this is the active tunnel within the connection.

```
CSR1000V#sh ip bgp
BGP table version is 292, local router ID is 1.1.1.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              r RIB-failure, S Stale, m multipath, b backup-path, f RT-Filter,
              x best-external, a additional-path, c RIB-compressed,
              t secondary path, L long-lived-stale,
Origin codes: i - IGP, e - EGP, ? - incomplete
RPKI validation codes: V valid, I invalid, N Not found

     Network          Next Hop            Metric LocPrf Weight Path
      0.0.0.0          0.0.0.0                                0 i
 *>   10.0.1.0/24      0.0.0.0                  0         32768 i
 *>   10.0.16.0/24     0.0.0.0                  0         32768 i
 *>   172.16.0.0/24    169.254.63.25          100             0 64512 i
 *                     169.254.39.225         200             0 64512 i
```

## Traffic engineering example

If you're not using stateful rules on your CGW, you might be tempted to override the MED value with a Local_Pref to force return traffic through the standby tunnel and thereby increasing the overall throughput. While doing this you might hope that now one tunnel - serving traffic from AWS VPC to on-premises - will provide you a throughput of ~ 1.25 Gbps, while the other tunnel - serving traffic from on-premises to the AWS VPC - will provide you an additional throughput of ~1.25 Gbps. The result should be an increased thoughput at ~ 2.5 Gbps.

This train of thought shows that you understood the fundamental principles of BGP and how to use them to influence traffic. Congratulation!

Unfortunately the AWS Site-to-Site (IPSec) VPN specific throughput limitation of ~ 1.25 Gbps is per connection and not per tunnel as the VGW is the forcing element. Therefore this approach will not yield the desired results.

# Best Path selectiom algorithm relaxation 

Various router platforms offer different sets if capabilities to relax the rules around the BGP best path selection algorithm. While by default e.g. MED are only considered across path with the same neighboring ASN, the Cisco IOS command *bgp always-compare-med* ignores the ASN when considering MEDs. We saw in the previous blog post [AWS Transit Gateway with Direct Connect Gateway and Site-to-Site (IPSec) VPN Backup](https://www.edge-cloud.net/2019/08/16/aws-dxgw-with-ipsec-vpn-backup/#multi-exit-discriminator-med) how this can used in the case of AWS.

# BGP Multipath

With regards to what we learned in the [previous post](https://www.edge-cloud.net/2020/09/18/understanding-routing/) about route tables, it is important to understand that only the best path is installed in the route table. Only if the BGP best path selection algorithm results in a "tie", more than one route can be installed into the route table.

This is called BGP Multipath and it is independent of whether the underlying route table has [Equal-cost multi-path routing (ECMP)](https://en.wikipedia.org/wiki/Equal-cost_multi-path_routing) capabilities. In other words: To have full ECMP capability on a BGP enabled router, BGP needs to deliver parallel path to the routing table and the router needs to make use of them. 

Therefore if we want to use ECMP with prefixes learned over BGP, we have to enforce such a "tie". This means we need to ensure the following BGP attributes are kept same on each paths:
* Weight
* Local Preference
* AS Path (both AS number and AS path length)
* Origin code
* MED
* IGP metric

Various routing platforms offer ways to relax some of the attributes as tie breaker. As an example, the Cisco IOS command *bgp bestpath as-path multipath-relax* will ignore the actual AS numbers and only consider the AS path length. This allows ECMP across multiple upstream provider. 

# Summary

Today's blog post builds on what you've learned in the previous blog post on [Better understanding IP Routing](https://www.edge-cloud.net/2020/09/18/understanding-routing/). It provides an introduction into the BGP Best Path Selection Algorithm and how to use some of the valued to influence traffic flowing into (ingress) and out of (egress) your ASN.
