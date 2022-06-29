---
title: AWS Direct Connect Gateway Deep Dive
author: Christian Elsen
excerpt: A deep dive look into the AWS Direct Connect Gateway
layout: single
permalink: /2019/09/06/dx-gateway-deep-dive/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

In November 2017 AWS [released](https://aws.amazon.com/blogs/aws/new-aws-direct-connect-gateway-inter-region-vpc-access/) AWS Direct Connect Gateway, which is probably one of the biggest innovations within the [AWS Direct Connect](https://aws.amazon.com/directconnect/) product in recent years. At the same time Direct Connect Gateway is often overlooked or not well understood. Therefore this blog post will dive deeper at the ins and outs of this extremely helpful AWS network capability.

# Use Cases

[AWS Direct Connect Gateway](https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways.html) allows you establish connectivity that spans Virtual Private Clouds (VPCs) spread across multiple AWS Regions. Instead of establishing multiple BGP sessions for each VPC, you only need to establish a single BGP session with the Direct Connect Gateway per DX location.
As the AWS Direct Connect Gateway is a global object, VPCs and DX locations in any location (except China) can be bridged.

The rules of IP routing still apply and you will only be able to reach VPCs from on-premises locations if the IP CIDRs don't overlap.  
{: .notice--info}

This functionality of AWS Direct Connect Gateway allows you to accomplish the following very common use cases:

## Direct Connect to remote regions

Before Direct Connect Gateway you were only able to reach the AWS Region [associated with a DX location](https://aws.amazon.com/directconnect/features/#AWS_Direct_Connect_Geographic_Regions) via a Private Virtual Interface (VIF). With this the AWS DX location at e.g. CoreSite NY1, New York, NY could only establish a Private VIF for usage in the US-East (N. Virginia) region, but not for the US-West (Oregon) region (See Figure 1).

{% include figure image_path="/content/uploads/2019/09/DX-Associated-Region.png" caption="Figure 1: Direct Connect with associated AWS region." %}

If you required to access multiple AWS regions via Direct Connect over Private VIFs you had to work with [AWS Direct Connect Partners](https://aws.amazon.com/directconnect/partners/) to establish a presence in a DX location associated with the AWS Region of interest. Depending on your location and the location of the DX location this could become very expensive.

With AWS Direct Connect Gateway you can now access Virtual Private Clouds (VPC) via Virtual Private Gateways (VGW) in any AWS region (except China) from any Direct Connect location (except China), simplifying this use case dramatically (See Figure 2).

{% include figure image_path="/content/uploads/2019/09/DX-with-DXGW.png" caption="Figure 2: Direct Connect with Direct Connect Gateway." %}

This dramatically improves flexibility and reduces cost, when connecting from on-premises to AWS regions. Looking at the [AWS Direct Connect data transfer cost](https://aws.amazon.com/directconnect/pricing/#AWS_Direct_Connect_data_transfer) for AWS Regions in North America, you can see that the data transfer OUT price to any of the Direct Connect locations in North America is the same at currently $0.02. Therefore in this case picking a Direct Connect location within North America that is the closest to your on-premises location does not increase the AWS cost.

## Connectivity to multiple Virtual Private Clouds (VPC)

If you want to connect from on-premises to multiple Virtual Private Clouds (VPCs) within AWS, without Direct Connect Gateway you had to create a separate Private Virtual Interface on your DX connection for each of these VPCs. In addition you had to create a separate BGP peering over the different VLANs for each of these Private Virtual Interfaces between your physical router and the Virtual Private Gateway (VGW) in AWS.

As depicted in Figure 2, with Direct Connect Gateway there is only one Private Virtual Interface necessary to connect to multiple VPCs. As a result you now only need to establish a single BGP session between your on-premises router and the Direct Connect gateway. When attaching additional VPCs their CIDRs are propagated towards on-premises - with the Direct Connect Gateway's ASN as the origin - towards on-premises.

This also simplifies the physical setup of your Direct Connect dramatically.

## AWS Transit Gateway with Direct Connect

If you want to connect an [AWS Transit Gateway](https://aws.amazon.com/transit-gateway/) to on-premises via AWS Direct Connect, you have to leverage AWS Direct Connect Gateway (See Figure 3). It is not possible to connect directly to a Direct Connect connection from a Transit Gateway.  

{% include figure image_path="/content/uploads/2019/09/DXGW-with-TGW.png" caption="Figure 3: Direct Connect Gateway with Transit Gateway." %}

# Attachments and associations

AWS Direct Connect Gateway is a global AWS object which supports "Virtual Interface Attachments" on the on-premises facing side and "Gateway Associations" on the AWS facing side. These attachments and associations cannot be freely mixed and matched, but instead only allow two fixed combinations. Below is an overview of these two combinations and resulting attachments and associations.

* **Virtual Private Gateway with Private Virtual Interface:** In this case the AWS-facing termination point, or gateway association, is a Virtual Private Gateway (VGW). A VGW can connect to exactly one VPC. The on-premises facing corresponding attachment for this scenario is a private virtual interface.
An AWS Direct Connect *Dedicated Connection* can support up to 50 such private virtual interfaces. A or *Hosted Connection* or *Hosted Virtual Interface* on the other hand support only supports a single virtual Interface, which can be Private Virtual Interface.

* **Transit Gateway with Transit Virtual interface:** A Transit Gateway is an AWS networking component, which allows you to connect multiple VPCs, Direct Connect Gateways, and Site-to-Site (IPSec) VPNs together via attachments. Currently these attachments have to reside in the same AWS region, except for peering to other TGW - which can be in the same or another region. In this case the on-premises facing attachment of the Direct Connect Gateway is a Transit Virtual Interface (VIF).
Only AWS Direct Connect *Dedicated Connections* or *Hosted Connections* with a capacity of [greater than or equal to 1G](https://aws.amazon.com/directconnect/partners/) support Transit VIFs. In the case of a Dedicated Connection you can use one Transit VIF in addition to 50 private or public VIFs. In the case of a Hosted Connection - which only provides a single Virtual Interface - that VIF can either be a private, public or transit Virtual Interface.
AWS Direct Connect *Hosted Virtual Interfaces* do not support Transit VIFs at all.


# Automation

AWS Direct Connect gateway supports various forms of automation via it's API.

* **API and SDKs:** The AWS Direct Connect gateway's API is part of the [AWS Direct Connect API](https://docs.aws.amazon.com/cli/latest/reference/directconnect/index.html). Therefore you can manage AWS Direct Connect gateway via [AWS SDKs and command line tools](https://aws.amazon.com/tools/).
* **CloudFormation:** As of today, CloudFormation does not support AWS Direct Connect and therefore also does not support AWS Direct Connect gateway.
* **TerraForm:** HashiCorp's TerraForm does support creation and management of [AWS Direct Connect gateways](https://www.terraform.io/docs/providers/aws/r/dx_gateway.html).

# Multi-Account support

Similar to AWS Direct Connect itself, DX Gateway also support multi-account setups. This is especially important for larger customer that want to split ownership of the components across teams or units. Also customers of [AWS GovCloud (US)](https://aws.amazon.com/govcloud-us/) benefit from this capability, as various components can be managed from a standard commercial account instead of the GovCloud account.

Lookin at a standard deployment as depicted in Figure 4, it is possible - although not necessary - to split ownership of the three component types across different accounts.

{% include figure image_path="/content/uploads/2019/09/DXGW-Owner.png" caption="Figure 4: Possible account ownership in multi-account setup." %}

To share ownership between DX Gateway and the DX Connection, the owner of the DX connection creates a new Virtual Interface and assigns it to the account that owns the DX Gateway. The account owning the DX Gateway can then accept this Virtual Interface and attach it to a DX Gateway.

Similarly if the account owning the AWS Virtual Private Gateway (VGW) or AWS Transit Gateway (TGW), as well as the account owning the Direct Connect gateway belong to the same AWS payer account ID, sharing is here possible as well. In that case the account owner of the AWS Virtual Private Gateway (VGW) or AWS Transit Gateway (TGW) [initiates the association proposal](https://docs.aws.amazon.com/directconnect/latest/UserGuide/multi-account-associate-vgw.html), which has to be approved by the account owning the Direct Connect Gateway.

# Restrictions and Limits

The following limits and restrictions apply to Direct Connect Gateway.

## Object Limits

The number of AWS Direct Connect gateways and associated objects is [limited](https://docs.aws.amazon.com/directconnect/latest/UserGuide/limits.html) within a single AWS account to the following values:
* **AWS Direct Connect gateways per account:** 200
* **Virtual Interfaces:** 30 (Either Private Virtual Interfaces or Transit Virtual Interfaces)
* **Transit Gateways:** 3 (Cannot be combined with Virtual Private Gateways)
* **Virtual Private Gateways:** 10 (Cannot be combined with Transit Gateways)

## Data flow

Direct Connect Gateway is geared towards data flows between AWS-facing Gateway associations and on-premises facing VIF attachments. This is depicted in Figure 5 as green paths. Data flow between associated Gateways connected to the same Direct Connect Gateway, depicted in Figure 5 as red path, is only possible if an aggregate route (e.g. 0.0.0.0/0) for the other gateway is announced over Direct Connect. In the depicted example announcing 172.16. 0.0/12 and 192.168. 0.0/16 from one of the on-premises locations would enable the traffic path shown in red.
Data flow between multiple VIFs is only possible via the optional [SiteLink](https://aws.amazon.com/blogs/aws/new-site-to-site-connectivity-with-aws-direct-connect-sitelink/) capability. This is depicted in Figure 5 as orange path.

{% include figure image_path="/content/uploads/2019/09/DXGW-DataFlow-SiteLink.png" caption="Figure 5: Permitted data flow (green), data flow with optional SiteLink enabled (orange) and not permitted data flow (red) with Direct Connect Gateway." %}

## BGP prefixes

You are also limited by the number of BGP prefixes that you can announce from on-premises networks towards AWS, as well as from AWS towards on-premises (Figure 6).

{% include figure image_path="/content/uploads/2019/09/DXGW-BGP-Limits.png" caption="Figure 6: BGP prefix limits with Direct Connect Gateway." %}

Looking at the example in Figure, you also want to keep aggregates in mind. While you can e.g. announce 100 prefixes from each of the two corporate data center depicted, in the case of these prefixes being non-overlapping, not all 200 prefixes will make it into an associated VPC route table. That's due to the VPC route table only being able to hold [100 BGP advertised (propagated) routes](https://docs.aws.amazon.com/vpc/latest/userguide/amazon-vpc-limits.html#vpc-limits-route-tables).

If you advertise more than 100 routes over the BGP session, the BGP session will go into an idle state.
{: .notice--info}

# Summary

This article provided deeper insights into AWS Direct Connect Gateway, covering use cases, the Direct Connect Gateway components, multi-account setup support, as well as limits and restrictions.
