---
title: AWS Direct Connect overview
author: Christian Elsen
excerpt: Overview of AWS Direct Connect
layout: single
permalink: /2022/07/13/dx-overview/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish

# Overview

AWS Direct Connect provides direct connectivity to the AWS Network via 3rd party colocation facilities (DX locations), using a cross-connect between an AWS-owned device and either a customer or partner owned device. 

{% include figure image_path="/content/uploads/2022/07/DX-Physical.png" caption="Figure 1: Direct Connect Overview" %}

# Elements

An AWS Direct Connect consists of two elements: Physical Connection and Logical Connection

## Physical Connection

Ethernet over single-mode fiber, providing an 802.1Q trunk (VLANs). 1000BASE-LX (1310 nm) transceiver for 1 gigabit Ethernet, or a 10GBASE-LR (1310 nm) transceiver for 10 gigabit Ethernet, or a 100GBASE-LR4 for 100 gigabit Ethernet..

{% include figure image_path="/content/uploads/2022/07/DX-Cross-Connect.png" caption="Figure 2: Direct Connect Cross Connect" %}

## Logical Connection

One or more of the following virtual interface types:
* Private virtual interface: Access an Amazon VPC using private IP addresses.
* Public virtual interface: Access AWS services from your on-premises data center. Allow AWS services, or AWS customers access your public networks over the interface instead of traversing the internet
* Transit virtual interface: Access one or more Amazon VPC Transit Gateways associated with Direct Connect gateways. You can use transit virtual interfaces with 1/2/5/10/100 Gbps AWS Direct Connect connections. 

{% include figure image_path="/content/uploads/2022/07/DX-VIFs-Overview.png" caption="Figure 3: Direct Connect Logical Overview" %}

# Connection Types

There are three types of connections.

| |Dedicated Connections|Hosted Connections|Hosted Virtual Interfaces (Legacy)|
|---|---|---|---|
|**AWS asigned capacity**|1 Gbps, 10 Gbps or 100 Gbps|50 Mbps to 10 Gbps|None|
|**Private or Public Virtual Interfaces (VIFs)**|50|1|1|
|**Transit Virtual Interface (VIF)**|1|1 (if assigned capacity >= 1 Gbps)|None|
|**Covered under SLA**|Yes|No|No|
|**Supports MACsec (802.1ae)**|Yes (10 Gbps or 100 Gbps at select locations)|No|No|


## Dedicated Connection

A physical Ethernet connection associated with a single customer. Customers can request a dedicated connection through the AWS Direct Connect console, the CLI, or the API. Each dedicated connection can provide 50 Private or Public Virtual Interfaces, as well as 1 Transit Virtual Interface. 

## Hosted Connection

A physical Ethernet connection that an AWS Direct Connect Partner provisions on behalf of a customer. Customers request a hosted connection by contacting a partner in the AWS Direct Connect Partner Program, who provisions the connection. A hosted connection can provide 1 Private Virtual Interface or 1 Public Virtual Interface or 1 Transit Virtual Interface (If the connection speed is 1 Gbps or higher). This connection type is not covered under the [Direct Connect Service Level Agreement (SLA)](https://aws.amazon.com/directconnect/sla/).

## Hosted Virtual Interface (Legacy)

This is a legacy offering which is no longer available for new provisioning by AWS Direct Connect partners, but might still be found in use among customers. This connection type does not provide a bandwidth allocation (oversubscription) and only provides 1 Private Virtual Interface or 1 Public Virtual Interface. No Transit Virtual Interface can be provided. This connection type is not covered under the [Direct Connect Service Level Agreement (SLA)](https://aws.amazon.com/directconnect/sla/).

# Connectivity 

Customers have multiple options to connect via a Direct Connect location:

{% include figure image_path="/content/uploads/2022/07/DX-Connectivity.png" caption="Figure 3: Direct Connect Connectivity Options" %}

If the customer is in a data center / colo facility that is not a DX location, it is best to check with that data center / colo facility for a list of preferred [AWS Direct Connect Partners](https://aws.amazon.com/directconnect/partners/) that can provide DX connectivity into this particular data center / colo facility. Such "on-net" partners can typically provide connectivity faster. 

## In-location cross connect

If the customer has resources deployed in the same data center / colo facility as the DX location, the data center / colo facility can provide a [cross-connect](https://www.coresite.com/solutions/interconnection/cross-connects) between the AWS DX equipment and the customer resources. The customer has to provide a [Letter of Authorization and Connecting Facility Assignment (LOA-CFA)](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Colocation.html) to the facility for this. 

## Layer 2 circuit

Customers can work with [AWS Direct Connect Partners](https://aws.amazon.com/directconnect/partners/) to extend the AWS DX connection at Layer 2 (Data link layer) via a "circuit" from the DX location to the customer location. The router installed at the customer location will directly form a BGP session with the AWS equipment. Example technologies used are [Metro Ethernet](https://en.wikipedia.org/wiki/Metro_Ethernet), [Dark fibre](https://en.wikipedia.org/wiki/Dark_fibre), or [Wavelength](https://en.wikipedia.org/wiki/Wavelength-division_multiplexing).

## Layer 3 network

Customers can work with [AWS Direct Connect Partners](https://aws.amazon.com/directconnect/partners/) to extend the AWS DX connection at Layer 3 (Network layer) from the DX location to the customer location. In this case the the AWS Direct Connect Partner provides a router within the DX location that will form a BGP session with the AWS equipment. The DX partner then established another BGP with the customer, e.g. over an [MPLS](https://en.wikipedia.org/wiki/Multiprotocol_Label_Switching).  

# Commercial Workflow

End-customers have a direct business relationship with AWS and are charged directly for all consumed [AWS services](https://aws.amazon.com/directconnect/pricing/). This includes port-hour fees, charged at a per hour rate and applicable to both Dedicated Connections and Hosted Connections, as well as data transfer prices, charged at a per gigabyte rate. In addition end-customers will need to engage with [Direct Connect Delivery Partners](https://aws.amazon.com/directconnect/partners/) such as carriers, network service providers (NSP), or colocation providers to provide them with network connectivity to AWS. For this they will have a separate contract with this partner and the partner will invoice end-customers for the connectivity services they provide.

{% include figure image_path="/content/uploads/2022/07/Direct-Connect-Commercial-Workflow.png" caption="Figure 4: Commercial Workflow" %}

# Summary

tbd