---
title: 'IPv6 deployment: Using IPv6 link-local addresses as default gateway'
date: 2013-08-07T16:24:26+00:00
author: Christian Elsen
excerpt: >-
  Using the simple to remember IPv6 link-local address fe80::1 as the default gateway.
layout: single
permalink: /2013/08/07/ipv6-link-local-addresses-as-default-gateway/
redirect_from:
  - /2013/08/07/ipv6-link-local-addresses-as-default-gateway/amp/
  - /2013/08/ipv6-deployment-using-link-local-addresses-as-default-gateway/
  - /2013/08/ipv6-deployment-using-link-local/
image: /wp-content/uploads/2013/08/LinkLocalDefaultGW.png
categories:
  - EdgeCloud
tags:
  - IPv6
  - Network
toc: true
---
One of the big benefits in IPv6 is the automatic configuration capability for hosts via [Stateless address autoconfiguration (SLAAC)](/2013/11/18/ipv6-address-management-hosts/#3-stateless-address-auto-configuration-slaac). Yet sometimes even in IPv6 one wants to solely manually configure hosts in a L2 segment. For this use case one needs to provide basic network information to the user configuring the host. This usually includes at least the IP address of the host along with the prefix length, the default gateway and the DNS resolver. Wouldn't it be great if we could tell users that the default gateway and the DNS resolver are always the same, no matter what network segment the host is in? And wouldn't it be great if these IPv6 addresses for default gateway and DNS resolver were short and easy to remember?

# IPv6 use case

While it's already possible to achieve something similar for the DNS resolver in IPv4, in IPv6 link-local addresses enable us to use the same default gateway in every network segment. Simplified speaking link-local addresses translate into having the same subnet available on each L2 segment. Thus this allows network engineers to configure the default gateway for client machines to be always the same. Here it doesn't matter whether this default gateway for static routing is provided via a single interface, via [Hot Standby Router Protocol (HSRP)](https://en.wikipedia.org/wiki/Hot_Standby_Router_Protocol) or [Virtual Router Redundancy Protocol (VRPP)](https://en.wikipedia.org/wiki/Virtual_Router_Redundancy_Protocol).

As a result a network engineer can give users a very simple to follow statement for manually configuring their hosts with IPv6: "The default gateway is always fe80::1". Thanks to Anycast we can already make similar statements for e.g. DNS, with "The DNS resolvers are always fd53::11 and fd53::12".

# Network Design

In the IPv4 world it is very common to use the first address within an IPv4 subnet as the default gateway, along with the second and third address potentially being used for individual HSRP/VRPP nodes. Thus on the network 192.168.0.0/24, the default gateway would usually be 192.168.0.1. In case of network architects using /24 networks for end-user facing usage, this often translates into the easy statement of "Always use the .1 as the default gateway." With IPv6 we can simplify this statement further and use a link-local address as the default gateway.

In IPv6 Link-Local addresses are mandatory addresses according to [RFC 4291](https://tools.ietf.org/html/rfc4291). This means that all interfaces are required to have at least one Link-Local unicast address from the address block fe80::/10, which has been reserved for link-local unicast addressing. The actual link-local addresses are though assigned with the prefix fe80::/64.

Combining what many of us are used to from the IPv4 world with this new feature particular to IPv6, the link-local address fe80::1 appears to be the perfect candidate for a generic default gateway within a data center or campus network. This address is for sure easier to remember and especially type in as e.g. `20ba:dd0g:f00d:1234::1`.

As each IPv6-enabled router interface will already have a link-local address generated based on the [modified EUI-64](https://en.wikipedia.org/wiki/IPv6_address#Modified_EUI-64) scheme, the address fe80::1 will either replace or augment this automatically generated address. At the same time an existing global unicast address on the interface will not be affected.

# Implementation

After having decided to use the link-local address fe80::1 as the default gateway in all end-user facing subnets, we need to configure our network devices accordingly.

Most network vendors offer a way for manually configuring an additional link-local address on an interface that slightly differs from the way a regular global unicast address is configured.

Both Cisco and Brocade do not use a prefix-length as part of the configuration, but instead use the keyword "link-local". Juniper on the other side treats configuring a link-local IPv6 address the same way as configuring a global unicast address.

With a Cisco IOS device, the configuration would look like this:

    Cisco(config)# interface gigabitEthernet3/1
    Cisco(config-if)# ipv6 address fe80::1 link-local
    Cisco(config-if)# end
    Cisco# show ipv6 interface gigabitEthernet3/1
    gigabitEthernet 3/1 is up, line protocol is up
      IPv6 is enabled, link-local address is FE80::1
      No Virtual link-local address(es):
      Global unicast address(es):
        20BA:DD06:F00D:1234::1, subnet is 20BA:DD06:F00D:1234::/48
      Joined group address(es):
        FF02::1
        FF02::2
        FF02::1:FF00:2
        FF02::1:FFD0:DEBF
      MTU is 1500 bytes
      ICMP error messages limited to one every 100 milliseconds
      ICMP redirects are enabled
      ICMP unreachables are sent
      ND DAD is enabled, number of DAD attempts: 1
      ND reachable time is 30000 milliseconds (using 30000)
      ND advertised reachable time is 0 (unspecified)
      ND advertised retransmit interval is 0 (unspecified)
      ND router advertisements are sent every 200 seconds
      ND router advertisements live for 1800 seconds
      ND advertised default router preference is Medium
      Hosts use stateless autoconfig for addresses.

We can clearly see that the IPv6 link-local address for the interface was successfully modified to fe80::1, while the global unicast address remains in place.

# Usage

For end-users this approach simplifies manual configuration of hosts for IPv6 - as e.g. necessary for servers - dramatically. They can use the same set of easy to remember and especially quick to type values for the default gateway and the primary and secondary nameserver. Figure 1 shows how this could look like in Windows 2008R2.

{% include figure image_path="/content/uploads/2013/08/LinkLocalDefault.png" caption="Figure 1: Using Link-Local IPv6 address as default gateway." %}

# Troubleshooting

While we can simplify the life of end-users by using link-local addresses on router interfaces, we are slightly complicating the life of the network operations staff. As now multiple interfaces on a router can end up with the same link-local address of fe80::1, we need to be more explicit when using this interface in troubleshooting.

As an example: In order to ping the above interface, we need to specify the [zone index](https://en.wikipedia.org/wiki/IPv6_address#Link-local_addresses_and_zone_indices) - which usually corresponds to the interface name - besides the IP address of fe80::1.

This would look like this:

    Cisco# ping fe80::1%gigabitEthernet3/1
    Type escape sequence to abort.
    Sending 5, 100-byte ICMP Echos to FE80::1, timeout is 2 seconds:
    Packet sent with a source address of FE80::1%gigabitEthernet3/1
    !!!!!
    Success rate is 100 percent (5/5), round-trip min/avg/max = 0/0/0 ms
    Cisco#

Be careful as Cisco IOS requires the interface name to be case sensitive. Also you cannot abbreviate it. This is definitely an annoyance that someone should file as a bug.

You might wonder why we didn't have to specify a zone index when we entered fe80::1 as the default gateway in Windows above. The answer to this can be found in [RFC 4007, section 6](https://tools.ietf.org/html/rfc4007#section-6), where it states: "An implementation should also support the concept of a "default" zone for each scope". Thus Windows above is using this "default" zone.

# What about DNS via Anycast?

As mentioned earlier, Anycast - both in IPv4 and IPv6 - already gives us the possibility to provide end-users a single or single set of IP addresses for the DNS resolvers, irrespective of their physical location. But why should we "burn" a global unicast IPv6 address for this? Especially as these addresses can be quite long and hard to remember.

Here [unique local addresses (ULA)](https://en.wikipedia.org/wiki/Unique_local_address) come to the rescue. In most cases ULA can be treated like [RFC 1918](https://tools.ietf.org/html/rfc1918) addresses in IPv4. Prefixes in the fd00::/8 range have similar properties as those of the IPv4 private address ranges:

* They are not allocated by an address registry and may be used in networks by anyone without outside involvement.
* They are not guaranteed to be globally unique.
* Reverse Domain Name System (DNS) entries (under ip6.arpa) for fd00::/8 ULAs cannot be delegated in the global DNS.

It's a good idea to keep DNS resolvers to be accessible from within an organization only, which is another good reason to use ULA for this use case. Also not everyone has the luxury to own an easy to remember IP address such as Google with 8.8.8.8 for their public resolver.

Therefore let's use the addresses fd53::11 and fd53::12 for our internal DNS resolver, making them easy to remember, by combining the non-changeable ULA address part with 53 as DNS uses the protocol TCP/53 and UDP/53. We can even make up the story for end-users that "fd" stands for "fixed DNS", helping them to remember this service IP.

Yet, we will chose the last octect to be 11 and 12 instead of 1 and 2 to ensure that users don't confuse these addresses with an default gateway.

With Anycast it's actually not necessary to have two different IP addresses for a company-internal DNS resolver, as it's a better idea to handle the failure of a DNS server via ther Anycast routing. But some applications and especially some humans are not happy, when they don't see two different IP addresses for a DNS resolver.

# Where is it used in the wild?

Two examples of service providers that use the IPv6 default gateway of fe80::1 and document it accordingly for their end-users are the German hosting provider [Hetzner](https://www.hetzner.de/en/hosting/produktmatrix/rootserver) as well as the [University of Wisconsin-Madison](https://kb.wisc.edu/ns/page.php?id=14099). Other examples exist, but without readily available documentation.

The German ISP [Deutsche Telekom](https://www.telekom.de/) uses their own line of branded home DSL routers called [Speedport](https://de.wikipedia.org/wiki/Speedport). Turns out that the routers within this line that are IPv6 capable use fe80::1 as the default gateway, both for static use as well as via SLAAC. These devices then also offer DNS resolver capabilities via the same IPv6 address.

So far I have not seen anyone using ULA for internal DNS resolver.

# Hall of shame

Unfortunately there are various vendors out there, crippling their product's IPv6 support and thus preventing usage of the above IPv6 deployment pattern.

Examples for this are VMware ESXi, which dropped support for link-local addresses as default gateways in version 5.0 of the hypervisor. Even the Cisco documentation ["Deploying IPv6 in the Internet Edge"](http://www.cisco.com/c/en/us/td/docs/solutions/Enterprise/Borderless_Networks/Internet_Edge/InternetEdgeIPv6.html#wp390490) picked up on this shortcoming.

{% include figure image_path="/content/uploads/2013/08/ESX_LinkLocal_DefGW.png" caption="Figure 2: ESXi refuses to use a link local IPv6 address as a default gateway during static configuration" %}

Another example is Arista, which doesn't support manually configuring link-local addresses yet:

    Arista(s2)(config-if-Vl51)#ipv6 address fe80::1/64
    % Configuring Link local addresses not yet supported

But at least Arista was quick to react when pointing out this shortcoming and created a request for enhancement (RFE).

# Analogy

The proposed solution is similar to using a vanity number such as 55555 (5 times 5) for the internal helpdesk through a companies PBX. While employees could just as well use a phone book every time to lookup the Helpdesk's phone number, using an easy to remember number makes life much easier for end-users.

Also in this analogy the Helpdesk is for internal use only, why accomplishing the same with the global telephone number 1-800-HELP4ME would be possible but fulfill a different use case.
