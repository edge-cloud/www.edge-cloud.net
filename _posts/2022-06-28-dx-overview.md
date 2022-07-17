---
title: AWS Direct Connect overview
author: Christian Elsen
excerpt: Overview of AWS Direct Connect, with which you can establish private connectivity between AWS and your data center, office, factory or collocated environment.
layout: single
header:
  og_image: /content/uploads/2022/06/title-dx-overview.png
permalink: /2022/06/28/dx-overview/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
  - Direct-Connect
toc: true
---

[AWS Direct Connect](https://aws.amazon.com/directconnect/) (DX) makes it easy to establish a dedicated connection from an on-premises network to AWS. Using AWS Direct Connect, you can establish private connectivity between AWS and your data center, office, factory or collocated environment. Such connectivity can reduce network costs, increase bandwidth, and provide a more consistent network experience than internet-based connections.

This article will provide an overview of AWS Direct Connect, outlining the various elements, touch upon resiliency recommendations, connectivity options to on-premises and demystify the commercial workflow and associated costs. 

# Overview

AWS Direct Connect provides direct physical connectivity to the AWS Network via 3rd party [colocation facilities (DX locations)](https://aws.amazon.com/directconnect/locations/), using a cross-connect between an AWS-owned device and either a customer- or partner-owned device (See figure 1). 

{% include figure image_path="/content/uploads/2022/06/DX-Physical.png" caption="Figure 1: Direct Connect Overview" class="webfeedsFeaturedVisual"%}

These [DX locations](https://aws.amazon.com/directconnect/locations/) are not AWS data centers, but rather colocation facilities operated by 3rd part providers such as [Equinix](https://www.equinix.com/), [CoreSite](https://www.coresite.com/), [Cologix](https://cologix.com/), [Digital Realty](https://www.digitalrealty.com/), and others. A colocation facility or colocation data center, often referred to as a "colo", is a large datacenter facility that rents out rack space to third parties for their servers or other network equipment. This is a very popular service that is used by businesses that may not have the resources needed to maintain their own data center, but still want to enjoy all the benefits. Or it is used by Network Service Providers to interconnect with partners - such as cloud providers - or customers.

# Benefits

The benefits of using AWS Direct Connect instead of the open Internet can be categorized into:

* **Improved Performance and Reliability:** Improve application performance by connecting directly to AWS and bypassing the public internet. Using DX typically reduces the number of network hops and therefore reduces latency. 

* **Reduced costs:** Reduced networking costs with low data transfer rates out of AWS compared to [AWS data egress fees over the Internet](https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer).

* **Increased security:** Secure data as it moves between on-premises networks and AWS with multiple encryption options, such as [MACsec (IEEE 802.1ae)](https://docs.aws.amazon.com/directconnect/latest/UserGuide/MACsec.html).


# Elements

AWS Direct Connect consists of two elements: The physical connection and the logical virtual interfaces:

## Physical Elements: Connection

Three different connection options exist with "Dedicated Connections", "Hosted Connections" and the legacy model of "Hosted Virtual Interfaces". This legacy connection option is no longer available for new connections.  

| |Dedicated Connections|Hosted Connections|Hosted Virtual Interfaces (Legacy)|
|---|---|---|---|
|**AWS asigned capacity**|1 Gbps, 10 Gbps or 100 Gbps|50 Mbps to 10 Gbps|None|
|**Private or Public Virtual Interfaces (VIFs)**|50|1|1|
|**Transit Virtual Interface (VIF)**|1|1 (if assigned capacity >= 1 Gbps)|None|
|**Partner-only offering**|<i class="fa-solid fa-xmark" style="color:red;" title="No"></i>|<i class="fa-solid fa-check" style="color:green;" title="Yes"></i>|<i class="fa-solid fa-check" style="color:green;" title="Yes"></i>|
|**Covered under SLA**|<i class="fa-solid fa-check" style="color:green;" title="Yes"></i>|<i class="fa-solid fa-xmark" style="color:red;" title="No"></i>|<i class="fa-solid fa-xmark" style="color:red;" title="No"></i>|
|**Supports MACsec (802.1ae)**|<i class="fa-solid fa-check" style="color:green;" title="Yes"></i> (10 Gbps or 100 Gbps at select locations)|<i class="fa-solid fa-xmark" style="color:red;" title="No"></i>|<i class="fa-solid fa-xmark" style="color:red;" title="No"></i>|

### Dedicated Connection

In the case of a "Dedicated Connection", the customer or partner is provided with dedicated Ethernet over single-mode fiber, providing an 802.1q trunk (VLANs) via a cross-connect within a DX location. 
Customers can request a dedicated connection through the AWS Direct Connect console, the CLI, or the API. Each dedicated connection can provide 50 Private or Public Virtual Interfaces, as well as 1 Transit Virtual Interface. 

As depicted in figure 1, the customer or partner will order the colo operator to create a cross-connect from a meet-me room to the customer's or partner's space - also somethimes called cage. 

{% include figure image_path="/content/uploads/2022/06/meet-me-room.jpg" caption="Figure 2: Meet-me room in a colocation facility" %}

A meet-me room is part of a colo that you will most likely never get to see in real life (See figure 2). It is a room where only authorized personell of the colo operator is allowed access to and where data connections are established between customers of the colo. To do so, one customer has to obtain a Letter of Authorization - Connecting Facility Assignment (LOA-CFA) from the other customer - in this case AWS - and provide it to the colo operator. This LOA-CFA document specifies which pre-cabled connection from AWS to the meet-me room is to be used for this particular customer connection. 

The colo operator will then typically terminate the cross connect within the customer or partner space at the top of a particular rack in form of a patch panel (See Figure 3). 

{% include figure image_path="/content/uploads/2022/06/DX-Cross-Connect.png" caption="Figure 3: Direct Connect Cross Connect within a customer's rack" %}

Depending on the chosen speed of the DX connection, different [optical transceiver](https://en.wikipedia.org/wiki/Optical_module) are then used on the customer or partner side to terminate the DX connection on network equipment: 

* 1 Gigabit Ethernet: 1000BASE-LX (1310 nm) transceiver
* 10 Gigabit Ethernet: 10GBASE-LR (1310 nm) transceiver
* 100 gigabit Ethernet: 100GBASE-LR4 transceiver

Multiple Connectivity options between the cross connect termination point and the customer's routers and workloads exist. Refer to the [Connectivity](#connectivity) section below to find out more about these options

### Hosted Connection

In the case of a Hosted Connection, the above described Dedicated Connection is operated by an [AWS Direct Connect Delivery Partner](https://aws.amazon.com/directconnect/partners/) - often a Network Service Provider - which then maps multiple virtual connections to a single physical connection. 
Customers request a Hosted Connection by contacting the AWS Direct Connect Delivery Partner directly. A hosted connection can provide 1 Private Virtual Interface or 1 Public Virtual Interface or 1 Transit Virtual Interface (If the connection speed is 1 Gbps or higher).

These AWS Direct Connect Delivery Partners can also often offer network connectivity from an AWS Direct Connect location to an off-site location, such as an office building, factory or other data center. Therefore in such a scenario all equipment within the AWS Direct Connect location would be owned and operated by the AWS Direct Connect Delivery Partner and shared among multiple customers, usually resulting in lower operational cost and quicker initial implementation times. 

In this case also multiple Connectivity options between the cross connect termination point on the partner's equipment and the customer's routers and workloads exist. Refer to the [Connectivity](#connectivity) section below to find out more about these options

Note that this connection type is not covered under the AWS [Direct Connect Service Level Agreement (SLA)](https://aws.amazon.com/directconnect/sla/).

### Hosted Virtual Interface (Legacy)

This is a legacy offering which is no longer available for new provisioning by AWS Direct Connect Delivery Partners, but might still be found in use among existing customers. While at a first glance looking similar to a "Hosted Connection", this connection type does not provide a dedicated bandwidth allocation on AWS side and is therefore at risk of oversubscription. It only provides 1 Private Virtual Interface or 1 Public Virtual Interface. No Transit Virtual Interface can be provided. This connection type is not covered under the [Direct Connect Service Level Agreement (SLA)](https://aws.amazon.com/directconnect/sla/).


## Logical Elements: Virtual Interfaces (VIF)

A Direct Connect connection supports one or multiple Virtual Interfaces (VIF) as logical component. Refer to the above table to understand which DX connection type offers what kind and how many virtual interfaces. 

{% include figure image_path="/content/uploads/2022/06/DX-VIFs-Overview.png" caption="Figure 4: Direct Connect Logical Overview" %}

While each Virtual Interface type serves a different purpose, they are all provided as an IEEE 802.1q VLAN over a trunk and require use of BGP via IPv4 and/or IPv6 (See Figure 4):

* **Private virtual interface:** Access an Amazon VPC using private IP addresses. Can be combined with a [Direct Connect Gateway](https://www.edge-cloud.net/2019/09/06/dx-gateway-deep-dive/) to access VPCs outside the associated AWS region. 
* **Public virtual interface:** Access AWS services from your on-premises data center. Allow AWS services, or AWS customers access your public networks over the interface instead of traversing the internet. Does not leverage Direct Connect Gateways (DX-GW) or Virtual Private Gateways (VGW). 
* **Transit virtual interface:** Access one or more Amazon VPC Transit Gateways associated with Direct Connect Gateways (DX-GW). You can use transit virtual interfaces with 1/2/5/10/100 Gbps AWS Direct Connect connections. Use of a [Direct Connect Gateway](https://www.edge-cloud.net/2019/09/06/dx-gateway-deep-dive/) is mandatory. 

# Resiliency

In order to achieve high resiliency, AWS recommends customers to follow the [AWS Direct Connect Resiliency Recommendations](https://aws.amazon.com/directconnect/resiliency-recommendation/). These recommendations outline three different topoly types that are mapped to the coresponding AWS [Direct Connect Service Level Agreement (SLA)](https://aws.amazon.com/directconnect/sla/):

* **High Resiliency for Critical Workloads:** 2x Direct Connect connections across 2x different Direct Connect locations
* **Maximum Resiliency for Critical Workloads:** 4x Direct Connect connections across 2x different Direct Connect locations with 2x connections in each location. 
* **Non-Critical Production Workloads or Development Workloads:** 2x Direct Connect connections across a single Direct Connect locations

Redundant Direct Connect connections are highly recommended as AWS need to perform regular [maintenance](https://aws.amazon.com/premiumsupport/knowledge-center/prepare-direct-connect-maintenance/) on individual connections. 

If you decide to use a Site-to-Site (IPSec) VPN as backup to your DX, while using AWS Transit Gateway, refer to [this previous article](https://www.edge-cloud.net/2019/08/16/aws-dxgw-with-ipsec-vpn-backup/) on how to setup the routing correctly.

# Connectivity 

Customers have multiple options to connect their own network equipment via a Direct Connect location (See Figure 5).

{% include figure image_path="/content/uploads/2022/06/DX-Connectivity.png" caption="Figure 5: Direct Connect Connectivity Options" %}

* **In-location cross connect (Option 1):** If the customer has resources deployed in the same colo facility as the DX location, the colo facility can provide a cross-connect between the AWS DX equipment and the customer resources. The customer has to provide a [Letter of Authorization and Connecting Facility Assignment (LOA-CFA)](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Colocation.html) to the facility for this. This option is only available for Dedicated Connections. 

* **Layer 2 circuit (Option 2):** Customers can work with [AWS Direct Connect Delivery Partners](https://aws.amazon.com/directconnect/partners/) to extend the AWS DX connection at Layer 2 (Data link layer) via a "circuit" from the DX location to the customer location. The router installed at the customer location will directly form a BGP session with the AWS equipment. Example technologies used are [Metro Ethernet](https://en.wikipedia.org/wiki/Metro_Ethernet), [Dark fibre](https://en.wikipedia.org/wiki/Dark_fibre), or [Wavelength](https://en.wikipedia.org/wiki/Wavelength-division_multiplexing). This option can be used with Dedicated Connections as well as Hosted Connections. 

* **Layer 3 network (Option 3):** Customers can work with [AWS Direct Connect Delivery Partners](https://aws.amazon.com/directconnect/partners/) to extend the AWS DX connection at Layer 3 (Network layer) from the DX location to the customer location. In this case the the AWS Direct Connect Partner provides a router within the DX location that will form a BGP session with the AWS equipment. The DX partner then establishes another BGP with the customer, e.g. over an [MPLS](https://en.wikipedia.org/wiki/Multiprotocol_Label_Switching). This option can be used with Dedicated Connections as well as Hosted Connections. 



If the customer is located in a data center or colo facility that is not a DX location, it is best to check with that data center or colo facility for a list of preferred [AWS Direct Connect Delivery Partners](https://aws.amazon.com/directconnect/partners/) that can provide DX connectivity into this particular data center or colo facility. Such "on-net" partners can typically provide connectivity faster. 


# Commercial Workflow

End-customers have a direct business relationship with AWS and are charged directly for all consumed [AWS services](https://aws.amazon.com/directconnect/pricing/). AWS Direct Connect is priced by AWS based on two criteria: 

* **Port hours:** This is determined based on the capacity and the type of connection (It could be dedicated or hosted connection). 
* **Outbound data transfer:** The outbound charges are calculated for private virtual interfaces and transit virtual interfaces. This refers to the data which is transferred over the AWS Direct Connect in terms of GB. No additional charges are inferred when a multi-account Direct Connect gateway is used.  

In addition end-customers will need to engage with [Direct Connect Delivery Partners](https://aws.amazon.com/directconnect/partners/) such as carriers, network service providers (NSP), or colocation providers to provide them with network connectivity to AWS. For this they will have a separate contract with this partner and the partner will invoice end-customers for the connectivity services they provide.

{% include figure image_path="/content/uploads/2022/06/Direct-Connect-Commercial-Workflow.png" caption="Figure 6: Commercial Workflow" %}

# Summary

This article provided an overview of [AWS Direct Connect](https://aws.amazon.com/directconnect/) (DX), including the physical element of Dedicated and Hosted Connections as well as the logical elements of Virtual Interfaces (VIF). It touched upoen resiliency recommendations, connectivity options between AWS Direct Connect locations and on-premises locations as well as demystified the commercial workflow and associated costs.

You should now be in a position to understand how AWS DX makes it easy to establish a dedicated connection from an on-premises network to AWS. Using AWS Direct Connect, you can establish private connectivity between AWS and your data center, office, factory or collocated environment. A DX connection can reduce network costs, increase bandwidth throughput, and provide a more consistent network experience than internet-based connections.