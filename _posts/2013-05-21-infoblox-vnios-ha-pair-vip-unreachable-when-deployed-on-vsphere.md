---
id: 120
title: Infoblox vNIOS HA pair VIP unreachable when deployed on vSphere
date: 2013-05-21T22:04:08+00:00
author: Christian Elsen
layout: single
permalink: /2013/05/21/infoblox-vnios-ha-pair-vip-unreachable-when-deployed-on-vsphere/
redirect_from:
  - /2013/05/21/infoblox-vnios-ha-pair-vip-unreachable-when-deployed-on-vsphere/amp/
categories:
  - EdgeCloud
tags:
  - Infoblox
  - VMware
  - DNS
toc: true
---
Yesterday I stumbled over an interesting networking problem while deploying an [Infoblox](https://www.infoblox.com/) vNIOS IPAM HA pair on a fresh installation of VMware vSphere: After setting up the vNIOS appliances to act as an HA pair, it's floating virtual IP address was not reachable from the rest of the network. Yet, at the same time the individual IP addresses of the LAN interface were reachable.

# Rootcause

The cause for this issue is rooted in the way Infoblox implements the HA functionality - which is similar to the implementation of HA in various other product - but especially to the default security settings of a vDS and vSwitch in vSphere.

{% include figure image_path="/content/uploads/2013/05/InfobloxNIOS_HA.png" caption="Figure 1: Setup of an Infoblox vNIOS HA pair" %}

With Infoblox vNIOS both nodes in an HA pair share a single VIP address but also a single virtual MAC address. The node that is currently active is the one whose HA port owns the VIP address and virtual MAC address. When a failover occurs, these addresses shift from the HA port of the previous active node to the HA port of the new active node, as illustrated in Figure 1.

In detail, Infoblox uses the [Virtual Router Redundancy Protocol (VRRP)](https://en.wikipedia.org/wiki/Virtual_Router_Redundancy_Protocol) with the MAC address 00:00:5e:00:01:vrrp_id. The last two hexadecimal numbers in the source MAC address indicate the VRID number for this HA pair. For example, if the VRID number is 143, then the source MAC address is 00:00:5e:00:01:8f (8f in hexadecimal notation = 143 in decimal notation).

The default settings of a vDS or vSwitch in vSphere only allow a single MAC address per vNIC. This behavior is similar to having port-security enabled on a physical switch. But in contrary to physical switches the allowed MAC address is not learned but is the MAC address assigned by vCenter to the given vNIC.

As a result frames from the above mentioned floating MAC address are discarded by the vDS or vSwitch, which causes the associated IP address to be unreachable.

{% include figure image_path="/content/uploads/2013/05/PortGroupSecurity.png" caption="Figure 2: Allow *MAC address changes* and *Forged Transmits* on a vDS" %}

# Fix

In order to fix this issue, the port-profile to which the vNIOS HA and LAN ports connect to, have to allow more than one MAC address per vNIC. This can be done by changing the security settings of the port-group to accept "MAC address changes" and "Forged transmits", as shown in Figure 2.
