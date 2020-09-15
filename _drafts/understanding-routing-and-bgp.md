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

## Hop-by-Hop Routing

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-boardgame.jpg" caption="Figure 1: IP Hop-by-Hop routing is like a boardgame." %}


{% include figure image_path="/content/uploads/2020/09/Understanding-Routing-and-BGP-Hop-by-Hop.png" caption="Figure 2: IP Hop-by-Hop routing with VPCs and multiple Transit Gateways (TGW)" %}

## Directional

### Asymmetric Routing

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-trail-map.jpg" caption="Figure 3: Asymmetric routing is like a hiking-trail loop. " %}

{% include figure image_path="/content/uploads/2020/09/Understanding-Routing-and-BGP-Asymmetric-Routing.png" caption="Figure 4: Asymmetric routing with VPCs and multiple Transit Gateways (TGW)" %}

## Route Table

# Routing Protocols

## BGP

### BGP Best Path Selection Algorithm

#### Local_Pref

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-exit.jpg" caption="Figure 5: Local_Pref dictates how traffic leaves a local ASN." %}

#### Multi-Exit Discriminator (MED)

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-main-entrance.jpg" caption="Figure 6: Multi-Exit Discriminator (MED) suggests how traffic should enter an ASN." %}

# Summary

Fill me out
