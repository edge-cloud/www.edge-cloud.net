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
* **No IPv6 failover support:** Unfortunately the AWS Site-to-Site (IPSec) VPN does not support carrying IPv6 traffic. Therefore this failover design is not suited for use cases, where you want to carry private IPv6 traffic between on-premises and AWS.

**Note:** The design in Figure 1 depicts solely a single DX connection as well as a single Site-to-Site (IPSec) VPN tunnel. A realistic setup would include two DX connections, as well as a pair of VPN tunnels. As the presented challenges and proposed solution are the same for both designs, the simplified version is used here to better explain the concepts.   
{: .notice--info}

# Actual asymmetric routing

Unfortunately when implementing the above design, you'll quickly notice that the result is not what you were expecting. Instead you will observe asymmetric routing (See Figure 2) with traffic from AWS to on-premises traversing - as desired - the Direct Connect link, while traffic from on-premises to AWS traversing the Site-to-Site (IPSev) VPN tunnel instead.   

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Actual.png" caption="Figure 2: Actual asymmetric routing due to more specific prefixes being propagated over the Site-to-Site (IPSec) VPN." %}

For traffic from on-premises to AWS, a few challenges cause this traffic to traverse the Site-to-Site (VPN) VPN connection instead of the AWS Direct Connect link. The following sections will look at these challenges in more detail:

## AS path length

When looking from the customer router at the CIDR(s) announced via BGP from the AWS Direct Connect Gateway, we would expect to see them an ASN path of 65001 and 64512, therefore with a path length of 2. Instead we will only see the ASN 65001 of the AWS Direct Connect Gateway in the path. AWS in this BGP session suppresses the ASN of the Transit Gateway.
This results in the customer router seeing the same path length over the Direct Connect Gateway link as over the Site-to-Site (IPSec) VPN link. In case Equal Cost Multipathing (ECMP) is configured on the customer router, this could lead to both Direct Connect and VPN link being used.

Similarly the AS path received by the AWS Transit Gateway is reduced to the path length of 1, resulting in the same path length over the Direct Connect Gateway link as over the Site-to-Site (IPSec) VPN link. Due to the Transit Gateway's preference of DX over VPN - see next section - traffic from AWS to on-premises doesn't run the risk of leveraging the Direct Connect and VPN link at the same time.

## TGW preference of DX over VPN

Even though the AWS Transit Gateway will receive via BGP the same prefixes with the same path length over both Direct Connect and Site-to-Site (IPSec) VPN, traffic will solely traverses over the Direct Connect link to on-premises. The AWS Transit Gateway in this case prefers the AWS Direct Connect gateway over the VPN connection, as outlined in the [AWS Transit Gateway documentation](https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html#tgw-routing-overview).
You can imagine the AWS Transit Gateway setting a higher "local preference" (LOCAL_PREF) on the AWS Direct Connect gateway BGP sessions.

## More Specific Routes

The AWS Transit Gateway will announce all active static routes and propagated routes over the Site-to-Site (IPSec) VPN link, which in this example results in four /24 prefixes being announced towards the customer routers. As mentioned before, due to the limitation on the number of prefixes per AWS Transit Gateway from AWS to on-premise on a transit virtual interface (via Direct Connect Connect Gateway), we are announcing a /16 summary route instead of the four /24 routes over the AWS Direct Connect Gateway.
As a result the customer router will see more specific routes over the Site-to-Site (IPSec) VPN link and therefore prefer this link.

# Corrected traffic flow

To correct the asymmetric routing situation we need to implement a few changes as highlighted in Figure 3.

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Fix.png" caption="Figure 3: Corrected traffic flow after using route summarization, prefix filtering and LOCAL_PREF." %}

The following sections look at these required changes in detail:

## Route summarization and filtering

I already covered how to implement BGP route summarization with the AWS Transit Gateway in a [previous post](https://www.edge-cloud.net/2019/08/07/bgp-route-summary-with-tgw/).
In this example we assume that VPCs 1 - 4 are using the CIDRs 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24, and 10.1.4.0/24. As we are propagating the summary prefix of 10.1.0.0/16 over the Direct Connect link, we want to send the same summary prefix over the Site-to-Site (IPSec) VPN.

As outlined in the [previous post](https://www.edge-cloud.net/2019/08/07/bgp-route-summary-with-tgw/) we can achieve this by creating a static route for the prefix 10.1.0.0/16 and point it to VPC 1.

Now the customer gateway will receive the summary route of 10.1.0.0/16 along with the more specific routes of 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24, and 10.1.4.0/24. Using prefix filtering on the customer gateway, we can filter out the more specific routes and solely install the summary route into the BGP route table.

The below example shows how to implement this under Cisco IOS with route-maps.   

```
router bgp 65100
 bgp log-neighbor-changes
 neighbor 169.254.13.253 remote-as 64512
 neighbor 169.254.13.253 timers 10 30 30
 neighbor 169.254.15.221 remote-as 65001
 neighbor 169.254.15.221 timers 10 30 30
 !
 address-family ipv4
  network 10.2.0.0 mask 255.255.0.0
  neighbor 169.254.13.253 activate
  neighbor 169.254.13.253 description Direct Connect
  neighbor 169.254.13.253 soft-reconfiguration inbound
  neighbor 169.254.15.221 activate
  neighbor 169.254.15.221 description VPN
  neighbor 169.254.15.221 soft-reconfiguration inbound
  neighbor 169.254.15.221 route-map REJECT in
  maximum-paths eibgp 4
 exit-address-family
!

ip prefix-list incoming seq 5 permit 10.1.0.0/16
!
route-map REJECT permit 10
 match ip address prefix-list incoming
!
```

In this case we only allow the summary prefix of 10.1.0.0/16 over the VPN link. 

## Preferring Direct Connect via increasing LOCAL_PREF

At this point we are not done yet. The customer gateway will still see the same summary route announced with the same AS path length over Direct Connect and VPN link. As we have ECMP configured this would result in both path being utilized. Instead we need a tie-breaker to steer traffic from on-premises to AWS solely via the Direct Connect link. This is done by increasing the local preference (LOCAL_PREF) on the AWS Direct Connect link within the BGP configuration of the customer gateway.

```
router bgp 65100
 bgp log-neighbor-changes
 neighbor 169.254.13.253 remote-as 64512
 neighbor 169.254.13.253 timers 10 30 30
 neighbor 169.254.15.221 remote-as 65001
 neighbor 169.254.15.221 timers 10 30 30
 !
 address-family ipv4
  network 10.2.0.0 mask 255.255.0.0
  neighbor 169.254.13.253 activate
  neighbor 169.254.13.253 description Direct Connect
  neighbor 169.254.13.253 soft-reconfiguration inbound
  neighbor 169.254.13.253 route-map LOCAL_PREF_110 in
  neighbor 169.254.15.221 activate
  neighbor 169.254.15.221 description VPN
  neighbor 169.254.15.221 soft-reconfiguration inbound
  neighbor 169.254.15.221 route-map REJECT in
  maximum-paths eibgp 4
 exit-address-family
!

ip prefix-list incoming seq 5 permit 10.1.0.0/16
!
route-map REJECT permit 10
 match ip address prefix-list incoming
!
route-map LOCAL_PREF_110 permit 10
 set local-preference 110
!
```

In this case we set a local preference (LOCAL_PREF) of 110 - which is higher than the default value of 100 - for all prefixes received via the Direct Connect link.

# Summary

This article walked you through the challenges associated with configuring a Site-to-Site (IPSec) VPN tunnel as a backup path with a primary active traffic between an AWS Transit Gateway and on-premises networks via a Direct Connect Gateway.
To overcome these challenges a solution is proposed that leverages BGP route summarization, BGP prefix filtering and tweaking the LOCAL_PREF value on the primary active path.
