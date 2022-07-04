---
title: Enabling connectivity between on-premises locations connected to AWS through Direct Connect
author: Christian Elsen
excerpt: Caveats for data flow between multiple on-premises locations, when using AWS with Direct Connect and Transit Gateway
layout: single
permalink: /2019/12/27/aws-dx-connect-on-premises/
image: /content/uploads/2019/12/AWS-Interconnect.png
redirect_from:
  - /2019/12/27/aws-as-your-isp/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
  - Direct-Connect
toc: true
---

This post covers the caveats of data flow between on-premises locations that are each connected to AWS via [AWS Direct Connect](https://aws.amazon.com/directconnect/). In case you have multiple on-premise locations connected to AWS via Direct Connect, enabling the data flow between these locations is not always trivial. Therefore this blog post highlights some of the pitfalls and outlines possible solutions.

# Introduction

This blog post assumes the fundamental design as depicted in Figure 1. One or more on-premises locations such as offices connect via carrier ethernet or another local connectivity option to two Direct Connect locations within close proximity.

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect.png" caption="Figure 1: Design to enable connectivity between on-premises locations and AWS within a geo." %}

Traffic from on-premises destined to AWS is routed via one of the two Direct locations, while the other location serves as backup path. Alternatively both Direct Connect locations can be used in an Active/Active setup.

# Caveats

While implementing this approach of enabling connect between on-premises locations there are a few caveats that need to be considered.

## Intra Region traffic

Keep [in mind](https://edge-cloud-net.web.app/2019/09/06/dx-gateway-deep-dive/) that the AWS Direct Connect Gateway does not allow you to route traffic from one Virtual Interface to another Virtual Interface. Therefore the traffic flow as despicted in Figure 2 is not currently possible.

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect-Non-Working.png" caption="Figure 2: Unsupported VIF to VIF routing with Direct Connect Gateway." %}

If you have a need to route traffic between on-premise locations in a certain region through the same AWS region, you need to leverage a separate Direct Connect Gateway, Transit VIF, and Direct Connect connection for each of your offices. The resulting design is depicted in Figure 3.  

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect-Working.png" caption="Figure 3: Workaround to leverage Transit Gateway for intra-office routing." %}

This approach could make sense in case you have the requirement of inspecting and filtering traffic between on-premises locations via an AWS-based device. In case you have no such requirement, it makes more sense to route traffic between locations directly via e.g. a local Carrier Ethernet connectivity (Figure 4), completely leaving it out of AWS.

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect_RegionalOffice.png" caption="Figure 4: Intra-office connectivity within the same region." %}

## Inter Region traffic

Thanks to the recently released capability of [Inter-Region Peering](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-transit-gateway-supports-inter-region-peering/) for the Transit Gateway you can extend the above described model and connect your on-premises locations across the globe to AWS using AWS Direct Connect and Transit Gateway (Figure 5).

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect_GlobalOffice.png" caption="Figure 5: Intra-office connectivity outside a region over the AWS backbone." %}

This approach is also useful in case you want to connect your on-premises locations to more than three AWS regions. Due to the limitation of only being able to connect [up to three Transit Gateways per Direct Connect Gateway](https://www.edge-cloud.net/2019/09/06/dx-gateway-deep-dive/) regionalizing your Direct Connect Gateways this way allows you to scale very elegantly.

# Summary

In this article we discuss the caveats of data path between your on-premises locations while using [AWS Direct Connect](https://aws.amazon.com/directconnect/).
