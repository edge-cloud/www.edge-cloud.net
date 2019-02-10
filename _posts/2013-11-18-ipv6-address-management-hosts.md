---
id: 587
title: IPv6 Address management of hosts
date: 2013-11-18T08:04:50+00:00
author: Christian Elsen
excerpt: 'This article explores the address management concepts available with IPv6: None, Manual, Stateless Address Auto Configuration (SLLAC), Statefull with DHCPv6'
layout: single
permalink: /2013/11/18/ipv6-address-management-hosts/
redirect_from:
  - /2013/11/18/ipv6-address-management-hosts/amp/
categories:
  - EdgeCloud
tags:
  - Arista
  - Infoblox
  - IPv6
---
IPv6 brings a few new address management concepts to the table, that are unknown in IPv4. This article will shed some light on these mechanism along with some guidance on using them as well as giving examples with Linux and Windows hosts.

While IPv4 knew the address management mechanism of None, Manual and DHCP, IPv6 offers the following options:

  * 1. None
  * 2. Manual
  * 3. Stateless Address Auto Configuration (SLAAC) ([RFC 4862](https://tools.ietf.org/search/rfc4862))
      * 3.1 Nameserver configured manually
      * 3.2 Nameserver via RDNSS ([RFC 6106](<a title="RFC6106" href=")https://tools.ietf.org/html/rfc6106)
      * 3.3 Nameserver via DHCPv6 ([RFC 3736](https://tools.ietf.org/html/rfc3736)
  * 4. Statefull with DHCPv6 ([RFC 3315](https://tools.ietf.org/html/rfc3315)

### 1. None

Unfortunately I've seen a few cases where products didn't allow disabling IPv6 on their network interface. And I've also seen more than enough networks where architects and engineers decided to "disable" IPv6 by just ignoring it.

Both poses a fundamental security risk, as it exposes an attack vector that is unmanaged or even unknown to the organization.

Therefore network devices and hosts need to offer the option to disable the IPv6 stack.

From a router perspective on the other hand it is not sufficient to just leave away an IPv6 address on an interface. You need to actively suppress IPv6 Router Announcements (RA) and DHCPv6 Replys as well as filter out IPv6 tunnel protocols.

Tools that come in handy here are IPv6 Router Advertisement Guard ([RFC 6105](https://tools.ietf.org/html/rfc6105)) as well as [DHCPv6 Shield](https://tools.ietf.org/html/draft-ietf-opsec-dhcpv6-shield-01), also known as [DHCPv6 Guard](http://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipv6/configuration/15-2s/ip6-15-2s-book/ip6-dhcpv6-guard.html).

### 2. Manual

The next approach is manually configuring an IPv6 address. This will require manual assignment and configuration of IPv6 addresses along with a prefix length and nameservers on the the client side.

While this approach is straightforward on a router for IPv4 by solely specifying an IPv4 address, it requires a bit more in IPv6. Here we need to ensure that the router will not send out Router Announcements (RA), including those responding to a router solicitation. Otherwise devices in a network will learn about the used prefix and automatically generate an IPv6 address. That's what SLAAC does and it is described in the next section.

Here is an example for configuring an interface for static IPv6 addressing mode on an [Arista Networks](https://www.arista.com/en/) device.

<pre>interface Vlan5
   description IPv6-Only (Manual)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd ra suppress all
   ipv6 ospf 1 area 0.0.0.0
</pre>

Let's attach a Windows 2012 host to the above network segment and see what happens. Figure 1 shows that the Windows 2012 machine fails to automatically acquire a global IPv6 address as expected. Solely the link local address is generated.

<div id="attachment_589" style="width: 387px" class="wp-caption aligncenter">
  <img class="size-full wp-image-589" src="/content/uploads/2013/11/Windows2012_Manual.png" alt="Figure 1: Windows fails to acquire a global IPv6 address" width="377" height="448" />

  <p class="wp-caption-text">
    Figure 1: Windows fails to acquire a global IPv6 address
  </p>
</div>

If we want to connect this Windows 2008R2 machine to the network via IPv6, we need to configure the IPv6 network settings manually as shown in Figure 2.

<div id="attachment_590" style="width: 567px" class="wp-caption aligncenter">
  <img class="size-full wp-image-590" src="/content/uploads/2013/11/Windows2012_Manual_Config.png" alt="Figure 2: Manual IPv6 address configuration in Windows" width="557" height="464" srcset="/content/uploads/2013/11/Windows2012_Manual_Config.png 557w, /content/uploads/2013/11/Windows2012_Manual_Config-500x416.png 500w" sizes="(max-width: 557px) 100vw, 557px" />

  <p class="wp-caption-text">
    Figure 2: Manual IPv6 address configuration in Windows
  </p>
</div>

Let's do the same on Linux with an Ubuntu 13.10 machine. As expected Figure 3 shows us that also the Ubuntu machine will fail to acquire a global IPv6 address automatically as expected. Only the link local address is automatically generated.

<div id="attachment_591" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-591" src="/content/uploads/2013/11/Ubuntu_Manual-e1384819733733.png" alt="Figure 3: Ubuntu fails to acquire an IPv6 address" width="611" height="212" />

  <p class="wp-caption-text">
    Figure 3: Ubuntu fails to acquire an IPv6 address
  </p>
</div>

Configuration of a manual IPv6 address is done in Ubuntu 13.10 via the file _/etc/network/interfaces_ as shown in Figure 4.

<div id="attachment_592" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-592" src="/content/uploads/2013/11/Ubuntu_Manual_Config-e1384819705304.png" alt="Figure 4: Configure static IPv6 address in Ubuntu via /etc/network/interfaces" width="611" height="260" />

  <p class="wp-caption-text">
    Figure 4: Configure static IPv6 address in Ubuntu via /etc/network/interfaces
  </p>
</div>

### 3. Stateless Address Auto Configuration (SLAAC)

The next mechanism is completely unknown in IPv4 and therefore new to IPv6. Stateless Address Auto Configuration (SLLAC) is a mechanism described in [RFC 4862](https://tools.ietf.org/search/rfc4862), which uses ICMPv6 packets to let routers in a network regularly announce the configured IPv6 prefix. Upon receiving of such an ICMPv6 packet - called Router Advertisement (RA), hosts will automatically generate an IPv6 address based on their own MAC address and this prefix. The mechanism is called "Stateless" as it doesn't require any state to be kept within the router to avoid IPv6 address collision. Prevention of collisions is solely achieved by utilizing a modified [EUI-64 mechanism](https://en.wikipedia.org/wiki/MAC_address).

Figure shows how such a Router Advertisement packet looks like in Wireshark. We can clearly see the advertised prefix as well as the prefix length.

<div id="attachment_603" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-603" src="/content/uploads/2013/11/Capture_RA-e1384819350876.png" alt="Figure 5: Router Announcement packet in Wireshark" width="611" height="279" />

  <p class="wp-caption-text">
    Figure 5: Router Announcement packet in Wireshark
  </p>
</div>

Before we can dive into the configuration of SLAAC, we need to understand that SLAAC by itself only provides a mechanism for assigning a host an IPv6 address as well as a default gateway. It does not provide information for a nameserver to be used as a resolver. To provide this information we need to combine SLAAC with either RDNSS or DHCPv6.

For Linux to pick up IPv6 via SLAAC, the interface has to be configured in `/etc/network/interfaces` via `iface eth0 inet6 auto`.

### 3.1 Stateless - Nameserver configured manually

In this approach we will combine SLAAC for automatic configuration of the hosts address and gateway information along with manually configuring the Nameserver on each host.

An example router configuration for an Arista Networks device would look like this:

<pre>interface Vlan5
   description IPv6-Only (Stateless with manual DNS)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 ospf 1 area 0.0.0.0
</pre>

Figure 6 shows an example of how this would look like in Windows.

<div id="attachment_609" style="width: 563px" class="wp-caption aligncenter">
  <img class="size-full wp-image-609" src="/content/uploads/2013/11/Windows2012_Manual_Config_DNS.png" alt="Figure 6: SLAAC with Manual Nameserver in Windows" width="553" height="461" />

  <p class="wp-caption-text">
    Figure 6: SLAAC with Manual Nameserver in Windows
  </p>
</div>

The manual configuration under Ubuntu 13.10 is quite simple: Just add the line `dns-nameservers fd80::10 fd80::11` to the corresponding interface section within the file `/etc/network/interfaces`.

### 3.2 Stateless - Nameserver via RDNSS

Recursive DNS Server (RDNSS) and DNS Search List (DNSSL) as defined in [RFC 6106](https://tools.ietf.org/html/rfc6106) are basically an extensions to the RA mechanism.

Figure 7 shows the additional options within an ICMPv6 RA packet to carry the nameserver information.

<div id="attachment_624" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-624" src="/content/uploads/2013/11/Capture_RA_RDNSS-e1384819548974.png" alt="Figure 7: RA packet with RDNSS and DNSSL options" width="611" height="174" />

  <p class="wp-caption-text">
    Figure 7: RA packet with RDNSS and DNSSL options
  </p>
</div>

Configuration of RDNSS is straight forward on an Arista Networks device as the example below highlights.

<pre>interface Vlan5
   description IPv6-Only (Stateless with RDNSS)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd ra dns-server fd80::10
   ipv6 nd ra dns-server fd80::11
   ipv6 nd ra dns-suffix ipv6.vmwcs.com
   ipv6 ospf 1 area 0.0.0.0
</pre>

But what about the clients? Windows does not support acquiring the nameserver information via RDNSS and DNSSL.

And also with Ubuntu 13.10 you are out of luck in an out-of-the-box installation. But with Linux you can at least easily retrofit the RDNSS and DNSSL capability. Here is how:

Install the RDNSS package via `sudo apt-get install rdnssd` and add the line `*.rdnssd` at the top of the file `/etc/resolvconf/interface-order`. After restarting the network with `sudo service networking restart`, your Ubuntu machine will acquire the nameserver information along with the IP address information as shown in Figure 8.

<div id="attachment_605" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-605" src="/content/uploads/2013/11/Ubuntu_Stateless_RDNSS-e1384819679280.png" alt="Figure 8: Acquiring nameserver information via RDNSS" width="611" height="264" />

  <p class="wp-caption-text">
    Figure 8: Acquiring nameserver information via RDNSS
  </p>
</div>

As very few clients support RDNSS and DNSSL today, this addressing approach is not recommended for production solutions.

### 3.3 Stateless - Nameserver with DHCPv6

The next approach involves still using Router Advertisements for the address assignment, but relying on DHCPv6 to hand out the Nameserver information. This approach is still stateless as the DHCPv6 server solely hands out static information about a networks domain information. It does not keep any state about a DHCPv6 lease for a client.

This approach is accomplished by setting the so called "Other" or just "O" flag within the Router Advertisements as shown in Figure 9. This will instruct clients to generate their IPv6 address based on the included prefix, but DHCP for the nameserver - or "other" - information.

<div id="attachment_608" style="width: 575px" class="wp-caption aligncenter">
  <img class="size-full wp-image-608" src="/content/uploads/2013/11/Capture_RA_O-Flag.png" alt="Figure 9: RA with &quot;Other&quot; flag set." width="565" height="419" srcset="/content/uploads/2013/11/Capture_RA_O-Flag.png 565w, /content/uploads/2013/11/Capture_RA_O-Flag-500x370.png 500w" sizes="(max-width: 565px) 100vw, 565px" />

  <p class="wp-caption-text">
    Figure 9: RA with "Other" flag set.
  </p>
</div>

Before we can configure the "Other" flag on our router, we need to setup a DHCP server, which will serve the nameserver information. In this example I'm using an [Infoblox vNIOS grid](https://www.infoblox.com/products/infoblox-appliances/) to do so. Figure 10 shows the configuration.

<div id="attachment_611" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-611" src="/content/uploads/2013/11/Infoblox_Nameserver-e1384819649649.png" alt="Figure 10: Infoblox DHCPv6 basic configuration" width="611" height="324" />

  <p class="wp-caption-text">
    Figure 10: Infoblox DHCPv6 basic configuration
  </p>
</div>

Besides setting the "Other" flag within RA, we now also need to configure a DHCP relay on our router's interface.

<pre>interface Vlan5
   description IPv6-Only (Stateless with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
</pre>

This approach would be very handy if there weren't these pesky clients. Both Windows and Linux don't behave at all as we expect them to.

For Windows if a DHCPv6 server is available but doesn't offer IPv6 addresses (which is what we want with the Stateless DHCPv6 setup), Windows will ignore the results from the server altogether and not take over the nameserver information. However, if the DHCPv6 server returns an IPv6 address along with the nameserver information, Windows will add the address to the interface and use the additional information. That means your Windows system now has two IPv6 addresses and can use and can be reached on either address. Worse, both addresses will be published in DNS.

Linux doesn't behave that much better as it will ignore the "Other" flag and not ask for nameserver information via DHCPv6. At least here we can fix it quickly by forcing Linux to call "dhclient" once the interface goes up (See Figure 11) and configure "dhclient" to only ask for the IPv6 namesever relevant information, but not for an address (See Figure 12).

<div id="attachment_613" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-613" src="/content/uploads/2013/11/Ubuntu_Stateless_DHCPv6_Fix1-e1384819631452.png" alt="Figure 11: Force Linux to request additional information via DHCPv6" width="611" height="246" />

  <p class="wp-caption-text">
    Figure 11: Force Linux to request additional information via DHCPv6
  </p>
</div>

<div id="attachment_614" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-614" src="/content/uploads/2013/11/Ubuntu_Stateless_DHCPv6_Fix2-e1384819456786.png" alt="Figure 12: Instruct Linux only to ask for nameserver-relevant information via DHCPv6" width="611" height="342" />

  <p class="wp-caption-text">
    Figure 12: Instruct Linux only to ask for nameserver-relevant information via DHCPv6
  </p>
</div>

### 4. Stateful with DHCPv6

Last but not least we have the option to use stateful address assignments via DHCPv6. This approach isn't very different from what we know from IPv4. You can either specify a pool of addresses from which addresses are randomly drawn for a client. Or you can assign IP addresses fixed to a given host based on it's NIC's MAC address.

What's different with DHCPv6 is that this fixed mapping isn't based on the MAC address anymore, but on a DHCP Unique Identifier (DUID). There are three types of DUIDs:

  1. Link-layer address plus time
  2. Vendor-assigned unique ID based on Enterprise Number
  3. Link-layer address
  4. Based on universally unique identifier (UUID)

This makes finding the DUID not trivial.

Another difference from IPV4 is that we can actually instruct the clients to use DHCP via the Router Advertisements. Besides setting the "Other" flag for obtaining the nameserver information via DHCP, we now also set the "Managed" or "M" flag. This will tell clients to acquire an IPv6 address via DHCPv6 instead of generating one based on the local prefix.

Below is an example for configuring this with an Arista Networks device:

<pre>interface Vlan5
   description IPv6-Only (Stateful with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd managed-config-flag
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
</pre>

This ends up actually being a hybrid between SLAAC, Nameserver via DHCPv6 and Statefull with DHCPv6:

Once again, these pesky clients make it a bit complicated as they now acquire an IPv6 address via SLAAC and DHCPv6. The solution for this is not to set the (A)utonomous flag when advertising the prefix.

This would change the configuration into:

<pre>interface Vlan5
   description IPv6-Only (Stateful with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd prefix fdd2:3a59:6db7:3340::/64 no-autoconfig
   ipv6 nd managed-config-flag
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
</pre>

With this Windows will behave as expected and only acquire a single IPv6 address via DHCPv6 along with the nameserver information (See Figure 13).

<div id="attachment_616" style="width: 382px" class="wp-caption aligncenter">
  <img class="size-full wp-image-616" src="/content/uploads/2013/11/Win2012_Statefull.png" alt="Figure 13: Stateful IPv6 address assignment via DHCPv6" width="372" height="442" />

  <p class="wp-caption-text">
    Figure 13: Stateful IPv6 address assignment via DHCPv6
  </p>
</div>

For Linux to pick up IPv6 via DHCPv6, the interface has to be configured in `/etc/network/interfaces` via `iface eth0 inet6 dhcp`. Once this is done, it will also acquire a single IPv6 address via DHCPv6 along with the nameserver information (See Figure 14).

<div id="attachment_617" style="width: 621px" class="wp-caption aligncenter">
  <img class="size-full wp-image-617" src="/content/uploads/2013/11/Ubuntu_Statefull-e1384819601576.png" alt="Figure 14: Stateful address assignment via DHCPv6" width="611" height="281" />

  <p class="wp-caption-text">
    Figure 14: Stateful address assignment via DHCPv6
  </p>
</div>

Last but not least this approach has the benefit that IPv6 address usage is tracked within the DHCPv6 server (See Figure 15).

<div id="attachment_618" style="width: 470px" class="wp-caption aligncenter">
  <img class="size-full wp-image-618" src="/content/uploads/2013/11/Infoblox_Statefull_Leases.png" alt="Figure 15: IPv6 address leases within Infoblox" width="460" height="96" />

  <p class="wp-caption-text">
    Figure 15: IPv6 address leases within Infoblox
  </p>
</div>

### DHCPv6 Prefix Delegation (DHCPv6-PD)

One addressing scheme that we will glance over in this article is DHCPv6 Prefix Delegation (DHCPv6-PD). This approach is used to assign entire prefixes to downstream routers, so that they can be re-assigned to the downstream router's subnet. This is e.g. used in an ISP setup where each customer is delegated a /60 prefix, which can the be split into 16x /64 networks within the customer premises.
