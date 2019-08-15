---
title: AWS Transit Gateway with Direct Connect Gateway and Site-to-Site (IPSec) VPN Backup
author: Christian Elsen
excerpt: This article shows you how to setup a primary active Direct Connect connection between a Transit Gateway and on-premises networks via Direct Connect Gateway, while leveraging a Site-to-Site (IPSec) VPN as backup.
layout: single
permalink: /2019/08/16/aws-dxgw-with-ipsec-vpn-backup/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

A very common network architecture pattern on AWS is to deploy an AWS Site-to-Site (IPSec) VPN connection as the backup for an AWS Direct Connect connection between on-premises networks and AWS VPCs.
With the introduction of AWS Transit Gateway and AWS Direct Connect Gateway, this architecture pattern is no longer a trivial task. This blog post highlihts the associated challenges and offers a solution using BGP route summarization, BGP prefix filtering as well as tweaking the LOCAL_PREF value on the primary active path to manage traffic over the Direct Connect and ite-to-Site (IPSec) VPN path as expected.

# Desired Architecture

To highlight the challenges with this architecture pattern, we assume the AWS network architecture as outlined in Figure 1.  

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Desired.png" caption="Figure 1: Desired Setup with Direct Connect Gateway as the primary active path and Site-to-Site (IPSec) VPN as the backup path." %}

This architecture includes the following assumptions and design decisions:
* **VPC Prefixes:** Within AWS we assume that each of the four VPCs is configured with a single /24 prefix.
* **DX Gateway announced prefixes:** As the number of prefixes  per AWS Transit Gateway from AWS to on-premise on a transit virtual interface (via Direct Connect Connect Gateway) is limited to 20, we will announce a /16 summary route for all current VPC prefixes.
* **Site-to-Site (IPSec) VPN over Internet:** The backup path via the Site-to-Site (IPSec) VPN tunnels will leverage the internet and not another Direct Connect connection as transport mechanism
* **Direct Connect as primary active path:** as Direct Connect offers a more consistent network experience than Internet-based connections, this network path is desired to be the primary active path, while the Site-to-Site (IPSec) VPN path should solely serve as the standby backup path.
* **BGP as failover mechanism:** We want to leverage BGP as the failover mechanism and not implement any manual out-of-band monitoring and failover mechanism.

**Note:** The design in Figure 1 depicts solely a single DX connection as well as a single Site-to-Site (IPSec) VPN tunnel. A realistic setup would include two DX connections, as well as a pair of VPN tunnels. As the presented challenges and proposed solution are the same for both designs, the simplified version is used here to better explain the concepts.   
{: .notice-info}

# Actual asymmetric routing

Unfortunately when implementing the above design, you'll quickly notice that the result is not what you were expecting. Instead you will observe asymmetric routing (See Figure 2) with traffic from AWS to on-premises traversing - as desired - the Direct Connect link, while traffic from on-premises to AWS traversing the Site-to-Site (IPSev) VPN tunnel instead.   

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Actual.png" caption="Figure 2: Actual asymmetric routing due to more specific prefixes being propagated over the Site-to-Site (IPSec) VPN." %}

Even though the AWS Transit Gateway will receive via BGP the same prefixes with the same path length over both Direct Connect and Site-to-Site (IPSec) VPN, traffic will solely traverses over the Direct Connect link to on-premises. The AWS Transit Gateway in this case prefers the AWS Direct Connect gateway over the VPN connection, as outlined in the [AWS Transit Gateway documentation](https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html#tgw-routing-overview).
You can imagine the AWS Transit Gateway setting a higher "local preference" (LOCAL_PREF) on the AWS Direct Connect gateway BGP sessions.

For traffic from on-premises to AWS, two challenges cause this traffic to traverse the Site-to-Site (VPN) VPN connection instead of the AWS Direct Connect link. The following sections will look at these challenges in more detail:  

## More Specific Routes

Fill me out

## Same AS path length

Fill me out

# Corrected traffic flow

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Fix.png" caption="Figure 3: Corrected traffic flow after using route summarization, prefix filtering and LOCAL_PREF." %}

## Route summarization and filtering

Fill me out

```
#
# Code
#

```

## Preferring Direct Connect via increasing LOCAL_PREF

Fill me out

```
#
# Code
#

```

# Summary

This article walked you through the challenges associated with configuring a Site-to-Site (IPSec) VPN tunnel as a backup path with a primary active traffic between an AWS Transit Gateway and on-premises networks via a Direct Connect Gateway.
To overcome these challenges a solution is proposed that leverages BGP route summarization, BGP prefix filtering and tweaking the LOCAL_PREF value on the primary active path.
