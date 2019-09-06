---
title: Troubleshooting BGP neighbor problem with a Direct Connect Hosted VIF
author: Christian Elsen
excerpt: Troubleshooting a BGP neighbor issue of "active open failed - tcb is not available" on a Megaport Hosted VIF due to unset BGP MD5 Auth key
layout: single
permalink: /2019/09/09/troubleshooting-bgp-session-hosted-vif/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Here is a quick look at an issue with a BGP session between a customer router (customer-premises equipment; CPE) and an AWS Direct Connect peer.

# Problem

While it was possible to ping the AWS Direct Connect peer interface from the customer peer interface the BGP remained in the *Idle* state. Local and remote ASNs matched up and IP addresses also matched up.

Turning on *"debug ip bgp"* gave the following insight, which solely shoed that the BGP peer connection was timing out.

```
10.1.103.34 active went from Idle to Active
10.1.103.34 open active, local address 10.1.103.33
10.1.103.34 open failed: Connection timed out; remote host not responding
10.1.103.34 Active open failed - tcb is not available, open active delayed 12288ms (35000ms max, 60% jitter)
ses global 10.1.103.34 act Reset (Active open failed).
10.1.103.34 active went from Active to Idle

```

# Setup

The customer router was connected to a [Hosted Virtual Interface](https://aws.amazon.com/directconnect/partners/) from the provider [Megaport](https://www.megaport.com/).

The view of this Hosted Virtual Interface within the AWS Console is shown in Figure 1. Notice that the *BGP Authentication key* shows as empty.

{% include figure image_path="/content/uploads/2019/09/Hosted-VIF.jpg" caption="Figure 1: Hosted VIF showing no BGP Auth Key configured." %}

With this the corresponding BGP setup on the Cisco-based customer router should be quite trivial.  

```
router bgp 64970
neighbor 10.1.103.34 remote-as AWS_ASN
```

Turns out that looking at the Megaport portal gave a slightly different view with the BGP Auth Key showing up. To be fair, Megaport clearly [documents](https://knowledgebase.megaport.com/cloud-connectivity/aws-cloud/) this behavior of the BGP Auth key solely showing up in the Megaport portal, but not the AWS Console.

# Troubleshooting

Using some more advanced Cisco IOS troubleshooting commands then confirmed that the AWS Direct Connect peer router was indeed setting an BGP Auth MD5, which the local router was not accepting.

```
Router1#debug ip tcp transactions address 10.1.103.34
MD5 received, but NOT expected from 10.1.103.34:24834 to 10.1.103.33:179

```

After adding the MD5 Auth key to the customer's BGP config, the BGP peer session came up right away.

```
router bgp 64970
neighbor 10.1.103.34 remote-as AWS_ASN
neighbor 10.1.103.34 password My5UpeR5eCRetPA55W0rD
```
