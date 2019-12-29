---
title: Use AWS as your Internet Service Provider (ISP)
author: Christian Elsen
excerpt: Use AWS with Direct Connect and Transit Gateway as your Internet-Provider
layout: single
permalink: /2019/12/27/aws-as-your-isp/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

This post covers how to use AWS as your Internet Service Provider (ISP). The idea behind this approach is that customers who already connected their on-premises locations, e.g. offices, via [AWS Direct Connect](https://aws.amazon.com/directconnect/) can leverage this connectivity to also provide Internet access via AWS.

# Use Case

Before diving into the solution proposal, let's look at the benefits as well as constraints of this use case.

## Benefits

Leveraging AWS as your centralized egress point to the Internet, allows you to deploy egress inspection or filtering solutions within AWS. This in return enables you to restrict HTTP and HTTPS egress traffic from your offices to a whitelisted set of hostnames (FQDN).
Centralizing such a component will save you licensing and maintenance cost.

The cost of leveraging AWS as the ISP instead of utilizing a local ISP might actually be cheaper. While local ISPs usually charge for Internet connectivity based on the provided maxim bandwidth, the charges associated with AWS are based on consumption.
Assuming you use an EC2-based NAT instance - e.g. as part of the egress filtering solution above - the cost for Internet egress traffic would be the following for the AWS N. Virginia region (US-East-1):
 * Traffic from on-premises to Internet (Request):
   * AWS DX In: 0.00 $/GB
   * Transit Gateway processing: 0.02 $/GB
   * Internet Data Transfer Out: 0.09 $/GB
   * **Sum: 0.11 $/GB**
 * Traffic from Internet to on-premises (Response)
   * AWS DX Out: 0.02 $/GB
   * Transit Gateway processing: 0.02 $/GB
   * Internet Data Transfer In: 0.00 $/GB
   * **Sum: 0.04 $/GB**

In the case you use an [AWS NAT Gateway](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html) the cost increases by 0.045 $/GB in both directions.

Refer to the current price list of [AWS Direct Connect](https://aws.amazon.com/directconnect/pricing/), [AWS Transit Gateway](https://aws.amazon.com/transit-gateway/pricing/), [AWS VPC](https://aws.amazon.com/vpc/pricing/), and [AWS EC2](https://aws.amazon.com/ec2/pricing/on-demand/) for current prices.

## Constraints

As mentioned above this setup assumes that you already have your offices or other interesting on-premises locations connected via AWS Direct Connect with AWS. From a cost perspective this approach also assumes that your on-premises locations are within close proximity of [AWS Direct Connect locations](https://aws.amazon.com/directconnect/features/#AWS_Direct_Connect_Locations). Otherwise the cost of connecting your on-premises locations via an [AWS Direct Connect partner](https://aws.amazon.com/directconnect/partners/) might be more expensive than using a local ISP.

# Design

The fundamental design of this approach is depicted in Figure 1. One of more on-premises locations such as offices connect via [carrier ethernet](https://en.wikipedia.org/wiki/Carrier_Ethernet) or another local connectivity option to two Direct Connect locations within close proximity.

{% include figure image_path="/content/uploads/2019/12/AWS-as-ISP.png" caption="Figure 1: Design to leverage AWS as your ISP." %}

Traffic from on-premises destined to the Internet is routed via one of the two Direct locations, while the other location serves as backup path. Alternatively both Direct Connect locations can be used in an Active/Active setup. Within AWS the egress traffic traverses a Transit VIF, [Direct Connect Gatewy](https://edge-cloud-net.web.app/2019/09/06/dx-gateway-deep-dive/), and Transit Gateway into an "Egress VPC", where an EC2-based Firewall or NAT device resides. Here internal [RFC1918](https://tools.ietf.org/html/rfc1918) addresses are translated via [Elastic IP Addresses](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html) to public IPs.

Refer to the AWS blog post ["Creating a single internet exit point from multiple VPCs Using AWS Transit Gateway"](https://aws.amazon.com/blogs/networking-and-content-delivery/creating-a-single-internet-exit-point-from-multiple-vpcs-using-aws-transit-gateway/) to learn more about creating the egress VPC.

# Caveats

While implementing this approach there are a few caveats that need to be considered.

## Intra Region traffic

Keep [in mind](https://edge-cloud-net.web.app/2019/09/06/dx-gateway-deep-dive/) that the AWS Direct Connect Gateway does not allow you to route traffic from one Virtual Interface to another Virtual Interface. Therefore the traffic flow as despicted in Figure 2 is not possible.

{% include figure image_path="/content/uploads/2019/12/AWS-as-ISP-Non-Working.png" caption="Figure 2: Unsupported VIF to VIF routing with Direct Connect Gateway." %}

If you have a need to route traffic between offices in a certain region through the same AWS region, you need to leverage a separate Direct Connect Gateway, Transit VIF, and Direct Connect connection for each of your offices. The resulting design is depicted in Figure 3.  

{% include figure image_path="/content/uploads/2019/12/AWS-as-ISP-Working.png" caption="Figure 3: Workaround to leverage Transit Gateway for intra-office routing." %}

This approach could make sense in case you have the requirement of inspecting and filtering traffic between on-premises locations. In case you have no such requirement, it makes more sense to route traffic between offices directly via the Carrier Ethernet connectivity (Figure 4), completely leaving it out of AWS.

{% include figure image_path="/content/uploads/2019/12/AWS-as-ISP_RegionalOffice.png" caption="Figure 4: Intra-office connectivity within the same region." %}

Such setup will reduce the cost for Direct Connect connections. 

## Inter Region traffic

Thanks to the recently released capability of [Inter-Region Peering](https://aws.amazon.com/about-aws/whats-new/2019/12/aws-transit-gateway-supports-inter-region-peering/) for the Transit Gateway you can extend the above described model and interconnect your offices across the globe with AWS Direct Connect and Transit Gateway (Figure 5).

{% include figure image_path="/content/uploads/2019/12/AWS-as-ISP_GlobalOffice.png" caption="Figure 5: Intra-office connectivity outside a region over the AWS backbone." %}

When implementing this inter region approach it is highly recommended to egress traffic to the Internet within each AWS region. Carrying traffic destined for the Internet over the AWS backbone does not make financial sense, due to the added cost. In addition traffic would experience increased latency, resulting in a poor end-user experience.

# Summary

In this article we discuss the possibility of using AWS as your Internet Service Provider (ISP), while connecting your on-premises locations, e.g. offices, via [AWS Direct Connect](https://aws.amazon.com/directconnect/) to AWS. It touches on some of the benefits, constraints, and implementation caveats.
