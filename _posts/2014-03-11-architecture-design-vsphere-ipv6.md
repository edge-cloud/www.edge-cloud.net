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
---
In this post I will present an architecture design recommendation for using VMware vSphere 5.x with IPv6. Instead of taking an &#8220;all has to be IPv6&#8221; approach, we will look at the use case for IPv6 along with the enterprise hypervisor platform VMware vSphere and create a recommended design.

Afterwards we will shed some light on whether it is currently possible to implement such design with VMware vSphere 5.x, or not and what could be interim steps.

### Motivation

I have come across various cases where customers want to use IPv6 with VMware vSphere. Unfortunately the question about the desired use case for IPv6, or the question about what components or features of vSphere should be used with IPv6 is often answered with: &#8220;All of it!&#8221;. Such an approach is unrealistic at this point and will most likely not lead to any success in using IPv6 with vSphere. As sad as it is, but IPv6 is not yet en par with IPv4 when it comes to product support. Most vendors &#8211; and <a href="https://www.edge-cloud.net/2013/08/07/ipv6-link-local-addresses-as-default-gateway/" title="IPv6 deployment: Using link-local addresses as default gateway" target="_blank">VMware is one of them</a> &#8211; lag behind IPv4 with their IPv6 support today. Instead let&#8217;s shed some light on the reasons of why one would want to use VMware vSphere with IPv6 and how to design &#8211; potentially in a phased approach &#8211; an architecture design to fulfill the use case needs.

### Use Cases

Before we dive into the use cases for IPv6 with VMware vSphere, let&#8217;s ensure we understand that VMware vSphere as a platform has a very well defined purpose: Provide the ability to host virtual machines (VMs) &#8211; servers and desktops &#8211; and offer them necessary resources (compute, storage and network) from a shared pool.

With this we will quickly arrive at our first and most important use case:

  * **Providing IPv6 access to guest VMs / tenants:** Virtual machines running on a VMware vSphere environment are typically &#8220;owned&#8221; by an internal or external stakeholder and serve a well defined purpose. This can reach from hosting an application on one or multiple server to providing a remote desktop. These VMs also typically require some kind of network access as part of their duty. Here the requirement for IPv6 is driven by the owner of the VM &#8211; potentially a customer of our virtualization platform &#8211; who wants to or needs to leverage IPv6 for the specific use case of the application. It is also possible that despite any current demand, we need to proactively provide IPv6 connectivity for VMs, so that application owners can plan ahead and incorporate IPv6 capabilities into their offerings.

The second use case is derived from the fact the actual platform to host virtual machines also needs to be managed and maintained. This task requires the platform components to be accessible via a network.

With this we arrive at our second use case:

  * **Using IPv6 for management to save IPv4 addresses for production usage:** The idea here is that IPv4 addresses &#8211; whether public or private (<a href="https://tools.ietf.org/html/rfc1918" target="_blank">RFC1918</a>) &#8211; are treated as a precious commodity, thus reserving it for where it is really badly needed. One such place could be the customer or tenant networks that host (public facing) applications. All other non essential networks with only a support function &#8211; such as internal management &#8211; should be freed up from the precious commodity and use IPv6 instead. Such an approach might eventually led to the concept of a <a href="https://ripe64.ripe.net/presentations/67-20120417-RIPE64-The_Case_for_IPv6_Only_Data_Centres.pdf" target="_blank">IPv6-only data center</a>.

### vSphere Cluster

Before we dive into the individual design components let&#8217;s recall how a vSphere Cluster is typically designed when it comes to a network-centric perspective. Such a cluster usually includes up to 5 groups of network types &#8211; some internal only to the cluster, some leaving the cluster (See Figure 1):

<div id="attachment_1167" style="width: 575px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6.png" alt="Figure 1 : Architecture Design for vSphere 5.x with IPv6" width="565" height="600" class="size-full wp-image-1167" srcset="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6.png 565w, /content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6-339x360.png 339w, /content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6-1x1.png 1w" sizes="(max-width: 565px) 100vw, 565px" />

  <p class="wp-caption-text">
    Figure 1 : Typical Architecture Design for a vSphere 5.x Cluster
  </p>
</div>

  * **_Management Network:_** This network is used for the administrative staff to interact with the vSphere cluster, e.g. connecting to the vSphere Web Client from a browser. But it is also used for communication with other corporate management systems, ranging from time synchronization via NTP to central log management via Syslog.
  * **VM / Tenant Network:** This network is used for workload VMs residing on the cluster to connect to the outside world. It is very well possible that multiple such networks exist, e.g. in the case where multiple tenants share a vSphere cluster and each tenant shall connect to a dedicated network.
  * **VXLAN Transport Network:** This network is used to transport the VXLAN overlay traffic, also often called the outer VXLAN traffic. If VXLAN are to span across clusters, this transport network also needs to span across clusters. Unless the controller-based VXLAN implementation is chosen, this network requires to be enabled for transporting Multicast traffic.
  * **Storage Network:** In the case that a network based storage solution &#8211; such as NFS or iSCSI &#8211; is used, this network carries the storage traffic between a central storage array and the ESXi servers within a vSphere cluster. All major network vendors recommend that this network doesn&#8217;t extend beyond a L2 boundary and is therefore not routed. The storage network often remains local to the vSphere cluster only, with the storage array assigned to the specific cluster. Also there might be multiple storage networks per cluster, depending on how many storage arrays are used.
  * **VMotion / FT Network:** This network is used for VMotion and/or Fault Tolerance (FT) traffic between the ESXi hosts. It is highly recommended that this network also doesn&#8217;t extend beyond a L2 boundary and is therefore not routed. Instead it is local to a vSphere cluster only.

### Design Components

Now we will have a closer look at our use cases again with the above typical vSphere Cluster setup in mind.

### Phase 1:

Let&#8217;s start with the use case of providing IPv6 access to guest VMs / tenants, being the more crucial one and therefore the one to tackle first.

Here a simple network connectivity for a VM will include multiple elements, which all need to be enabled to support carrying and/or processing both IPv4 and IPv6 traffic (See Figure 2).

The following capabilities in each of these design elements are necessary to support the use case.

<div id="attachment_1183" style="width: 486px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/03/Tenant_IPv6_Simple.png" alt="Figure 2: Simple network connectivity for VMs" width="476" height="204" class="size-full wp-image-1183" srcset="/content/uploads/2014/03/Tenant_IPv6_Simple.png 476w, /content/uploads/2014/03/Tenant_IPv6_Simple-360x154.png 360w, /content/uploads/2014/03/Tenant_IPv6_Simple-1x1.png 1w" sizes="(max-width: 476px) 100vw, 476px" />

  <p class="wp-caption-text">
    Figure 2: Simple network connectivity for VMs
  </p>
</div>

  * **Workload:** The workload itself needs to support IPv4 and/or IPv6 and needs to be configured for it. But also the Virtualization platform needs to support IPv6 besides IPv4 in the VM, e.g. as part of the OS guest customization or by ensuring the the <a href="https://en.wikipedia.org/wiki/DHCPv6#DHCP_Unique_Identifier" target="_blank">DHCP Unique Identifier (DUID)</a> is either maintained or regenerated during a cloning operation &#8211; similar to the MAC address. Windows had some <a href="https://support.microsoft.com/en-us/kb/2711727" target="_blank">problems re-generating the DUID</a> when setting up a new machine via Sysprep.
  * **vNIC:** The vNIC connects the workload to the virtual switch. In order to achieve the same performance with IPv6 traffic as with IPv4 traffic, the vNIC should not only support IPv4 as part of the <a href="https://en.wikipedia.org/wiki/TCP_offload_engine" target="_blank">TCP offload engine</a>, but also IPv6. VMware vSphere has received numerous <a href="http://blogs.vmware.com/performance/2013/09/ipv6-performance-improvements-in-vsphere-5-5.html" target="_blank">performance improvements</a> in version vSphere 5.5. The vNIC might also be the enforcement point for a network security policy. Such a policy also needs to support IPv6.
  * **Virtual Switch:** As a layer 2 device the virtual switch should not have any difficulty transporting IPv6 packets. But this is not enough. As the vSwitch acts as the access layer switch for the VM workloads it also needs to support common <a href="http://www.cisco.com/c/en/us/products/ios-nx-os-software/ipv6-first-hop-security-fhs/index.html" target="_blank">First Hop Security Mechanism</a> such as IPv6 RA Guard and IPv6 ND Inspection. With a virtualization platform in the picture it is not sufficient to implement these features in the physical switch, as this switch is usually not aware of the individual workloads but only the Hypervisor host. And enforcing security at this level is clearly not sufficient.
  * **Physical Switch:** The physical switch will connect the individual Hypervisor hosts with each other and the upstream router. With regards to IPv6 this device usually does not need to provide any special capabilities.
  * **Layer 3 Gateway / Router:** The Layer 3 Gateway &#8211; also known as the router &#8211; is the boundary of the local layer 2 and provides the ability to reach other hosts via L3 &#8211; also known as routing. This gateway can either be a physical device or a virtual appliance, such as the VMware vShield Edge. As such, this device needs to support the L3 protocol of IPv6. It needs to be able to configure interfaces with IPv6 addresses and support static and dynamic routing of the IPv6 protocol. For <a href="https://www.edge-cloud.net/2013/11/18/ipv6-address-management-hosts/" title="IPv6 Address management of hosts" target="_blank">IPv6 address management</a> it needs to support the functionality of acting as a DHCPv6 relay and/or provide DHCPv6 functionality itself. Support for Stateless Address Auto Configuration (SLLAC) is also crucial within this device.

A slight modification of the above setup comes into play when overlay networks &#8211; such as <a href="https://en.wikipedia.org/wiki/Virtual_Extensible_LAN" target="_blank">VXLAN</a> &#8211; are used. In this case the communication between two workload VMs might traverse the overlay tunnel as an encapsulated packet (See Figure 3). While the tunnel transport protocol &#8211; the outer encapsulated packets &#8211; does not need to use IPv6, it does need to provide the ability to transport IPv6 traffic. In the case of VXLAN this is possible as VXLAN can transport any kind of L3 protocol including IPv6. But one needs to keep <a href="https://tools.ietf.org/html/rfc2460" target="_blank">RFC 2460</a> in mind, which asks for a minimum MTU of 1280 bytes for an IPv6 path. Along with a IPv6 header usually being 20 bytes larger than the IPv4 header, VXLAN must be configured to transport this increased payload size. This is usually the case as the MTU settings for VXLAN default to 1600.

<div id="attachment_1191" style="width: 580px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/03/Tenant_IPv6_Advanced.png" alt="Figure 3: Advanced network connectivity for VMs" width="570" height="237" class="size-full wp-image-1191" srcset="/content/uploads/2014/03/Tenant_IPv6_Advanced.png 570w, /content/uploads/2014/03/Tenant_IPv6_Advanced-360x149.png 360w, /content/uploads/2014/03/Tenant_IPv6_Advanced-1x1.png 1w" sizes="(max-width: 570px) 100vw, 570px" />

  <p class="wp-caption-text">
    Figure 3: Advanced network connectivity for VMs
  </p>
</div>

### Phase 2

Next we will look at the use case of using IPv6 for management to save IPv4 addresses for production usage. In this case all management traffic leaving the vSphere cluster needs to be IPv6, while all traffic remaining within the cluster can remain IPv4. The reason for not having to move everything to IPv6 is that traffic such as VMotion will not only stay within the vSphere cluster but is anyways not routed beyond the cluster boundaries. It is therefore no problem to re-use the same IP address range for e.g. VMotion in all clusters or even re-use the same IP range outside of the VMware vSphere setup for completely different purposes.

The networks that do not leave the cluster and can therefore remain operating solely with IPv4 are for the VMotion / FT Network as well as the storage network.

On the other hand the network that need to carry IPv6 traffic &#8211; as they connect outside the cluster &#8211; are the VM / Tenant Network &#8211; as discussed already, the Management Network and the VXLAN Transport Network.

Over the Management Network all functionality that is required for managing the cluster needs to support IPv6. What this means in particular depends on the existing design of the environment:

  * vCenter server: All communication with the vCenter Server needs to be able to use IPv6. This e.g. includes using the vSphere Web Client interface, but also communication with outside components such as the database used for vCenter or Active Directory for authentication and authorization. Last but not least, the communication between the vCenter server and the ESXi hosts also needs to support IPv6.
  * ESXi hosts: Any management functionality where the vSphere cluster integrates with third party components needs to support IPv6. This includes integration with network management tools via SNMP, central log aggregation via Syslog or time synchronization via NTP.

The VXLAN Transport Network usually not only needs to span an overlay network within the same cluster, but also across a cluster (See Figure 4). For this it is necessary that the VTEPs support IPv6 and the VXLAN Transport traffic can use IPv6.

<div id="attachment_1193" style="width: 584px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/03/VXLAN_VTEP.png" alt="Figure 4: VXLAN transport traffic between vSphere cluster" width="574" height="225" class="size-full wp-image-1193" srcset="/content/uploads/2014/03/VXLAN_VTEP.png 574w, /content/uploads/2014/03/VXLAN_VTEP-360x141.png 360w, /content/uploads/2014/03/VXLAN_VTEP-1x1.png 1w" sizes="(max-width: 574px) 100vw, 574px" />

  <p class="wp-caption-text">
    Figure 4: VXLAN transport traffic between vSphere cluster
  </p>
</div>

### Final Architecture

The final proposed architecture would cover both presented use cases &#8211; potentially in a phased approach &#8211; and look as follows (See Figure 5):

Phase 1:

  * VM / Tenant Network: Support both IPv4 and IPv6 in a Dualstack setup to give tenants and individual workloads the maximum choice.

Phase 2:

  * Management Network: Support for handling all management traffic between vSphere cluster and external systems via IPv6-only.
  * VXLAN Transport Network: Support for IPv6 only to create an overlay network across multiple vSphere cluster.

Other:

  * Storage Network: This traffic can remain IPv4 as it is unrouted and will never leave the vSphere cluster.
  * VMotion / FT Network: This traffic can also remain IPv4 as it is unrouted and will never leave the vSphere cluster.

<div id="attachment_1168" style="width: 483px" class="wp-caption aligncenter">
  <img src="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6AddressTypeMapping.png" alt="Figure 5 : Architecture Design for vSphere 5.x with IPv6 - Protocol mapping" width="473" height="600" class="size-full wp-image-1168" srcset="/content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6AddressTypeMapping.png 473w, /content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6AddressTypeMapping-283x360.png 283w, /content/uploads/2014/02/ArchitectureDesignVsphereWithIpv6AddressTypeMapping-1x1.png 1w" sizes="(max-width: 473px) 100vw, 473px" />

  <p class="wp-caption-text">
    Figure 5 : Architecture Design for vSphere 5.x with IPv6 &#8211; Protocol mapping
  </p>
</div>

### Reality

Now that we have a solid design for a vSphere setup with IPv6, let&#8217;s have a look if this can actually be implemented today:

Phase 1:

  * **VM / Tenant Network:** This is mostly working and supported today. Small limitations do exist around Guest Customization via Sysprep. You can also expect to stumble over <a href="http://kb.vmware.com/kb/2040850" target="_blank">one</a> or <a href="http://kb.vmware.com/kb/2001653" target="_blank">two</a> bugs here. But the largest limitation exist in the virtual switch. Neither the VMware standard nor the distributed vSwitch support IPv6 first hop security capabilities. At least the vCloud Networking and Security Edge supports basic IPv6 features with the ability to manually configure its interfaces for IPv6, configure static routing in IPv6 and use the Firewall and Load Balancer feature with IPv6. And also the vCloud Networking and Security App Firewall <a href="https://blogs.vmware.com/vsphere/2013/06/vcloud-networking-and-security-5-1-app-firewall-best-practices.html" target="_blank">supports IPv6</a>. But you have to be careful here, because all of this IPv6 doesn&#8217;t come with vCNS &#8211; which is part of the vCloud Suite &#8211; but only with NSX for vSphere &#8211; which has to be licensed separately.

Phase 2:

  * **Management Network:** Here your mileage will vary depending on the components you&#8217;re using and the features you are attempting to use: While a <a href="http://kb.vmware.com/kb/2003790" target="_blank">Windows-based vCenter does support IPv6</a>, the <a href="http://kb.vmware.com/kb/2002531" target="_blank">vCenter Server Appliance does not</a>. The mandatory use of vSphere SSO will limit you further, as <a href="http://kb.vmware.com/kb/2035454" target="_blank">SSO does not work on a IPv6-only host</a>. While the Windows version of the vSphere client supports IPv6, the Web Client does not. Also while ESXi can export Syslog data via IPv6, vSphere can not ingest them via the Syslog and Dump collector. At least basic network protocols such as NTP and SNMP for the ESXi hosts work over IPv6.
  * **VXLAN Transport Network:** The <a href="https://tools.ietf.org/html/draft-mahalingam-dutt-dcops-vxlan-00" target="_blank">original VXLAN Internet-Draft</a> addressed only IPv4 and dealt with IPv6 only via the sentence &#8220;Use of VXLAN with IPv6 transport will be addressed in a future version of this draft&#8221;. Needless to say that this is pretty sad for a protocol proposal published in August 2012. Luckily that <a href="https://tools.ietf.org/html/draft-mahalingam-dutt-dcops-vxlan-03" target="_blank">future version</a> came in February 2013. But so far VXLAN over IPv6 has not been implemented by any of the major vendors.

Other:

  * **Storage Network:** While we stated that this traffic can remain IPv4-only, it is possible to use both iSCSI (at least via the software initiator) as well as NFS via IPv6. Unfortunately doing so is considered experimental or not even supported <a href="http://kb.vmware.com/kb/1021769" target="_blank">depending on your vSphere version</a>. Unfortunately this also highlights the dilemma that some features might appear to &#8220;work&#8221; with IPv6, but their full breadth hasn&#8217;t been tested by VMware&#8217;s engineering organization, which in return means that the feature is not officially supported by <a href="https://www.vmware.com/support/services.html" target="_blank">VMware GSS</a>
  * **VMotion / FT Network:** Here we also stated that this traffic can remain IPv4-only. But also here it is possible to use at least VMotion over a IPv6-only network and it even appears to be supported.

In summary: Today it is unfortunately not possible to implement the full IPv6 for vSphere architecture design above. Only parts of it can be implemented with a greatly reduced functionality set. If IPv6 with vSphere is for you greatly depends on your use case and what functionality you are willing to give up.
