---
title: BGP route summarization with AWS Transit Gateway
author: Christian Elsen
excerpt: Step-by-step guide to summarize BGP routes with AWS Transit Gateway and Cisco IOS
layout: single
permalink: /2019/08/09/bgp-route-summary-with-tgw/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
toc: true
---

Intro of what to accomplish

# BGP Route Aggregation

What is BGP Route Aggregation

# AWS Transit Gateway

[AWS Transit Gateway](https://aws.amazon.com/transit-gateway/) is a service that enables customers to connect their Amazon Virtual Private Clouds (VPCs) and their on-premises networks to a single gateway. For on-premises connectivity the AWS Transit Gateway allows you to leverage AWS Site-to-Site VPNs (IPSec) or AWS Direct Connect via [AWS Direct Connect Gateways](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html) (See Figure 2).

{% include figure image_path="/content/uploads/2019/07/AWS-Transit-GW.png" caption="Figure 1: AWS Transit Gateway provides dynamic routing between VPCs, Site-to-Site VPNs, and AWS Direct Connect Gateways" %}

A transit gateway acts as a regional virtual router for traffic flowing between your virtual private clouds (VPC) and VPN or DX connections. A transit gateway scales elastically based on the volume of network traffic. Routing through a transit gateway operates at layer 3, where the packets are sent to a specific next-hop attachment, based on their destination IP addresses.

The AWS Transit Gateway's hub and spoke model simplifies management and reduces operational costs because each network only has to connect to the Transit Gateway and not to every other network. Any new VPC is simply connected to the Transit Gateway and is then automatically available to every other network that is connected to the Transit Gateway. This ease of connectivity makes it easy to scale your network as you grow.

# Problem Description

{% include figure image_path="/content/uploads/2019/08/TGW_VPC_Routes.png" caption="Figure 2: Desired BGP announcements between VPCs, TGW and customer gateway over VPN." %}

{% include figure image_path="/content/uploads/2019/08/TGW_Route_Table_1.png" caption="Figure 3: Transit Gateway Route Table with individual VPC routes." %}


```
CSR100V-01#sh ip route bgp
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

Gateway of last resort is 10.0.1.1 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
B        10.1.16.0/24 [20/100] via 169.254.15.221, 1d01h
                      [20/100] via 169.254.13.253, 1d01h
B        10.16.16.0/24 [20/100] via 169.254.15.221, 1d01h
                       [20/100] via 169.254.13.253, 1d01h
      172.16.0.0/24 is subnetted, 4 subnets
B        172.16.1.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.2.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.3.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.4.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B     172.31.0.0/16 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
CSR100V-01#

```

# BGP Route Aggregation with Static TGW Route

{% include figure image_path="/content/uploads/2019/08/TGW_Route_Table_SummaryRoute.png" caption="Figure 4: Transit Gateway Route Table with summary route." %}


```
CSR100V-01#sh ip route bgp
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

Gateway of last resort is 10.0.1.1 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
B        10.1.16.0/24 [20/100] via 169.254.15.221, 1d01h
                      [20/100] via 169.254.13.253, 1d01h
B        10.16.16.0/24 [20/100] via 169.254.15.221, 1d01h
                       [20/100] via 169.254.13.253, 1d01h
B     172.16.0.0/12 [20/100] via 169.254.15.221, 00:00:43
                    [20/100] via 169.254.13.253, 00:00:43
      172.16.0.0/24 is subnetted, 4 subnets
B        172.16.1.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.2.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.3.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B        172.16.4.0 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
B     172.31.0.0/16 [20/100] via 169.254.15.221, 1d01h
                    [20/100] via 169.254.13.253, 1d01h
CSR100V-01#
```

# Customer gateway route filtering

```
router bgp 65000
 bgp log-neighbor-changes
 neighbor 169.254.13.253 remote-as 64512
 neighbor 169.254.13.253 timers 10 30 30
 neighbor 169.254.15.221 remote-as 64512
 neighbor 169.254.15.221 timers 10 30 30
 !
 address-family ipv4
  network 10.0.16.0 mask 255.255.255.0
  neighbor 169.254.13.253 activate
  neighbor 169.254.13.253 soft-reconfiguration inbound
  neighbor 169.254.13.253 route-map REJECT in
  neighbor 169.254.15.221 activate
  neighbor 169.254.15.221 soft-reconfiguration inbound
  neighbor 169.254.15.221 route-map REJECT in
  maximum-paths eibgp 2
 exit-address-family
!

ip prefix-list incoming seq 5 permit 10.1.16.0/24
ip prefix-list incoming seq 10 permit 10.16.16.0/24
ip prefix-list incoming seq 15 permit 172.16.0.0/12
!
route-map REJECT permit 10
 match ip address prefix-list incoming
!
```


```
CSR100V-01#sh ip route bgp
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2
       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
       ia - IS-IS inter area, * - candidate default, U - per-user static route
       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP
       a - application route
       + - replicated route, % - next hop override, p - overrides from PfR

Gateway of last resort is 10.0.1.1 to network 0.0.0.0

      10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
B        10.1.16.0/24 [20/100] via 169.254.15.221, 1d01h
                      [20/100] via 169.254.13.253, 1d01h
B        10.16.16.0/24 [20/100] via 169.254.15.221, 00:00:40
                       [20/100] via 169.254.13.253, 00:00:40                    
B     172.16.0.0/12 [20/100] via 169.254.15.221, 00:27:23
                    [20/100] via 169.254.13.253, 00:27:23
CSR100V-01#
```

# Summary

Fill me out
