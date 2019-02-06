---
id: 1599
title: VMware vRealize Automation workloads with IPv6
date: 2015-05-26T09:00:38+00:00
author: Christian Elsen
excerpt: Workaround concepts for enabling VM workloads in VMware vRealize Automation for IPv6.
layout: single
permalink: /2015/05/26/vmware-vrealize-automation-workloads-with-ipv6/
redirect_from: 
  - /2015/05/26/vmware-vrealize-automation-workloads-with-ipv6/amp/
  - /2015/05/vmware-vrealize-automation-workloads-with-ipv6/
categories:
  - EdgeCloud
tags:
  - IPv6
  - NSX
  - VMware
---
Unfortunately VMware&#8217;s primary Cloud Management Platform (CMP) for the Enterprise, VMware vRealize Automation (vRA) does not support IPv6-enabled workloads out of the box. This applies to IPv6-only workloads as well as IPv4/IPv6 Dualstack workloads.

The reason for this shortcoming can partially be found within vRA, which lacks the ability to manage the lifecycle of an IPv6 enabled VM as well as associated networks. But it is also due to the lacking support of automatic IPv6 address assignment towards VMs in VMware NSX, which provides advanced network capabilities in vRA.

With various workarounds it is nevertheless possible to utilize VMware vRealize Automation with IPv6-enabled workloads. In this post I want to present three different approaches of such workarounds. They will focus on the NSX Edge device, as one of the main inhibitors and can be described with the following high-level themes: a) Remove, b) Replace, c) Script on top</li>

### vRealize Automation Network profiles

VMware&#8217;s vRealize Automation provides four different kinds of “network profiles”, which become part of a blueprint and therefore determine how the Virtual Machines within such a blueprint are connected to the network.

Let&#8217;s have a brief look at each of them, in order to understand where to start with possible workarounds:

  * **Private:** Here the VMs of an instantiated blueprint would not have outbound connectivity, but instead all networking would be isolated (contained) within the instantiated blueprint. Such a network can include a virtual router but does not have to. For our IPv6 with VMware vRealize Automation (vRA) use case this profile is irrelevant (see Figure 1). <div id="attachment_1621" style="width: 532px" class="wp-caption aligncenter">
      <img src="/content/uploads/2015/05/vRA_Profile_Private.png" alt="Figure 1: vRA Network Profile: Private" width="522" height="295" class="size-full wp-image-1621" srcset="/content/uploads/2015/05/vRA_Profile_Private.png 522w, /content/uploads/2015/05/vRA_Profile_Private-360x203.png 360w" sizes="(max-width: 522px) 100vw, 522px" />

      <p class="wp-caption-text">
        Figure 1: vRA Network Profile: Private
      </p>
    </div>

  * **NAT:** Here the VMs of a blueprint connect to a virtual router – which becomes part of the blueprint. This virtual router connects to a (physical) upstream router. It connects the blueprint internal networks to the outside world via Network Address Translation (NAT).

    Important to point out here, that the NAT Gateway will be part of the blueprint, while the upstream router is not.

    This profile is also irrelevant for our IPv6 with VMware vRealize Automation (vRA) discussion as we do not want to (and realistically cannot) use NAT with IPv6 (See Figure 2).</p> <div id="attachment_1624" style="width: 574px" class="wp-caption aligncenter">
      <img src="/content/uploads/2015/05/vRA_Profile_NAT.png" alt="Figure 2: vRealize Automation Network Profile: NAT" width="564" height="296" class="size-full wp-image-1624" srcset="/content/uploads/2015/05/vRA_Profile_NAT.png 564w, /content/uploads/2015/05/vRA_Profile_NAT-360x189.png 360w" sizes="(max-width: 564px) 100vw, 564px" />

      <p class="wp-caption-text">
        Figure 2: vRealize Automation Network Profile: NAT
      </p>
    </div>

  * **Routed:** This profile is very similar to the NAT profile, except that the virtual router does not provide NAT gateway capabilities, but instead routes the subnets (In the below figure it&#8217;s 3 of them: “Web”, “App”, and “Database”) to the upstream router via static, or better dynamic routing (See Figure 3). <div id="attachment_1626" style="width: 574px" class="wp-caption aligncenter">
      <img src="/content/uploads/2015/05/vRA_Profile_Routed.png" alt="Figure 3: vRealize Automation Network Profile: Routed" width="564" height="296" class="size-full wp-image-1626" srcset="/content/uploads/2015/05/vRA_Profile_Routed.png 564w, /content/uploads/2015/05/vRA_Profile_Routed-360x189.png 360w" sizes="(max-width: 564px) 100vw, 564px" />

      <p class="wp-caption-text">
        Figure 3: vRealize Automation Network Profile: Routed
      </p>
    </div>

    When it comes to IPv6, we will have to work with the following limitations of VMware NSX in this scenario:

      * **Static routing only:** The Logical router above will only be able to use static routing, but no dynamic routing with IPv6.
      * **Router address assignment:** The logical router above will not be able to learn an IPv6 address via DHCPv6 or SLAAC for itself. Router interfaces here have to be configured manually.
      * **VM address assignment:** The virtual machines above will not be able to learn an IPv6 address via DHCPv6 or SLAAC from the Logical Router as the Logical Router cannot act as a DHCPv6 server or relay.

    As a side note: With IPv4, vRA will maintain a pool of IPv4 subnets, assign them to an instantiated blueprint and configure the dynamic IPv4 routing. This is not possible today with IPv6.</li>

      * **External:** Here all VMs in an instantiated blueprint would connect to pre-deployed network segments (See Figure 4). <div id="attachment_1625" style="width: 574px" class="wp-caption aligncenter">
          <img src="/content/uploads/2015/05/vRA_Profile_External.png" alt="Figure 4: vRealize Automation Network Profile: External" width="564" height="297" class="size-full wp-image-1625" srcset="/content/uploads/2015/05/vRA_Profile_External.png 564w, /content/uploads/2015/05/vRA_Profile_External-360x190.png 360w" sizes="(max-width: 564px) 100vw, 564px" />

          <p class="wp-caption-text">
            Figure 4: vRealize Automation Network Profile: External
          </p>
        </div>

        For this approach various options exist:

          * These network segments can either be physical network (VLANs) or virtual networks (VXLANs). What they have in common: They need to be pre-deployed outside of vRA.
          * All VMs in a Blueprint can be attached to the same network or to different networks (see the three network example above).
          * Irrespective of how many networks the VMs are connected to, VMware NSX’ logical firewall can be used to create an experience similar to AWS security groups, where VMs are placed into a security group that enforces a coherent set of security rules.</ul>

    ### Possible workarounds for IPv6

    Now that we have set the stage with the above network profiles, we can look into possible ways to make this work. The following possibilities should be considered in this specific order due to the associated complexity and gained benefits:

      * **External profile with external address assignment:** In this option network segments (either VLANs or VXLANs) would need to be setup outside of vRA. These network segments would provide the ability to handout IPv6 addresses via DHCPv6, SLAAC, or a <a href="https://www.edge-cloud.net/2013/11/18/ipv6-address-management-hosts/" target="_blank">combination of both</a> from a physical router. <div id="attachment_1633" style="width: 610px" class="wp-caption aligncenter">
          <img src="/content/uploads/2015/05/vRA_IPv6_External.png" alt="Figure 5: Address assignment via DHCPv6 from upstream router" width="600" height="302" class="size-full wp-image-1633" srcset="/content/uploads/2015/05/vRA_IPv6_External.png 600w, /content/uploads/2015/05/vRA_IPv6_External-360x181.png 360w" sizes="(max-width: 600px) 100vw, 600px" />

          <p class="wp-caption-text">
            Figure 5: Address assignment via DHCPv6 from upstream router
          </p>
        </div>

        This approach has various levels of possibilities that could be used:

          * Flat network with single L2 segment vs. multiple function-based network segments (see 3 tier example above).
          * Use of NSX Distributed Firewall for Security groups or not. This model would be very similar to the traditional AWS EC2 Networking (the network design that was in place before AWS VPC was introduced).

        **Pro:** Address Management is completely outside vRA and can be handled by traditional hardware routers and IPAM solutions (e.g. Infoblox)

        **Con:** Limited possibilities for network design as part of a blueprint / architecture. </li>

          * **External profile with 3rd party software router:** In this option you would try to emulate the “Routed” profile with a 3rd party software router (basically a small Linux VM that is pre-configured for IPv6 and/or can accept configuration changes via a self-made API).

            In this case you would especially want automate the IPv6 address assignment for the VMs living on the network segments within the blueprint as much as possible (See the example with the 3 segments in the figure below). A very elegant way to do this would be to look at the way how major Service Providers (e.g. AT&T or Comcast) assign IPv6 addresses to their customer gateways (CPE). This address assignment can be done via <a href="https://en.wikipedia.org/wiki/Prefix_delegation" target="_blank">DHCPv6-PD (Prefix Delegation)</a> (See Figure 6). </p>
            <div id="attachment_1634" style="width: 610px" class="wp-caption aligncenter">
              <img src="/content/uploads/2015/05/vRA_IPv6_DHCP-PD.png" alt="Figure 6: Logical Router acting as DHCPv6-PD CPE device" width="600" height="315" class="size-full wp-image-1634" srcset="/content/uploads/2015/05/vRA_IPv6_DHCP-PD.png 600w, /content/uploads/2015/05/vRA_IPv6_DHCP-PD-360x189.png 360w" sizes="(max-width: 600px) 100vw, 600px" />

              <p class="wp-caption-text">
                Figure 6: Logical Router acting as DHCPv6-PD CPE device
              </p>
            </div>



            Looking at the example above, here is what would happen in this scenario:

              * The 3rd party virtual router would request via DHCPv6-PD a /56 prefix for the entire blueprint.
              * Each blueprint internal network segment (“Web”, “App”, and “Database” in the example above), would receive a /64 segment out of the assigned /56 segment.
              * Address assignment to VMs on the blueprint internal network segments could happen via DHPCv6, SLAAC, or a combination of both.
              * Dynamic routing would not be necessary. Each internal network segment uses the 3rd party virtual router as Def. gw. The 3rd party virtual router uses the upstream router as the Def. GW.
              * The physical upstream router has a static route for the /56 network pointing to the 3rd party virtual router (this is done automatically by the route as part of DHCPv6-PD.

            If desired it is possible to run additional services (e.g. load balancer, firewall via IPtables) on this 3rd party virtual router and make configuration accessible from vRA workflows via a simple custom API. As an alternative it would be possible to use a specialized Linux router distribution such as <a href="https://en.wikipedia.org/wiki/OpenWrt" target="_blank">OpenWRT</a> and allow configuration of the router from within the Blueprint via a Web GUI.

            **Pro:** Regain advanced possibilities for network design within a blueprint / architecture, while allowing address assignment to all VMs via DHCPv6 and/or SLAAC. Leverage SP-proven network concepts to treat applications like customer networks.

            **Con:** Need to engineer and maintain a 3rd party virtual router based on a standard Linux distribution </li>

              * **Route profile with vRA workflow based address assignment:** In this option address assignment to the end-user VMs, but also the virtual router would not happen via DHCPv6 or SLAAC, but statically. In the case of the NSX Edge based virtual router this would need to happen via API calls to the NSX Manager and in the case of the end-user VMs this would happen via Guest Customization through the VMware Tools. As none of these assignment capabilities, as well as the capability to manage pools of IPv6 prefixes and sub-prefixes exist in vRA today, this functionality would have to be written via vRA workflows.

                On the other hand, this approach would allow to use all of the NSX Edge based network services (load balancer, firewall) for IPv6, although configuration of these would need to happen via vRA workflows as management capabilities of these services doesn’t come out of the box via vRA.

                **Pro:** Ability to use the NSX based Edge device as router and for network services

                **Con:** Requirement to manage IPv6 addresses statically and maintain IPv6 prefix pools manually. Need to custom develop missing software capabilities via custom workflows in vRA. </ul>

            One important thing to keep in mind: Any of the L2 network transport capabilities (vDS, vSS, VXLAN) in vSphere will transport IPv6 traffic. This is different from e.g. AWS, where network segments that look like L2 (e.g. VPC subnet) are not actually L2 and will filter out any kind of IPv6 traffic. The focus of the workaround is therefore almost exclusively on the L3 element. </ul>

            ### Summary

            This post hopefully showcased that albeit not trivial, it is possible to leverage VMware vRealize Automation with IPv6-enabled workloads, through various workarounds.
