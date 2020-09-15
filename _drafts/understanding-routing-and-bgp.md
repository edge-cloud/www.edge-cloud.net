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

Today we will look at some of the fundamental principles of IP routing, along with some related BGP Routing protocol concepts. While these principles and concepts are generic, we will use examples based on AWS networking.
I've seen numerous people confused by these principles and concepts while either designing networks or troubleshooting them. Therefore it appears to be a good idea to point them out explicitly.

Please keep in mind that we will be using AWS VPCs and TGWs to illustrate routing principles. The AWS networking designs presented are rather not suited or recommended for production deployments.  
{: .notice--info}

# Routing

[Routing](https://en.wikipedia.org/wiki/Routing) and more specifically here, [IP routing](https://en.wikipedia.org/wiki/IP_routing), deals with selecting a path for traffic in an IP network. Routing directs the forwarding of IP packets based on a [routing table](https://en.wikipedia.org/wiki/Routing_table).

## Route Tables

As we will see later, routing tables maintain information on how to reach various network destinations. Typically they are either configured manually (also known as "Static Routing") or with the help of a routing protocol.

## Hop-by-Hop Routing

One of the most fundamental concepts to understand in IP routing is that the actual forwarding decision is made on a hop-by-hop basis. This means that within each hop of the network path, a router makes a forwarding decision based on the local route table. Image this to be like a boardgame, where at each step in the game it is decided where to go next. Neither the previous nor the next step have any influence on the local decission (See Figure 1).

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-boardgame.jpg" caption="Figure 1: IP Hop-by-Hop routing is like a boardgame." %}

Taking AWS VPCs and [Transit Gateways (TGWs)](https://aws.amazon.com/transit-gateway/?aws-transit-gateway-wn.sort-by=item.additionalFields.postDateTime&aws-transit-gateway-wn.sort-order=desc) as an example, we can quickly understand how this hop-by-hop decision making plays out while looking at the routing tables of the VPCs and TGWs (See Figure 2).

{% include figure image_path="/content/uploads/2020/09/Understanding-Routing-and-BGP-Hop-by-Hop.png" caption="Figure 2: IP Hop-by-Hop routing with VPCs and multiple Transit Gateways (TGW)" %}

Traffic from an EC2 instance in VPC 1 wanting to reach another EC2 instance in VPC 2 will have to follow this hop-by-hop process through the five routing tables involved here. What do you think? Will traffic from VPC 1 reach VPC 2? Or is there a mistake in the route tables?

Let's look at each hop, step-by-step:
 * **VPC 1:** Traffic for destinations within VPC 2's CIDR of 10.2.0.0/16 are send to the TGW 1 over the VPC attachment.
 * **TGW 1:** Inspecting the route table of TGW 1, we can see that traffic for 10.2.0.0/16 is send via a TGW peering to TGW 2.
 * **TGW 2:** Looking at the route table of TGW 2, we can also find an entry for the destination of 10.2.0.0/16. It specifies that traffic should be send via another TGW peering to TGW 3.
 * **TGW 3:** At this point our traffic has already made it into the correct AWS regions. Let's see what happens next: The route table of TGW 3 indicates that traffic for 10.2.0.0/16 will be forwarded to VPC 2.
 * **VPC 2:** Last but not least, the route table of VPC 2 shows that traffic for the locally used CIDR 10.2.0.0/16 remains within the VPC and is delivered to the corresponding EC2 instance.  

But what about the return traffic from VPC 2 to VPC 1? Read on to see how another important principle of IP routing plays a role here.

## Directional

Another important principle of IP routing, effectively caused by the hop-by-hop decision making behavior is that path determination is directional. Looking back at the provided example in the previous section (See Figure 2) only showed us that traffic from VPC 1 can reach VPC 2. But it did not provide any information on whether traffic from VPC 2 can reach VPC 1.

I leave it up to you as an exercise to determine if the route tables across the VPCs and TGWs are setup correctly to allow return traffic and thereby enable bidirectional communication.

When designing route tables or troubleshooting network connectivity it's always important that you look at traffic flows in both directions and plan or check route table independently for both directions.
Also when talking with co-workers, customer, support staff, or anyone alike it is also important that you indicate the direction of the traffic flow that you are referring to.

### Asymmetric Routing

What's even more interesting is that the directional nature of IP forwarding can lead to asymmetric traffic flows. But there is nothing wrong like this. In fact an asymmetric IP traffic flow is like a hiking trail loop (See Figure 3). Such hiking trails are often more fascinating as you get to see a different set of landscape, plants and animals on the way back as compared to the way out.

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-trail-map.jpg" caption="Figure 3: Asymmetric routing is like a hiking-trail loop. " %}

And as long as you make the correct decision at your "routing hops" - aka. a trail fork - you will return to your trail head as well.

Let's extend the above example using AWS VPCs and TGWs to showcase asymmetric routing. For this we add another TGW and two more TGW peering connections along with changes to the route table (See Figure 4).

{% include figure image_path="/content/uploads/2020/09/Understanding-Routing-and-BGP-Asymmetric-Routing.png" caption="Figure 4: Asymmetric routing with VPCs and multiple Transit Gateways (TGW)" %}

Now, if you follow the path of traffic from VPC 1 to VPC 2, you'll notice that nothing has changed. Traffic still traverses TGW 1, TGW 2, and TGW 3 on the way to VPC 2. But now look at traffic from VPC 2 to VPC 1. What do you notice?
Looking at the route tables of the TGWs you should notice that traffic  on the return path from VPC 2 to VPC 1 will traverse TGW 3, TGW 4, and TGW 1, thereby creating and asymmetric path.

This asymmetric traffic flow is depicted with the green arrows. 

# Routing Protocols

## BGP

### BGP Best Path Selection Algorithm

#### Local_Pref

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-exit.jpg" caption="Figure 5: Local_Pref dictates how traffic leaves a local ASN." %}

#### Multi-Exit Discriminator (MED)

{% include figure image_path="/content/uploads/2020/09/understanding-routing-and-bgp-main-entrance.jpg" caption="Figure 6: Multi-Exit Discriminator (MED) suggests how traffic should enter an ASN." %}

# Summary

Fill me out
