---
title: Understanding Routing and BGP
author: Christian Elsen
excerpt: Primer to better understanding IP routing and BGP
layout: single
permalink: /2020/09/21/understanding-routing-and-bgp/
categories:
  - EdgeCloud
tags:
  - BGP
  - Network
toc: true
---

Intro of what to accomplish

# Routing

## Directional

### Asymmetric Routing

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-trail-map.jpg" caption="Figure 1: Asymmetric routing is like a hiking-trail loop." %}

## Hop-by-Hop Routing

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-boardgame.jpg" caption="Figure 2: IP Hop-by-Hop routing is like a boardgame." %}

## Route Table

# Routing Protocols

## BGP

### BGP Best Path Selection Algorithm

#### Local_Pref

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-exit.jpg" caption="Figure 3: Local_Pref dictates how traffic leaves a local ASN." %}

#### Multi-Exit Discriminator (MED)

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-main-entrance.jpg" caption="Figure 4: Multi-Exit Discriminator (MED) suggests how traffic should enter an ASN." %}

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```

{% include figure image_path="/content/uploads/2020/01/SecuringYourAWSNetwork.png" caption="Figure 1: Setup Overview of EC2-based VPN endpoint for Site-to-Site VPN with AWS" %}

$$
   Buffer (Mbit) = bandwidth (Mbit/s) × delay (s)
$$
