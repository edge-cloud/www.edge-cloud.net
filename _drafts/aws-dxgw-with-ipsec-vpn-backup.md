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

Intro of what to accomplish

# Desired Architecture

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Desired.png" caption="Figure 1: Desired Setup with Direct Connect Gateway as the primary active path and Site-to-Site (IPSec) VPN as the backup path." %}

# Actual asymmetric routing

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Actual.png" caption="Figure 2: Actual asymmetric routing due to more specific prefixes being propagated over the Site-to-Site (IPSec) VPN." %}

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
