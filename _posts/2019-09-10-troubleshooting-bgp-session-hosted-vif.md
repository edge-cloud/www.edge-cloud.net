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

Turning on *"debug ip bgp"* gave the following insight, which solely showed that the BGP peer connection was timing out.

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

# Troubleshooting

As mentioned before it was possible to ping the AWS Direct Connect peer interface successfully:
```
Router1#ping 10.1.103.34
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to 10.1.103.34, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 12/12/13 ms
```

Next, came checking via Telnet whether the BGP daemon was accessible on port TCP/179 on the AWS Direct Connect peer side.
A successful connection would eventually be closed by the remote side and therefore look like this:
```
Router1#telnet 10.1.103.34 179
Trying 10.1.103.34, 179 ... Open

[Connection to 10.1.103.34 closed by foreign host]
```

Just as a reference: In case the remote host was not accessible due to lack of Layer 3 connectivity, the result would like like this:
```
Router1#telnet 10.1.103.34 179
Trying 10.1.103.34, 179 ...
% Connection timed out; remote host not responding
```

And if connectivity to port TCP/179 was blocked by e.g. an access control list (ACL), the result would look like this:
```
Router1#telnet 10.1.103.34 179
Trying 10.1.103.34, 179 ...
% Connection refused by remote host
```

After validating that the BGP peer could be reached successfully, it was time to look further.

Turns out that looking at the Megaport portal gave a slightly different view with the BGP Auth Key showing up. To be fair, Megaport clearly [documents](https://knowledgebase.megaport.com/cloud-connectivity/aws-cloud/) this behavior of the BGP Auth key solely showing up in the Megaport portal, but not the AWS Console.

Using some more advanced Cisco IOS troubleshooting commands then confirmed that the AWS Direct Connect peer router was indeed setting an BGP Auth MD5, which the local router was not accepting.

```
Router1#debug ip tcp transactions address 10.1.103.34
MD5 received, but NOT expected from 10.1.103.34:24834 to 10.1.103.33:179

```

# Fix

After adding the MD5 Auth key to the customer's BGP config, the BGP peer session came up right away.

```
router bgp 64970
neighbor 10.1.103.34 remote-as AWS_ASN
neighbor 10.1.103.34 password My5UpeR5eCRetPA55W0rD
```

I would have expected the above *"debug ip bgp"* command would have showed us some information regarding the missing BGP Auth key. But as there was no BGP Auth setup on the local node, there was no information about the Auth mismatch in the debug output.  

# Improvements

Keep in mind, that in this case two AWS accounts are involved in this setup. Megaport owns account "A", which includes the DX connection. Megaport then creates a Private VIF on this connection and shares it out with the customer into account "B".
In this case account "A" can see the BGP MD5 auth key - which is needed to configure the physical router - while account "B" cannot.

It is understandable that AWS does not necessarily want to show the actual MD5 auth value of a shared private VIF within the receiving. In e.g. Enterprise customer scenarios it is common, that account "A" would be owned by the network team - which configures the physical router, while account "B" is owned by an infrastructure team.

Yet it would make sense that account "B" could at least see that an MD5 hash is set instead of making the user believe that it is empty.  
