---
title: AWS Transit Gateway with Direct Connect Gateway and Site-to-Site (IPSec) VPN Backup
author: Christian Elsen
excerpt: This article shows you how to setup a primary active Direct Connect connection between an AWS Transit Gateway and on-premises networks via Direct Connect Gateway, while leveraging a Site-to-Site (IPSec) VPN as backup.
layout: single
permalink: /2019/08/16/aws-dxgw-with-ipsec-vpn-backup/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

A very common network architecture pattern on AWS is to deploy an [AWS Site-to-Site (IPSec) VPN](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html) connection as the backup for an [AWS Direct Connect (DX)](https://aws.amazon.com/directconnect/) connection between on-premises networks and AWS VPCs.
With the introduction of [AWS Transit Gateway](https://aws.amazon.com/transit-gateway/) and [AWS Direct Connect Gateway](https://docs.aws.amazon.com/directconnect/latest/UserGuide/direct-connect-gateways.html), this architecture pattern is no longer a trivial task.
This blog post highlights the associated challenges and offers a solution using BGP route summarization and BGP prefix filtering to manage traffic over the Direct Connect and Site-to-Site (IPSec) VPN path as expected.

# Desired Architecture

To highlight the challenges with this architecture pattern, we assume the AWS network architecture as outlined in Figure 1.  

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Desired.png" caption="Figure 1: Desired Setup with Direct Connect Gateway as the primary active path and Site-to-Site (IPSec) VPN as the backup path." %}

This architecture includes the following assumptions and design decisions:
* **VPC Prefixes:** Within AWS we assume that each of the four VPCs is configured with a single /24 prefix.
* **DX Gateway announced prefixes:** As the number of prefixes  per AWS Transit Gateway from AWS to on-premises on a transit virtual interface (via Direct Connect Connect Gateway) is limited to 20, we will announce a single /16 summary route for the VPC prefixes.
* **Site-to-Site (IPSec) VPN over Internet:** The backup path via the Site-to-Site (IPSec) VPN tunnels will leverage the Internet and not another Direct Connect connection as transport mechanism.
* **Equal Cost Multi-Pathing (ECMP):** A single AWS Site-to-Site (IPSec) VPN tunnel only provides a maximum bandwidth of 1.25 Gbps. For the case that the primary active DX connection has a bandwidth higher than 1 GBps this could lead to contention during a failover scenario. Therefore we want to leverage multiple VPN tunnels with ECMP to provide sufficient throughputs over the backup path.
* **Direct Connect as primary active path:** as Direct Connect offers a more consistent network experience than Internet-based connections, this network path is desired to be the primary active path, while the Site-to-Site (IPSec) VPN path should solely serve as the standby backup path.
* **BGP as failover mechanism:** We want to leverage BGP as the failover mechanism and not implement any manual out-of-band monitoring and failover mechanism. As such we will be using a BGP based Site-to-Site (IPSec) VPN.
* **No IPv6 failover support:** Unfortunately the AWS Site-to-Site (IPSec) VPN does not support carrying IPv6 traffic. Therefore this failover design is not suited for use cases, where you want to carry private IPv6 traffic between on-premises and AWS.

**Note:** The design in Figure 1 depicts solely a single DX connection as well as a single Site-to-Site (IPSec) VPN tunnel. A more realistic setup would include two DX connections, as well as a pair of VPN tunnels. As the presented challenges and proposed solution are the same for both designs, the simplified version is used here to better explain the concepts.   
{: .notice--info}

# Actual asymmetric routing

Unfortunately when implementing the above design, you'll quickly notice that the result is not what you were expecting. Instead you will observe asymmetric routing (See Figure 2) with traffic from AWS to on-premises traversing - as desired - the Direct Connect link, while traffic from on-premises to AWS traversing the Site-to-Site (IPSec) VPN tunnel instead.   

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Actual.png" caption="Figure 2: Actual asymmetric routing due to more specific prefixes being propagated over the Site-to-Site (IPSec) VPN." %}

For traffic from on-premises to AWS, a few challenges cause this traffic to traverse the Site-to-Site (VPN) VPN connection instead of the AWS Direct Connect link. The following sections will dive into these challenges in more detail:

## AS path length

When looking from the customer router at the CIDR(s) announced via BGP from the AWS Direct Connect Gateway, we would expect to see them with an ASN path of 65001 and 64512, therefore with a path length of two. Instead we will only see the ASN 65001 of the AWS Direct Connect Gateway in the path.
This is the result of users manually setting the CIDRs to be announced by the AWS Direct Connect Gateway towards on-premises. Imagine the AWS Direct Connect Gateway effectively filtering out any CIDRs learned from the AWS Transit Gateway and instead originates a route with the manually configured CIDR.
The result is a reduced path length to one over Direct Connect, which is the same AS path length as over the Site-to-Site (IPSec) VPN link.

## Multi Exit Discriminator (MED)

We might end up in a situation where the same prefix is being announced over the Direct Connect link as well as the VPN link with the same AS path length. In case Equal Cost Multipathing (ECMP) is configured on the customer router, we would expect both of these path to be considered at the same time.
To combat this behavior AWS sets a Multi Exit Discriminator (MED) value of 100 on BGP sessions over VPN links. As this value is higher than the default value of 0 - which the DX path uses - the DX path should be preferred. This works well in the case DX and VPN are used with a Virtual Private Gateway (VGW) as the same AS is announced over both connections. 
But with the TGW the Direct Connect path uses a different ASN compared to the VPN path. Therefore the MED value is only taken into consideration if the setting **"bgp always-compare-med"** is used within the customer's routet. With this setting MED is always compared if multiple routes to a destination have the same local preference and AS path length.

## Origin code  

With the TGW a different "trick" is used to prefer DX over VPN. The origin code shows how BGP learned about a certain path, not how your node learned about it. It is a BGP path attribute that is carried along with the NLRI information in BGP update messages. The origin attribute is a mandatory attribute and must be included with every route entry, as it is used in the BGP best-path selection process.
When e.g. configuring a prefix with the **"network"** statement, the origin code **"i"** indicates **"IGP"**. On the other hand when you redistribute a prefix into BGP - either via an interior gateway protocol such as OSPF or a static route, the origin code is set to **"?"** for **"incomplete"**. The origin code of **e** for **EGP** is not widely used anymore today as it was mostly intended as a transition mechanism. EGP is the predecessor of BGP and prefixes with this origin code receive a lower priority.
With the TGW this is something that AWS makes use of: All prefixes announced over a TGW VPN are marked with an origin code of **"e"** for **"EGP"**. As a result the customer gateway will prefer the path announced over Direct Connect having an origin code of **"i"** for **"IGP"**, instead of the path over VPN.

## TGW preference of DX over VPN

The AS path received by the AWS Transit Gateway is not reduced to the path length of one by the BGP configuration. This results in a longer path length over the Direct Connect Gateway link as over the Site-to-Site (IPSec) VPN link. Nevertheless, traffic will solely traverses over the Direct Connect link to on-premises. The AWS Transit Gateway in this case prefers the AWS Direct Connect gateway over the VPN connection, as outlined in the [AWS Transit Gateway documentation](https://docs.aws.amazon.com/vpc/latest/tgw/how-transit-gateways-work.html#tgw-routing-overview).
You can imagine the AWS Transit Gateway setting a higher "local preference" (LOCAL_PREF) on the AWS Direct Connect gateway BGP sessions.

## More Specific Routes

The AWS Transit Gateway will announce all active static routes and propagated routes over the Site-to-Site (IPSec) VPN link, which in this example results in four /24 prefixes being announced towards the customer routers. As mentioned before, due to the limitation on the number of prefixes per AWS Transit Gateway from AWS to on-premise on a transit virtual interface (via Direct Connect Connect Gateway), we are announcing a /16 summary route instead of the four /24 routes over the AWS Direct Connect Gateway.
As a result the customer router will see more specific routes over the Site-to-Site (IPSec) VPN link and therefore prefer this link for traffic towards the VPCs. Obviously this is not what we have desired.

# Corrected traffic flow

To correct the asymmetric routing situation we need to implement a few changes as highlighted in Figure 3.

{% include figure image_path="/content/uploads/2019/08/DXGW_with_VPN-Backup_Fix.png" caption="Figure 3: Corrected traffic flow after using route summarization and prefix filtering." %}

The following sections look at these required changes in detail:

## Route summarization and filtering

I already covered how to implement BGP route summarization with the AWS Transit Gateway in a [previous post](https://www.edge-cloud.net/2019/08/07/bgp-route-summary-with-tgw/).
In this example we assume that VPCs 1 - 4 are using the CIDRs 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24, and 10.1.4.0/24 respectively. Because we are propagating the summary prefix of 10.1.0.0/16 over the Direct Connect link, we want to send the same summary prefix over the Site-to-Site (IPSec) VPN.

As outlined in the [previous post](https://www.edge-cloud.net/2019/08/07/bgp-route-summary-with-tgw/) we can achieve this by creating a static route for the prefix 10.1.0.0/16 and point it to e.g. VPC 1.

Now the customer gateway will receive the summary route of 10.1.0.0/16 along with the more specific routes of 10.1.1.0/24, 10.1.2.0/24, 10.1.3.0/24, and 10.1.4.0/24. Using prefix filtering on the customer gateway, we can filter out the more specific routes and solely install the summary route into the BGP route table.

The below example shows how to implement this under Cisco IOS with route-maps.   

```
router bgp 65100
 bgp log-neighbor-changes
 neighbor 169.254.254.1 remote-as 64512
 neighbor 169.254.254.1 description Direct Connect
 neighbor 169.254.254.1 timers 10 30 30
 neighbor 169.254.254.1 password 0 mypassword
 neighbor 169.254.15.221 remote-as 65001
 neighbor 169.254.15.221 description VPN
 neighbor 169.254.15.221 timers 10 30 30
 !
 address-family ipv4
  network 10.2.0.0 mask 255.255.0.0
  neighbor 169.254.254.1 activate
  neighbor 169.254.254.1 soft-reconfiguration inbound
  neighbor 169.254.15.221 activate
  neighbor 169.254.15.221 soft-reconfiguration inbound
  neighbor 169.254.15.221 route-map SUM_FILTER in
  maximum-paths 4
 exit-address-family
!

ip prefix-list incoming seq 5 permit 10.1.0.0/16
!
route-map SUM_FILTER permit 10
 match ip address prefix-list incoming
!
```

In this case we only allow the summary prefix of 10.1.0.0/16 over the VPN link.

# Results

At this point we are done and have succeeded: The customer gateway will see the same summary route announced with the same AS path length over Direct Connect and VPN link, except that the route over VPN will have a MED of 100. Therefore the DX route - having a MED of 0 - will be chosen instead.

With this we can look at the routes that are received from the BGP peer over DX (here: 169.254.254.1) and the BGP peer over VPN (here: 169.254.15.221)
```
#sh ip bgp neighbors 169.254.254.1 received-routes | beg Network
      Network          Next Hop            Metric LocPrf Weight Path
  *    10.1.0.0/16     169.254.254.1                          0 65001 i

#sh ip bgp neighbors 169.254.15.221 received-routes | beg Network
      Network          Next Hop            Metric LocPrf Weight Path
  *    10.1.0.0/16     169.254.15.221         100             0 64512 e
  *    10.1.1.0/24     169.254.15.221         100             0 64512 e
  *    10.1.2.0/24     169.254.15.221         100             0 64512 e
  *    10.1.3.0/24     169.254.15.221         100             0 64512 e
  *    10.1.4.0/24     169.254.15.221         100             0 64512 e
```
While we see the four more specific /24 routes over VPN - which will be filtered out - we also see the summary route matching the route over DX. While both routes have the same AS path length, we can see the difference in Metric (showing MED).

With this the route installed into the RIB by BGP will solely be the one traversing DX.

```
#sh ip bgp | beg Network
      Network          Next Hop            Metric LocPrf Weight Path
  *    10.1.0.0/16     169.254.15.221         100             0 64512 e
  *>                   169.254.254.1            0             0 65001 i
```

# Summary

This article walked you through the challenges associated with configuring a Site-to-Site (IPSec) VPN tunnel as a backup path with a primary active traffic between an AWS Transit Gateway and on-premises networks via a Direct Connect Gateway.
To overcome these challenges a solution is proposed that leverages BGP route summarization and BGP prefix filtering.
