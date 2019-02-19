---
id: 1527
title: IPv6 in vSphere 6
date: 2015-03-18T17:13:53+00:00
author: Christian Elsen
layout: single
permalink: /2015/03/18/ipv6-in-vsphere-6/
redirect_from:
  - /2015/03/18/ipv6-in-vsphere-6/amp/
  - /2015/03/ipv6-in-vsphere6/
  - /2015/03/ipv6-in-vsphere-6/
categories:
  - EdgeCloud
tags:
  - IPv6
  - VMware
toc: true
---
**Note:** Last updated on May 1st, 2015

With the [release of vSphere 6](https://www.vmware.com/support/vsphere6/doc/vsphere-esxi-vcenter-server-60-release-notes.html), the IPv6 capabilities of vSphere have greatly improved. In this post I want to provide an overview of these new capabilities for vSphere as well as NSX for vSphere (NSX-v). Together these two products are now able to form a decent virtual infrastructure layer, supporting many capabilities in IPv6.

This IPv6-enabled virtual infrastructure in return can be the foundation for Horizon View, which also supports IPv6 since version 6.1.

### Use Cases

The overview will be grouped by use case, product and then by function. The two use cases for IPv6 are:

  * **Tenant Use Case:** Ultimate Goal: Provide IPv4/IPv6 connectivity to tenant workloads
  * **Management Use Case:** Ultimate Goal: Manage entire vCloud backend via IPv6-only

For each use case this article lists what capabilities and features supported IPv6 in vSphere 5.1, vSphere 5.5, vSphere 6.0, vCNS 5.5, NSX-v 6.0 and NSX-v 6.1.

**Note:** Only NSX-v 6.1.3, [supports](http://www.vmware.com/resources/compatibility/sim/interop_matrix.php) vSphere 6.0.
{: .notice}

Let's have a look at these two use cases in more detail:

### Tenant Use Case

Ultimate Goal: Provide IPv4/IPv6 connectivity to tenant workloads (See Figure 1).

{% include figure image_path="/content/uploads/2015/03/IPv6-Use-Cases-Tenant.png" caption="Figure 1: IPv6 Tenant Use Case" %}

The tenant use case is geared towards providing full IPv4/IPv6 network connectivity to workloads running on top of a virtual infrastructure. This includes the tenant path of network infrastructure elements, but does not include the management of non-end-user exposed component.

This use case includes the following requirements:

* Support for Workloads
  * Guest customization (Configure IP settings from outside VM)
  * Virtual Network Access (vNIC): IPv6 Offload, App Firewall
* Support for Workload Management/Configuration
  * “Awareness” of IPv6: Ability to manage IPv6-capable configuration items (interfaces, pools, route tables, ACLs, …)
  * Support for network devices (switch, router, security device, load balancer). Applies to vSS, vDS and vShield/NSX Edge (Multiple profiles).

#### vSphere

|Product/Function|vSphere 5.1|vSphere 5.5|vSphere 6.0|Notes|
|---|---|---|---|---|
|General Operation|*Yes*|*Yes*|*Yes*|Functionality has to be provided by Guest OS|
|**Guest OS**|   |   |   |   |
|TCP Segmentation Offload (TSO) over IPv6|*Yes*|*Yes*|*Yes*|Only supported by [VMXNET3 vNIC](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1001805). Not supported by [E1000 vNIC](http://kb.vmware.com/kb/1009548).|
|Guest Customization (Sysprep)|No|No|*Yes*|No support to join Active Directory via IPv6 in vSphere 6.0. [Certain limitations](http://kb.vmware.com/kb/2105648) apply.|
|**Virtual Switch (vSS/vDS)**|   |   |   |   |
|Multicast support|*Yes*|*Yes*|*Yes*|[Snooping modes supported](http://pubs.vmware.com/vsphere-60/topic/com.vmware.vsphere.networking.doc/GUID-97724211-5167-428F-A217-871963A7DFF7.html): IGMPv1, IGMPv2, IGMPv3 for IPv4, MLDv1 and MLDv2 for IPv6 supported.|

#### vCNS / NSX-v

|Product/Function|vCNS 5.5|NSX-v 6.0/6.1|Notes|
|---|---|---|---|
|Guest VM Addressing|*Yes*|*Yes*|VXLAN encap packets (VXLAN Encapsulated Inner Header) are capable of carrying IPv6 payload. If IP hashing is configured, ESXi can base decisions on IPv4 or IPv6 packets.|
|**vCNS / NSX Edge**|   |   |   |
|Edge Interface IP Address|No|Partially|Only support for static IPv6. No support for DHCPv6 or SLAAC.|
|DNS Resolver| |Yes|IPv4 and IPv6 Listener. Supports AAAA records.|
|Router Announcements (RA) for SLAAC|No|No| |
|DHCP server / relay|No|No|Supports IPv4 only|
|Static Routing|No|*Yes*| |
|Dynamic Routing (OSPF, ISIS, BGP)| |No|No dynamic routing with IPv6|
|Firewall|No|Yes| |
|Load Balancer|No|*Yes*|IPv4 and IPv6 VIP. Transparent Mode: IPv4 VIP with IPv4 Pool, IPv4 VIP with IPv6 Pool.Proxy Mode: IPv4 VIP with IPv4 Pool, IPv6 VIP with IPv6 Pool, IPv6 VIP with IPv4 Pool (L7 only), IPv4 VIP with IPv6 Pool (L7 only)|
|NAT|No|No|No support for NAT64 or NAT66|
|IPSec|No|*Yes*|IPv4, IPv6 and Hybrid. IPv6 Peers with IPv6 Internal Subnet. IPv6 Peers with IPv4 internal Subnet.|
|SSL VPN| |Partially|IPv4, IPv6 Listener. IPv6 Listener Address. IPv6 Listener with IPv4 private subnet.|
|L2 VPN| |Partially|IPv4, IPv6 Listener. Outer packet can be IPv4 and IPv6. Inner packet can only be IPv4.|
|**NSX Virtual Distributed Router (VDR)**|   |   |   |
|Static Routing| |No|
|Dynamic Routing (OSPF, ISIS, BGP)| |No|No dynamic routing with IPv6.|
|Distributed Firewall| |*Yes*|

### Managemenet Use Case

Ultimate Goal: Manage entire vCloud backend via IPv6-only (See Figure 2).

<div id="attachment_1568" style="width: 610px" class="wp-caption aligncenter">
  <img class="size-full wp-image-1568" src="/content/uploads/2015/03/IPv6-Use-Cases-Mgmt.png" alt="Figure 2: IPv6 Management Use Case" width="600" height="312" srcset="/content/uploads/2015/03/IPv6-Use-Cases-Mgmt.png 600w, /content/uploads/2015/03/IPv6-Use-Cases-Mgmt-360x187.png 360w" sizes="(max-width: 600px) 100vw, 600px" />

  <p class="wp-caption-text">
    Figure 2: IPv6 Management Use Case
  </p>
</div>

The management use case assumes that the operator of the virtual infrastructure has exhausted its IPv4 address space. The goal is therefore to move all management traffic (all traffic not directly visible to customers or tenants) to IPv6-only, potentially with the interim step of IPv4/IPv6 Dualstack. Therefore all non-tenant traffic of the virtual infrastructure with external systems, but also between components residing on different devices needs to be IPv6-only. This use case includes the following requirements:

  * Operating System (OS) support
      * Fulfill device requirements for hosts with the goal for an OS: Ability to offer IPv4/IPv6 transport services to applications
  * Application support
      * Server applications vs. client applications: Accept vs. initiate IPv6 communication.
      * Be able to communicate over IPv4-only and IPv6-only networks.
      * Network parameters in local or remote server settings, need to support configuration of IPv6 parameters
      * All features offered over IPv4 must be available over IPv6 without any noticeable difference (usability, performance), unless providing explicit benefit to the user.

#### vSphere

<div class="table-responsive">
  <table  style="width:100%; "  class="easy-table easy-table-default " border="0">
    <tr>
      <th >
        Product/Function
      </th>

      <th >
        vSphere 5.1
      </th>

      <th >
        vSphere 5.5
      </th>

      <th >
        vSphere 6.0
      </th>

      <th >
        Notes
      </th>
    </tr>

    <tr>
      <td >
        <strong>vCenter Server</strong>
      </td>
    </tr>

    <tr>
      <td >
        vCenter on Windows
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        For deploying a single instance standalone. To configure vCenter Server with an external database, provide the FQDN of the target database server.
      </td>
    </tr>

    <tr>
      <td >
        vCenter Linux appliance (vCVA/CloudVM)
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        For deploying a single instance standalone. vCenter Server Appliance deployment wizard requires a DNS entry for the ESXi host and does not support a literal IPv6 address. Connection of the vCenter Server Appliance to Active Directory is not supported over IPv6. Use Active Directory over LDAP as an identity source in vCenter Single Sign-On instead.
      </td>
    </tr>

    <tr>
      <td >
        PSC / SSO, Inventory Services
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        For deploying vC across multiple hosts. Includes STS (secure token service), Lotus (directory service / key value store), IDM (identity manager), VMCA (certification service). To configure the Platform Services Controller with an external database, provide the FQDN of the target database server
      </td>
    </tr>

    <tr>
      <td >
        Common Logging Infrastructure
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vCenter Converter
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        VMotion
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        VMotion incorrectly prefers transport via IPv4 if both IPv4 and IPv6 transport (aka Dualstack) are available
      </td>
    </tr>

    <tr>
      <td >
        Auto Deploy / PXE boot / UEFI boot
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Partially
      </td>

      <td >
        There is currently no definition of IPv6 support in the PXE hardware agents. [UEFI](https://en.wikipedia.org/wiki/Unified_Extensible_Firmware_Interface) will allow remote boot via IPv6. Or PXE boot the ESXi host over IPv4 and configure the host for IPv6 by using Host Profiles.
      </td>
    </tr>

    <tr>
      <td >
        Host Profiles
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vAPI
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vCLI
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vSphere Management SDK
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Includes: Web Services SDK, SSO Client SDK, EAM SDK, SMS SDK, and SPBM SDK.
      </td>
    </tr>

    <tr>
      <td >
        vCloud Suite SDK
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Includes: SDK for Java, .NET, Python, Ruby, and Perl.
      </td>
    </tr>

    <tr>
      <td >
        vSphere Authentication Proxy
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        The vSphere Authentication Proxy service binds to an IPv4 address for communication with vCenter Server, and [does not support IPv6](http://pubs.vmware.com/vsphere-50/index.jsp?topic=%2Fcom.vmware.vsphere.install.doc_50%2FGUID-EA920335-2608-4127-9B57-DB3809BA4BB9.html).
      </td>
    </tr>

    <tr>
      <td >
        <strong>Other Management</strong>
      </td>
    </tr>

    <tr>
      <td >
        vSphere Management Assistant (vMA)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vSphere Update Manager (VUM)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        <strong>vCenter Client</strong>
      </td>
    </tr>

    <tr>
      <td >
        Windows version
      </td>

      <td >
        Yes
      </td>

      <td >
        Yes
      </td>

      <td >
        Partially
      </td>

      <td >
        Use of the vSphere Client to enable IPv6 on vSphere features is not supported. Use the vSphere Web Client to enable IPv6 for vSphere features instead.
      </td>
    </tr>

    <tr>
      <td >
        Web Client
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        <strong>ESXi</strong>
      </td>
    </tr>

    <tr>
      <td >
        Transport for Management Communication
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Certified via [USGv6 certification](https://www.iol.unh.edu/registry/usgv6?company_name=VMware%2C%20Inc.#eqplist)
      </td>
    </tr>

    <tr>
      <td >
        ESXi Firewall
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        Netdump
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        Syslog Agent
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Syslog collector / server [can be configured](https://www.vmware.com/support/developer/PowerCLI/PowerCLI41/html/Set-VMHostSysLogServer.html) via IPv4 address, IPv6 address or DNS name.
      </td>
    </tr>

    <tr>
      <td >
        Using Active Directory to authenticate Users
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        The vSphere Authentication Proxy service binds to an IPv4 address for communication with vCenter Server, and [does not support IPv6](http://pubs.vmware.com/vsphere-50/index.jsp?topic=%2Fcom.vmware.vsphere.install.doc_50%2FGUID-EA920335-2608-4127-9B57-DB3809BA4BB9.html).
      </td>
    </tr>

    <tr>
      <td >
        Network Time Protocol (NTP)
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        You can use the name or IP address to specify the NTP server ([IPv6 address valid for vSphere 4.0 and later](http://pubs.vmware.com/vsphere-51/index.jsp?topic=%2Fcom.vmware.vcli.ref.doc%2Fvicfg-ntp.html))
      </td>
    </tr>

    <tr>
      <td >
        SNMP
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        <strong>Virtual Distributed Switch (vDS)</strong>
      </td>
    </tr>

    <tr>
      <td >
        Link Layer Discovery Protocol (LLDP) / Cisco Discovery Protocol (CDP)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        Internet Protocol Flow Information Export (IPFIX)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        L3-SPAN
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        <strong>Storage</strong>
      </td>
    </tr>

    <tr>
      <td >
        iSCSI (HW and SW initiator)
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        While SW iSCSI initiator work in vSphere 5.1 and 5.5, they are not supported. The [vSphere 5.1 Storage Guide](http://pubs.vmware.com/vsphere-51/topic/com.vmware.ICbase/PDF/vsphere-esxi-vcenter-server-51-storage-guide.pdf) and [vSphere 5.5 Storage Guide](http://pubs.vmware.com/vsphere-55/topic/com.vmware.ICbase/PDF/vsphere-esxi-vcenter-server-55-storage-guide.pdf) explicitly call iSCSI with IPv6 unsupported. Previous versions (e.g. 4.1 had "Experimental support"). vSphere 6.0 does support iSCSI.
      </td>
    </tr>

    <tr>
      <td >
        NFS (HW and SW adapters)
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        Partially
      </td>

      <td >
        While NFS works in vSphere 5.1 and 5.5, they are not supported. The [vSphere 5.1 Storage Guide](http://pubs.vmware.com/vsphere-51/topic/com.vmware.ICbase/PDF/vsphere-esxi-vcenter-server-51-storage-guide.pdf) and [vSphere 5.5 Storage Guide](http://pubs.vmware.com/vsphere-55/topic/com.vmware.ICbase/PDF/vsphere-esxi-vcenter-server-55-storage-guide.pdf) explicitly call NFS over L3 with IPv6 unsupported, but also make no positive support statement for NFS over L2, therefore making it not supported. Previous versions (e.g. 4.1 had "Experimental support"). In vSphere 6.0 NFS 4.1 storage with Kerberos auth is not supported; use NFS 4.1 with AUTH_SYS instead.
      </td>
    </tr>

    <tr>
      <td >
        vStorage APIs for Array Integration (VAAI)
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        No support, but may work
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Could work in vSphere 5.1 and 5.5, if the vendor provides an IPv6-capable VAAI plugin. NetApp provides an [IPv6 capable VAAI plugin](https://library.netapp.com/ecmdocs/ECMP1368924/html/GUID-33CA873C-D4FC-4D96-AFFA-6DFD95337032.html). This combination would not be supported by VMware in vSphere 5.1 or vSphere 5.5. It is supported in vSphere 6.0 for both NFS and iSCSI.
      </td>
    </tr>

    <tr>
      <td >
        APIs for Storage Awareness (VASA) / Virtual Volumes (VVols)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        <strong>Virtual Storage Area Network (vSAN)</strong>
      </td>
    </tr>

    <tr>
      <td >
        Transport between storage nodes
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Virtual SAN does not support [IPv6 as transport mechanism](http://pubs.vmware.com/vsphere-55/index.jsp?topic=%2Fcom.vmware.vsphere.storage.doc%2FGUID-8408319D-CA53-4241-A3E4-70057F70030F.html) between nodes.
      </td>
    </tr>

    <tr>
      <td >
        <strong>Availability</strong>
      </td>
    </tr>

    <tr>
      <td >
        Fault Tolerance (FT)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        High Availability (HA)
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        vSphere HA supports both IPv4 and IPv6. A cluster that mixes the use of both of these protocol versions, however, is more likely to [result in a network partition](http://pubs.vmware.com/vsphere-50/index.jsp?topic=%2Fcom.vmware.vsphere.avail.doc_50%2FGUID-BA85FEC4-A37C-45BA-938D-37B309010D93.html).
      </td>
    </tr>

    <tr>
      <td >
        Symmetric multiprocessing fault tolerance (SMP-FT)
      </td>

      <td >
      </td>

      <td >
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        vStorage APIs for Data Protection (VADP)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
      </td>
    </tr>

    <tr>
      <td >
        Dynamic Power Management (DPM)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Partially
      </td>

      <td >
        DPM on IPv6 will only support Wake-on-LAN
      </td>
    </tr>

    <tr>
      <td >
        <strong>Orchestrator (vCO)</strong>
      </td>
    </tr>

    <tr>
      <td >
        Transport for All Communication
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        All vCenter Orchestrator components, including plug-ins built by VMware, have been [tested and certified to run on IPv6 networks](https://www.vmware.com/support/orchestrator/doc/vcenter-orchestrator-51-release-notes.html).
      </td>
    </tr>

    <tr>
      <td >
        <strong>Site Recovery Manager (SRM)</strong>
      </td>
    </tr>

    <tr>
      <td >
        SRM to vCenter communication
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Site Recovery Manager [supports IPv6 for all network links](http://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/techpaper/whats-new-vmware-vcenter-site-recovery-manager-50-technical-white-paper.pdf)
      </td>
    </tr>

    <tr>
      <td >
        vSphere Replication
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Site Recovery Manager [supports IPv6 for all network links](http://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/techpaper/whats-new-vmware-vcenter-site-recovery-manager-50-technical-white-paper.pdf)
      </td>
    </tr>
  </table>
</div>

#### vCNS / NSX-v

<div class="table-responsive">
  <table  style="width:100%; "  class="easy-table easy-table-default " border="0">
    <tr>
      <th >
        Product/Function
      </th>

      <th >
        vCNS 5.5
      </th>

      <th >
        NSX-v 6.0/6.1
      </th>

      <th >
        Notes
      </th>
    </tr>

    <tr>
      <td >
        VXLAN Transport (Outer Header of a VXLAN Encapsulated Packet)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        The VXLAN specification includes IPv6 for the outer header since [revision 2 from February 22, 2013](https://tools.ietf.org/html/draft-mahalingam-dutt-dcops-vxlan-03). The VMware implementation does not address IPv6.
      </td>
    </tr>

    <tr>
      <td >
        vCNS / NSX Manager IP Address
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Only support for static IPv6. No DHCPv6 / Autoconf.
      </td>
    </tr>

    <tr>
      <td >
        vCNS / NSX Edge Management IP Address
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Only support for static IPv6. No DHCPv6 / Autoconf.
      </td>
    </tr>

    <tr>
      <td >
        vCNS / NSX Syslog
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Export logs to both IPv4 and IPv6 Syslog Servers
      </td>
    </tr>
  </table>
</div>

### Related VMware products

The only other VMware product line that supports IPv6 is Horizon View with [version 6.1](https://www.vmware.com/support/horizon-view/doc/horizon-61-view-release-notes.html).

#### Horizon View

With Horizon View the machine/OS can be configured for IPv4-only, IPv6-only or for IPv4/IPv6 dual stack. But Horizon components will not dynamically select IPv4 or IPv6 connections depending on the availability of those protocols on the entities that are involved in making the connection.



<div class="table-responsive">
  <table  style="width:100%; "  class="easy-table easy-table-default " border="0">
    <tr>
      <th >
        Product/Function
      </th>

      <th >
        Horizon 5.3
      </th>

      <th >
        Horizon 6.0
      </th>

      <th >
        Horizon 6.1
      </th>

      <th >
        Notes
      </th>
    </tr>

    <tr>
      <td >
        <strong>VMware Horizon View Components</strong>
      </td>
    </tr>

    <tr>
      <td >
        View Connection Server
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Support for PCoIP and RDP client connections.
      </td>
    </tr>

    <tr>
      <td >
        View Security Server
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Support for PCoIP and RDP client connections.
      </td>
    </tr>

    <tr>
      <td >
        View Agent
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Can communicate with other View components over IPv6.
      </td>
    </tr>

    <tr>
      <td >
        View Client
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Partial
      </td>

      <td >
        Only the Windows platforms is supported. Mac, iOS, and Android are not supported.
      </td>
    </tr>

    <tr>
      <td >
        View Administrator
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Web Service usable over IPv6 connection. Can manage IPv6-enabled desktops and configure components for IPv6.
      </td>
    </tr>

    <tr>
      <td >
        View Composer
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Allow View to rapidly deploy multiple linked-clone desktops from a single centralized base image, over IPv6.
      </td>
    </tr>

    <tr>
      <td >
        <strong>VMware Horizon View Integration Interfaces</strong>
      </td>
    </tr>

    <tr>
      <td >
        Event database
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Interact with MS SQL or Oracle database over IPv6.
      </td>
    </tr>

    <tr>
      <td >
        View PowerCLI
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Use of IPv6 in PowerCli scripts not supported. Interact with View from PowerCLI over IPv6 not supported.
      </td>
    </tr>

    <tr>
      <td >
        Lightweight Directory Access Protocol (LDAP)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        <em>Yes</em>
      </td>

      <td >
        Interact with LDAP server over IPv6.
      </td>
    </tr>

    <tr>
      <td >
        Microsoft System Center Operations Manager (SCOM)
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        No
      </td>

      <td >
        Interact with SCOM server over IPv6 not supported.
      </td>
    </tr>
  </table>
</div>
