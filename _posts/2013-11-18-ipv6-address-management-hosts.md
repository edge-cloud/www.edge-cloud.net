---
title: IPv6 Address management of hosts
date: 2013-11-18T08:04:50+00:00
author: Christian Elsen
excerpt: 'This article explores the address management concepts available with IPv6: None, Manual, Stateless Address Auto Configuration (SLAAC), Statefull with DHCPv6'
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
toc: true
---
IPv6 brings a few new address management concepts to the table, that are unknown in IPv4. This article will shed some light on these mechanism along with some guidance on using them as well as giving examples with Linux and Windows hosts.

While IPv4 knew the address management mechanism of None, Manual and DHCP, IPv6 offers the following options:

  * 1. None
  * 2. Manual
  * 3. Stateless Address Auto Configuration (SLAAC) ([RFC 4862](https://tools.ietf.org/html/rfc4862))
      * 3.1 Nameserver configured manually
      * 3.2 Nameserver via RDNSS ([RFC 6106](https://tools.ietf.org/html/rfc6106))
      * 3.3 Nameserver via DHCPv6 ([RFC 3736](https://tools.ietf.org/html/rfc3736))
  * 4. Statefull with DHCPv6 ([RFC 3315](https://tools.ietf.org/html/rfc3315))

# IPv6 Address Management

## 1. None

Unfortunately I've seen a few cases where products didn't allow disabling IPv6 on their network interface. And I've also seen more than enough networks where architects and engineers decided to "disable" IPv6 by just ignoring it.

Both poses a fundamental security risk, as it exposes an attack vector that is unmanaged or even unknown to the organization.

Therefore network devices and hosts need to offer the option to disable the IPv6 stack.

From a router perspective on the other hand it is not sufficient to just leave away an IPv6 address on an interface. You need to actively suppress IPv6 Router Announcements (RA) and DHCPv6 Replys as well as filter out IPv6 tunnel protocols.

Tools that come in handy here are IPv6 Router Advertisement Guard ([RFC 6105](https://tools.ietf.org/html/rfc6105)) as well as [DHCPv6 Shield](https://tools.ietf.org/html/draft-ietf-opsec-dhcpv6-shield-01), also known as [DHCPv6 Guard](http://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipv6/configuration/15-2s/ip6-15-2s-book/ip6-dhcpv6-guard.html).

## 2. Manual

The next approach is manually configuring an IPv6 address. This will require manual assignment and configuration of IPv6 addresses along with a prefix length and nameservers on the the client side.

While this approach is straightforward on a router for IPv4 by solely specifying an IPv4 address, it requires a bit more in IPv6. Here we need to ensure that the router will not send out Router Announcements (RA), including those responding to a router solicitation. Otherwise devices in a network will learn about the used prefix and automatically generate an IPv6 address. That's what SLAAC does and it is described in the next section.

Here is an example for configuring an interface for static IPv6 addressing mode on an [Arista Networks](https://www.arista.com/en/) device.

```
interface Vlan5
   description IPv6-Only (Manual)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd ra suppress all
   ipv6 ospf 1 area 0.0.0.0
```

Let's attach a Windows 2012 host to the above network segment and see what happens. Figure 1 shows that the Windows 2012 machine fails to automatically acquire a global IPv6 address as expected. Solely the link local address is generated.

{% include figure image_path="/content/uploads/2013/11/Windows2012_Manual.png" caption="Figure 1: Windows fails to acquire a global IPv6 address" %}

If we want to connect this Windows 2008R2 machine to the network via IPv6, we need to configure the IPv6 network settings manually as shown in Figure 2.

{% include figure image_path="/content/uploads/2013/11/Windows2012_Manual_Config.png" caption="Figure 2: Manual IPv6 address configuration in Windows" %}

Let's do the same on Linux with an Ubuntu 13.10 machine. As expected Figure 3 shows us that also the Ubuntu machine will fail to acquire a global IPv6 address automatically as expected. Only the link local address is automatically generated.

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Manual.png" caption="Figure 3: Ubuntu fails to acquire an IPv6 address" %}

Configuration of a manual IPv6 address is done in Ubuntu 13.10 via the file `/etc/network/interfaces` as shown in Figure 4.

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Manual_Config.png" caption="Figure 4: Configure static IPv6 address in Ubuntu via */etc/network/interfaces*" %}

## 3. Stateless Address Auto Configuration (SLAAC)

The next mechanism is completely unknown in IPv4 and therefore new to IPv6. Stateless Address Auto Configuration (SLLAC) is a mechanism described in [RFC 4862](https://tools.ietf.org/html/rfc4862), which uses ICMPv6 packets to let routers in a network regularly announce the configured IPv6 prefix. Upon receiving of such an ICMPv6 packet - called Router Advertisement (RA), hosts will automatically generate an IPv6 address based on their own MAC address and this prefix. The mechanism is called "Stateless" as it doesn't require any state to be kept within the router to avoid IPv6 address collision. Prevention of collisions is solely achieved by utilizing a modified [EUI-64 mechanism](https://en.wikipedia.org/wiki/MAC_address).

Figure shows how such a Router Advertisement packet looks like in Wireshark. We can clearly see the advertised prefix as well as the prefix length.

{% include figure image_path="/content/uploads/2013/11/Capture_RA.png" caption="Figure 5: Router Announcement packet in Wireshark" %}

Before we can dive into the configuration of SLAAC, we need to understand that SLAAC by itself only provides a mechanism for assigning a host an IPv6 address as well as a default gateway. It does not provide information for a nameserver to be used as a resolver. To provide this information we need to combine SLAAC with either RDNSS or DHCPv6.

For Linux to pick up IPv6 via SLAAC, the interface has to be configured in `/etc/network/interfaces` via `iface eth0 inet6 auto`.

### 3.1 Stateless - Nameserver configured manually

In this approach we will combine SLAAC for automatic configuration of the hosts address and gateway information along with manually configuring the Nameserver on each host.

An example router configuration for an Arista Networks device would look like this:

```
interface Vlan5
   description IPv6-Only (Stateless with manual DNS)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 ospf 1 area 0.0.0.0
```

Figure 6 shows an example of how this would look like in Windows.

{% include figure image_path="/content/uploads/2013/11/Windows2012_Manual_Config_DNS.png" caption="Figure 6: SLAAC with Manual Nameserver in Windows" %}

The manual configuration under Ubuntu 13.10 is quite simple: Just add the line `dns-nameservers fd80::10 fd80::11` to the corresponding interface section within the file `/etc/network/interfaces`.

### 3.2 Stateless - Nameserver via RDNSS

Recursive DNS Server (RDNSS) and DNS Search List (DNSSL) as defined in [RFC 6106](https://tools.ietf.org/html/rfc6106) are basically an extensions to the RA mechanism.

Figure 7 shows the additional options within an ICMPv6 RA packet to carry the nameserver information.

{% include figure image_path="/content/uploads/2013/11/Capture_RA_RDNSS.png" caption="Figure 7: RA packet with RDNSS and DNSSL options" %}

Configuration of RDNSS is straight forward on an Arista Networks device as the example below highlights.

```
interface Vlan5
   description IPv6-Only (Stateless with RDNSS)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd ra dns-server fd80::10
   ipv6 nd ra dns-server fd80::11
   ipv6 nd ra dns-suffix ipv6.vmwcs.com
   ipv6 ospf 1 area 0.0.0.0
```

But what about the clients? Windows does not support acquiring the nameserver information via RDNSS and DNSSL.

And also with Ubuntu 13.10 you are out of luck in an out-of-the-box installation. But with Linux you can at least easily retrofit the RDNSS and DNSSL capability. Here is how:

Install the RDNSS package via `sudo apt-get install rdnssd` and add the line `*.rdnssd` at the top of the file `/etc/resolvconf/interface-order`. After restarting the network with `sudo service networking restart`, your Ubuntu machine will acquire the nameserver information along with the IP address information as shown in Figure 8.

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Stateless_RDNSS.png" caption="Figure 8: Acquiring nameserver information via RDNSS" %}

As very few clients support RDNSS and DNSSL today, this addressing approach is not recommended for production usage.

### 3.3 Stateless - Nameserver with DHCPv6

The next approach involves still using Router Advertisements for the address assignment, but relying on DHCPv6 to hand out the Nameserver information. This approach is still stateless as the DHCPv6 server solely hands out static information about a networks domain information. It does not keep any state about a DHCPv6 lease for a client.

This approach is accomplished by setting the so called "Other" or just "O" flag within the Router Advertisements as shown in Figure 9. This will instruct clients to generate their IPv6 address based on the included prefix, but use DHCP for the nameserver - or "other" - information.

{% include figure image_path="/content/uploads/2013/11/Capture_RA_O-Flag.png" caption="Figure 9: RA with *Other* flag set" %}

Before we can configure the "Other" flag on our router, we need to setup a DHCP server, which will serve the nameserver information. In this example I'm using an [Infoblox vNIOS grid](https://www.infoblox.com/products/infoblox-appliances/) to do so. Figure 10 shows the configuration.

{% include figure image_path="/content/uploads/2013/11/Infoblox_Nameserver.png" caption="Figure 10: Infoblox DHCPv6 basic configuration" %}

Besides setting the "Other" flag within RA, we now also need to configure a DHCP relay on our router's interface.

```
interface Vlan5
   description IPv6-Only (Stateless with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
```

This approach would be very handy if there weren't these pesky clients. Both Windows and Linux don't behave at all as we expect them to.

For Windows if a DHCPv6 server is available but doesn't offer IPv6 addresses (which is what we want with the Stateless DHCPv6 setup), Windows will ignore the results from the server altogether and not take over the nameserver information. However, if the DHCPv6 server returns an IPv6 address along with the nameserver information, Windows will add the address to the interface and use the additional information. That means your Windows system now has two IPv6 addresses and can use and be reached on either address. Worse, both addresses will be published in DNS.

Linux doesn't behave that much better as it will ignore the "Other" flag and not ask for nameserver information via DHCPv6. At least here we can fix it quickly by forcing Linux to call "dhclient" once the interface goes up (See Figure 11) and configure "dhclient" to only ask for the IPv6 namesever relevant information, but not for an address (See Figure 12).

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Stateless_DHCPv6_Fix1.png" caption="Figure 11: Force Linux to request additional information via DHCPv6" %}

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Stateless_DHCPv6_Fix2.png" caption="Figure 12: Instruct Linux only to ask for nameserver-relevant information via DHCPv6" %}

## 4. Stateful with DHCPv6

Last but not least we have the option to use stateful address assignments via DHCPv6. This approach isn't very different from what we know from IPv4. You can either specify a pool of addresses from which addresses are randomly drawn for a client. Or you can assign IP addresses fixed to a given host based on it's NIC's MAC address.

What's different with DHCPv6 is that this fixed mapping isn't based on the MAC address anymore, but on a DHCP Unique Identifier (DUID). There are three types of DUIDs:

  1. Link-layer address plus time
  2. Vendor-assigned unique ID based on Enterprise Number
  3. Link-layer address, based on universally unique identifier (UUID)

This makes finding the DUID not trivial.

Another difference from IPV4 is that we can actually instruct the clients to use DHCP via the Router Advertisements. Besides setting the "Other" flag for obtaining the nameserver information via DHCP, we now also set the "Managed" or "M" flag. This will tell clients to acquire an IPv6 address via DHCPv6 instead of generating one based on the local prefix.

Below is an example for configuring this with an Arista Networks device:

```
interface Vlan5
   description IPv6-Only (Stateful with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd managed-config-flag
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
```

This ends up actually being a hybrid between SLAAC, Nameserver via DHCPv6 and Statefull with DHCPv6:

Once again, these pesky clients make it a bit complicated as they now acquire an IPv6 address via SLAAC and DHCPv6. The solution for this is not to set the (A)utonomous flag when advertising the prefix.

This would change the configuration into:

```
interface Vlan5
   description IPv6-Only (Stateful with DHCPv6)
   ipv6 address fdd2:3a59:6db7:3340::1/64
   ipv6 nd prefix fdd2:3a59:6db7:3340::/64 no-autoconfig
   ipv6 nd managed-config-flag
   ipv6 nd other-config-flag
   ipv6 dhcp relay destination fdd2:3a59:6db7:3310::240
   ipv6 ospf 1 area 0.0.0.0
```

With this Windows will behave as expected and only acquire a single IPv6 address via DHCPv6 along with the nameserver information (See Figure 13).

{% include figure image_path="/content/uploads/2013/11/Win2012_Statefull.png" caption="Figure 13: Stateful IPv6 address assignment via DHCPv6" %}

For Linux to pick up IPv6 via DHCPv6, the interface has to be configured in `/etc/network/interfaces` via `iface eth0 inet6 dhcp`. Once this is done, it will also acquire a single IPv6 address via DHCPv6 along with the nameserver information (See Figure 14).

{% include figure image_path="/content/uploads/2013/11/Ubuntu_Statefull.png" caption="Figure 14: Stateful address assignment via DHCPv6" %}

Last but not least this approach has the benefit that IPv6 address usage is tracked within the DHCPv6 server (See Figure 15).

{% include figure image_path="/content/uploads/2013/11/Infoblox_Statefull_Leases.png" caption="Figure 15: IPv6 address leases within Infoblox" %}


# DHCPv6 Prefix Delegation (DHCPv6-PD)

One addressing scheme that we will glance over in this article is DHCPv6 Prefix Delegation (DHCPv6-PD). This approach is used to assign entire prefixes to downstream routers, so that they can be re-assigned to the downstream router's subnet. This is e.g. used in an ISP setup where each customer is delegated a /60 prefix, which can the be split into 16x /64 networks within the customer premises.
