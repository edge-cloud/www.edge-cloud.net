---
title: Use AWS Direct Connect to connect your on-premise locations
author: Christian Elsen
excerpt: Use AWS with Direct Connect and Transit Gateway to interconnect on-premise locations
layout: single
permalink: /2019/12/27/aws-dx-connect-on-premises/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

This post covers the caveats of data flow between on-premise locations with [AWS Direct Connect](https://aws.amazon.com/directconnect/). As you might have multiple on-premise locations already connected via Direct Connect, enabling the data flow between them is not always trivial.

# Caveats

While implementing this approach there are a few caveats that need to be considered.

## Intra Region traffic

Keep [in mind](https://edge-cloud-net.web.app/2019/09/06/dx-gateway-deep-dive/) that the AWS Direct Connect Gateway does not allow you to route traffic from one Virtual Interface to another Virtual Interface. Therefore the traffic flow as despicted in Figure 1 is not possible.

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect-Non-Working.png" caption="Figure 1: Unsupported VIF to VIF routing with Direct Connect Gateway." %}

If you have a need to route traffic between offices in a certain region through the same AWS region, you need to leverage a separate Direct Connect Gateway, Transit VIF, and Direct Connect connection for each of your offices. The resulting design is depicted in Figure 2.  

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect-Working.png" caption="Figure 2: Workaround to leverage Transit Gateway for intra-office routing." %}

This approach could make sense in case you have the requirement of inspecting and filtering traffic between on-premises locations. In case you have no such requirement, it makes more sense to route traffic between locations directly via the Carrier Ethernet connectivity (Figure 3), completely leaving it out of AWS.

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect_RegionalOffice.png" caption="Figure 3: Intra-office connectivity within the same region." %}

Such setup will reduce the cost for Direct Connect connections.

## Inter Region traffic

Thanks to the recently released capability of [Inter-Region Peering](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-transit-gateway-supports-inter-region-peering/) for the Transit Gateway you can extend the above described model and connect your offices across the globe with AWS Direct Connect and Transit Gateway (Figure 4).

{% include figure image_path="/content/uploads/2019/12/AWS-Interconnect_GlobalOffice.png" caption="Figure 4: Intra-office connectivity outside a region over the AWS backbone." %}

This approach is also useful in case you want to connect your on-premise locations to more than three AWS regions. Due to the limitation of only being able to connect [up to three Transit Gateways per Direct Connect Gateway](https://www.edge-cloud.net/2019/09/06/dx-gateway-deep-dive/) regionalizing your Direct Connect Gateways this way allows you to scale very elegantly.

# Summary

In this article we discuss the caveats of data path between your on-premises locations while using [AWS Direct Connect](https://aws.amazon.com/directconnect/).