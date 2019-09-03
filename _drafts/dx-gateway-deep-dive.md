---
title: AWS Direct Connect Deep Dive
author: Christian Elsen
excerpt: A deep dive look into the AWS Direct Connect Gateway
layout: single
permalink: /2019/09/05/dx-gateway-deep-dive/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish




# Use Cases

AWS Direct Connect Gateway allows you establish connectivity that spans Virtual Private Clouds (VPCs) spread across multiple AWS Regions. Instead of establishing multiple BGP sessions for each VPC, you only need to establish a single BGP session with the Direct Connect Gateway per DX location.
As the AWS Direct Connect Gateway is a global object, VPC and DX locations in any location (except China) can be bridged.

The rules of IP routing still apply and you will only be able to reach VPCs from on-premises locations if the IP CIDRs don't overlap.  
{: .notice--info}

This functionality of AWS Direct Connect Gateway allows you to accomplish the following very common use cases:

## Direct Connect to remote regions

Before Direct Connect Gateway you were only able to reach the AWS Region [associated with a DX location](https://aws.amazon.com/directconnect/features/#AWS_Direct_Connect_Geographic_Regions) via a Private Virtual Interface (VIF). With this the AWS DX location at e.g. CoreSite NY1, New York, NY could only establish a Private VIF for usage in the US-East (N. Virginia) region, but not for the US-West (Oregon) region (See Figure 1).

{% include figure image_path="/content/uploads/2019/09/DX-Associated-Region.png" caption="Figure 1: Direct Connect with associated AWS region." %}

If you required to access multiple AWS regions via Direct Connect over Private VIFs you had to work with [AWS Direct Connect Partners](https://aws.amazon.com/directconnect/partners/) to establish a presence in a DX location associated with the AWS Region of interest. Depending on the location of the DX location this could become very expensive.

With AWS Direct Connect Gateway you can now access Virtual Private Clouds (VPC) via Virtual Private Gateways (VGW) in any AWS region (except China) from any Direct Connect location (except China), simplifying this use case dramatically (See Figure 2).

{% include figure image_path="/content/uploads/2019/09/DX-with-DXGW.png" caption="Figure 2: Direct Connect with Direct Connect Gateway." %}

## AWS Transit Gateway with Direct Connect

If you want to connect an [AWS Transit Gateway](https://aws.amazon.com/transit-gateway/) to on-premises via AWS Direct Connect, you have to leverage AWS Direct Connect Gateway (See Figure 3). It is not possible to connect directly to a Direct Connect connection from a Transit Gateway.  

{% include figure image_path="/content/uploads/2019/09/DXGW-with-TGW.png" caption="Figure 3: Direct Connect Gateway with Transit Gateway." %}

# Attachments and associations

## Virtual Interface Attachments

* **Private Virtual interface:**
* **Transit Virtual Interface:**

## Gateway associations

* **Virtual Private Gateway:**
* **Transit Gateway:**

It is important to point out that you can only connect a Direct Connect Gateway to either Transit Gateways (TGW) or Virtual Private Gateways (VGW), but not both. Also Transit Gateways (TGW) can only be accessed over Transit Virtual Inter (Transit VIF), while Virtual Private Gateways (VGW) can only be accessed over Private Virtual Interfaces (Private VIF).

# Multi-Account support

{% include figure image_path="/content/uploads/2019/09/DXGW-Owner.png" caption="Figure 4: Possible account ownership in multi-account setup." %}

# Restrictions and Limits

## Object Limits

* **AWS Direct Connect gateways per account:** 200
* **Virtual Interfaces:** 30 (Either Private Virtual Interfaces or Transit Gateways)
* **Transit Gateways:** 3 (Cannot be combined with Virtual Private Gateways)
* **Virtual Private Gateways:** 30 (Cannot be combined with Transit Gateways)

## Data flow

{% include figure image_path="/content/uploads/2019/09/DXGW-DataFlow.png" caption="Figure 5: Permitted data flow (green) and not permitted data flow (red) with Direct Connect Gateway." %}

## BGP prefixes

{% include figure image_path="/content/uploads/2019/09/DXGW-BGP-Limits.png" caption="Figure 6: BGP prefix limits with Direct Connect Gateway." %}

## Direct Connect SLA

[AWS Direct Connect Service Level Agreement](https://aws.amazon.com/directconnect/sla/)

# Summary
