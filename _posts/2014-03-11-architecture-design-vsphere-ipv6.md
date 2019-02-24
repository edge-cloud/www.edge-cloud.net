---
id: 1165
title: 'Architecture Design: vSphere with IPv6'
date: 2014-03-11T08:00:42+00:00
author: Christian Elsen
excerpt: An architecture design recommendation for using VMware vSphere 5.x with IPv6.
layout: single
permalink: /2014/03/11/architecture-design-vsphere-ipv6/
redirect_from:
  - /2014/03/11/architecture-design-vsphere-ipv6/amp/
  - /2014/03/architecture-design-vsphere-ipv6/
categories:
  - EdgeCloud
tags:
  - Architecture
  - IPv6
  - VMware
toc: true
---
In this post I will present an architecture design recommendation for using VMware vSphere 5.x with IPv6. Instead of taking an "all has to be IPv6" approach, we will look at the use case for IPv6 along with the enterprise hypervisor platform VMware vSphere and create a recommended design.

Afterwards we will shed some light on whether it is currently possible to implement such design with VMware vSphere 5.x, or not and what could be interim steps.

# Motivation

I have come across various cases where customers want to use IPv6 with VMware vSphere. Unfortunately the question about the desired use case for IPv6, or the question about what components or features of vSphere should be used with IPv6 is often answered with: "All of it!". Such an approach is unrealistic at this point and will most likely not lead to any success in using IPv6 with vSphere. As sad as it is, but IPv6 is not yet en par with IPv4 when it comes to product support. Most vendors - and [VMware is one of them](/2013/08/07/ipv6-link-local-addresses-as-default-gateway/) - lag behind IPv4 with their IPv6 support today. Instead let's shed some light on the reasons of why one would want to use VMware vSphere with IPv6 and how to design - potentially in a phased approach - an architecture design to fulfill the use case needs.

# Use Cases

Before we dive into the use cases for IPv6 with VMware vSphere, let's ensure we understand that VMware vSphere as a platform has a very well defined purpose: Provide the ability to host virtual machines (VMs) - servers and desktops - and offer them necessary resources (compute, storage and network) from a shared pool.

With this we will quickly arrive at our first and most important use case:

## Use Case 1: Providing IPv6 access to guest VMs / tenants

Virtual machines running on a VMware vSphere environment are typically "owned" by an internal or external stakeholder and serve a well defined purpose. This can reach from hosting an application on one or multiple server to providing a remote desktop. These VMs also typically require some kind of network access as part of their duty. Here the requirement for IPv6 is driven by the owner of the VM - potentially a customer of our virtualization platform - who wants to or needs to leverage IPv6 for the specific use case of the application. It is also possible that despite any current demand, we need to proactively provide IPv6 connectivity for VMs, so that application owners can plan ahead and incorporate IPv6 capabilities into their offerings.

The second use case is derived from the fact the actual platform to host virtual machines also needs to be managed and maintained. This task requires the platform components to be accessible via a network.

With this we arrive at our second use case:

## Use Case 2: Using IPv6 for management to save IPv4 addresses for production usage

The idea here is that IPv4 addresses - whether public or private ([RFC1918](https://tools.ietf.org/html/rfc1918)) - are treated as a precious commodity, thus reserving it for where it is really badly needed. One such place could be the customer or tenant networks that host (public facing) applications. All other non essential networks with only a support function - such as internal management - should be freed up from the precious commodity and use IPv6 instead. Such an approach might eventually led to the concept of a [IPv6-only data center](https://ripe64.ripe.net/presentations/67-20120417-RIPE64-The_Case_for_IPv6_Only_Data_Centres.pdf).

# vSphere Cluster

Before we dive into the individual design components let's recall how a vSphere Cluster is typically designed when it comes to a network-centric perspective. Such a cluster usually includes up to 5 groups of network types - some internal only to the cluster, some leaving the cluster (See Figure 1):

{% include figure image_path="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6.png" caption="Figure 1 : Typical Architecture Design for a vSphere 5.x Cluster" %}

* **_Management Network:_** This network is used for the administrative staff to interact with the vSphere cluster, e.g. connecting to the vSphere Web Client from a browser. But it is also used for communication with other corporate management systems, ranging from time synchronization via NTP to central log management via Syslog.
* **VM / Tenant Network:** This network is used for workload VMs residing on the cluster to connect to the outside world. It is very well possible that multiple such networks exist, e.g. in the case where multiple tenants share a vSphere cluster and each tenant shall connect to a dedicated network.
* **VXLAN Transport Network:** This network is used to transport the VXLAN overlay traffic, also often called the outer VXLAN traffic. If VXLAN are to span across clusters, this transport network also needs to span across clusters. Unless the controller-based VXLAN implementation is chosen, this network requires to be enabled for transporting Multicast traffic.
* **Storage Network:** In the case that a network based storage solution - such as NFS or iSCSI - is used, this network carries the storage traffic between a central storage array and the ESXi servers within a vSphere cluster. All major network vendors recommend that this network doesn't extend beyond a L2 boundary and is therefore not routed. The storage network often remains local to the vSphere cluster only, with the storage array assigned to the specific cluster. Also there might be multiple storage networks per cluster, depending on how many storage arrays are used.
* **VMotion / FT Network:** This network is used for VMotion and/or Fault Tolerance (FT) traffic between the ESXi hosts. It is highly recommended that this network also doesn't extend beyond a L2 boundary and is therefore not routed. Instead it is local to a vSphere cluster only.

# Design Components

Now we will have a closer look at our use cases again with the above typical vSphere Cluster setup in mind.

## Phase 1

Let's start with the use case of providing IPv6 access to guest VMs / tenants, being the more crucial one and therefore the one to tackle first.

Here a simple network connectivity for a VM will include multiple elements, which all need to be enabled to support carrying and/or processing both IPv4 and IPv6 traffic (See Figure 2).

The following capabilities in each of these design elements are necessary to support the use case.

{% include figure image_path="/content/uploads/2014/03/Tenant_IPv6_Simple.png" caption="Figure 2: Simple network connectivity for VMs" %}

* **Workload:** The workload itself needs to support IPv4 and/or IPv6 and needs to be configured for it. But also the Virtualization platform needs to support IPv6 besides IPv4 in the VM, e.g. as part of the OS guest customization or by ensuring the [DHCP Unique Identifier (DUID)](https://en.wikipedia.org/wiki/DHCPv6#DHCP_Unique_Identifier) is either maintained or regenerated during a cloning operation - similar to the MAC address. Windows had some [problems re-generating the DUID](https://support.microsoft.com/en-us/kb/2711727) when setting up a new machine via Sysprep.
* **vNIC:** The vNIC connects the workload to the virtual switch. In order to achieve the same performance with IPv6 traffic as with IPv4 traffic, the vNIC should not only support IPv4 as part of the [TCP offload engine](https://en.wikipedia.org/wiki/TCP_offload_engine), but also IPv6. VMware vSphere has received numerous [performance improvements](http://blogs.vmware.com/performance/2013/09/ipv6-performance-improvements-in-vsphere-5-5.html) in version vSphere 5.5. The vNIC might also be the enforcement point for a network security policy. Such a policy also needs to support IPv6.
* **Virtual Switch:** As a layer 2 device the virtual switch should not have any difficulty transporting IPv6 packets. But this is not enough. As the vSwitch acts as the access layer switch for the VM workloads it also needs to support common [First Hop Security Mechanism](http://www.cisco.com/c/en/us/products/ios-nx-os-software/ipv6-first-hop-security-fhs/index.html) such as IPv6 RA Guard and IPv6 ND Inspection. With a virtualization platform in the picture it is not sufficient to implement these features in the physical switch, as this switch is usually not aware of the individual workloads but only the Hypervisor host. And enforcing security at this level is clearly not sufficient.
* **Physical Switch:** The physical switch will connect the individual Hypervisor hosts with each other and the upstream router. With regards to IPv6 this device usually does not need to provide any special capabilities.
* **Layer 3 Gateway / Router:** The Layer 3 Gateway - also known as the router - is the boundary of the local layer 2 and provides the ability to reach other hosts via L3 - also known as routing. This gateway can either be a physical device or a virtual appliance, such as the VMware vShield Edge. As such, this device needs to support the L3 protocol of IPv6. It needs to be able to configure interfaces with IPv6 addresses and support static and dynamic routing of the IPv6 protocol. For [IPv6 address management](https://www.edge-cloud.net/2013/11/18/ipv6-address-management-hosts/) it needs to support the functionality of acting as a DHCPv6 relay and/or provide DHCPv6 functionality itself. Support for Stateless Address Auto Configuration (SLLAC) is also crucial within this device.

A slight modification of the above setup comes into play when overlay networks - such as [VXLAN](https://en.wikipedia.org/wiki/Virtual_Extensible_LAN) - are used. In this case the communication between two workload VMs might traverse the overlay tunnel as an encapsulated packet (See Figure 3). While the tunnel transport protocol - the outer encapsulated packets - does not need to use IPv6, it does need to provide the ability to transport IPv6 traffic. In the case of VXLAN this is possible as VXLAN can transport any kind of L3 protocol including IPv6. But one needs to keep [RFC 2460](https://tools.ietf.org/html/rfc2460) in mind, which asks for a minimum MTU of 1280 bytes for an IPv6 path. Along with a IPv6 header usually being 20 bytes larger than the IPv4 header, VXLAN must be configured to transport this increased payload size. This is usually the case as the MTU settings for VXLAN default to 1600.

{% include figure image_path="/content/uploads/2014/03/Tenant_IPv6_Advanced.png" caption="Figure 3: Advanced network connectivity for VMs" %}

## Phase 2

Next we will look at the use case of using IPv6 for management to save IPv4 addresses for production usage. In this case all management traffic leaving the vSphere cluster needs to be IPv6, while all traffic remaining within the cluster can remain IPv4. The reason for not having to move everything to IPv6 is that traffic such as VMotion will not only stay within the vSphere cluster but is anyways not routed beyond the cluster boundaries. It is therefore no problem to re-use the same IP address range for e.g. VMotion in all clusters or even re-use the same IP range outside of the VMware vSphere setup for completely different purposes.

The networks that do not leave the cluster and can therefore remain operating solely with IPv4 are for the VMotion / FT Network as well as the storage network.

On the other hand the network that need to carry IPv6 traffic - as they connect outside the cluster - are the VM / Tenant Network - as discussed already, the Management Network and the VXLAN Transport Network.

Over the Management Network all functionality that is required for managing the cluster needs to support IPv6. What this means in particular depends on the existing design of the environment:

* vCenter server: All communication with the vCenter Server needs to be able to use IPv6. This e.g. includes using the vSphere Web Client interface, but also communication with outside components such as the database used for vCenter or Active Directory for authentication and authorization. Last but not least, the communication between the vCenter server and the ESXi hosts also needs to support IPv6.
* ESXi hosts: Any management functionality where the vSphere cluster integrates with third party components needs to support IPv6. This includes integration with network management tools via SNMP, central log aggregation via Syslog or time synchronization via NTP.

The VXLAN Transport Network usually not only needs to span an overlay network within the same cluster, but also across a cluster (See Figure 4). For this it is necessary that the VTEPs support IPv6 and the VXLAN Transport traffic can use IPv6.

{% include figure image_path="/content/uploads/2014/03/VXLAN_VTEP.png" caption="Figure 4: VXLAN transport traffic between vSphere cluster" %}

# Final Architecture

The final proposed architecture would cover both presented use cases - potentially in a phased approach - and look as follows (See Figure 5):

Phase 1:

* VM / Tenant Network: Support both IPv4 and IPv6 in a Dualstack setup to give tenants and individual workloads the maximum choice.

Phase 2:

* Management Network: Support for handling all management traffic between vSphere cluster and external systems via IPv6-only.
* VXLAN Transport Network: Support for IPv6 only to create an overlay network across multiple vSphere cluster.

Other:

* Storage Network: This traffic can remain IPv4 as it is unrouted and will never leave the vSphere cluster.
* VMotion / FT Network: This traffic can also remain IPv4 as it is unrouted and will never leave the vSphere cluster.

{% include figure image_path="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6AddressTypeMapping.png" caption="Figure 5 : Architecture Design for vSphere 5.x with IPv6 - Protocol mapping" %}

# Reality

Now that we have a solid design for a vSphere setup with IPv6, let's have a look if this can actually be implemented today:

Phase 1:

* **VM / Tenant Network:** This is mostly working and supported today. Small limitations do exist around Guest Customization via Sysprep. You can also expect to stumble over [one](http://kb.vmware.com/kb/2040850) or [two](http://kb.vmware.com/kb/2001653) bugs here. But the largest limitation exist in the virtual switch. Neither the VMware standard nor the distributed vSwitch support IPv6 first hop security capabilities. At least the vCloud Networking and Security Edge supports basic IPv6 features with the ability to manually configure its interfaces for IPv6, configure static routing in IPv6 and use the Firewall and Load Balancer feature with IPv6. And also the vCloud Networking and Security App Firewall [supports IPv6](https://blogs.vmware.com/vsphere/2013/06/vcloud-networking-and-security-5-1-app-firewall-best-practices.html). But you have to be careful here, because all of this IPv6 doesn't come with vCNS - which is part of the vCloud Suite - but only with NSX for vSphere - which has to be licensed separately.

Phase 2:

* **Management Network:** Here your mileage will vary depending on the components you're using and the features you are attempting to use: While a [Windows-based vCenter does support IPv6](http://kb.vmware.com/kb/2003790), the [vCenter Server Appliance does not](http://kb.vmware.com/kb/2002531). The mandatory use of vSphere SSO will limit you further, as [SSO does not work on a IPv6-only host](http://kb.vmware.com/kb/2035454). While the Windows version of the vSphere client supports IPv6, the Web Client does not. Also while ESXi can export Syslog data via IPv6, vSphere can not ingest them via the Syslog and Dump collector. At least basic network protocols such as NTP and SNMP for the ESXi hosts work over IPv6.
  * **VXLAN Transport Network:** The [original VXLAN Internet-Draft](https://tools.ietf.org/html/draft-mahalingam-dutt-dcops-vxlan-00) addressed only IPv4 and dealt with IPv6 only via the sentence "Use of VXLAN with IPv6 transport will be addressed in a future version of this draft". Needless to say that this is pretty sad for a protocol proposal published in August 2012. Luckily that [future version](https://tools.ietf.org/html/draft-mahalingam-dutt-dcops-vxlan-03) came in February 2013. But so far VXLAN over IPv6 has not been implemented by any of the major vendors.

Other:

* **Storage Network:** While we stated that this traffic can remain IPv4-only, it is possible to use both iSCSI (at least via the software initiator) as well as NFS via IPv6. Unfortunately doing so is considered experimental or not even supported [depending on your vSphere version](http://kb.vmware.com/kb/1021769). Unfortunately this also highlights the dilemma that some features might appear to "work" with IPv6, but their full breadth hasn't been tested by VMware's engineering organization, which in return means that the feature is not officially supported by [VMware GSS](https://www.vmware.com/support/services.html)
* **VMotion / FT Network:** Here we also stated that this traffic can remain IPv4-only. But also here it is possible to use at least VMotion over a IPv6-only network and it even appears to be supported.

# Summary

Today it is unfortunately not possible to implement the full IPv6 for vSphere architecture design above. Only parts of it can be implemented with a greatly reduced functionality set. If IPv6 with vSphere is for you greatly depends on your use case and what functionality you are willing to give up.
