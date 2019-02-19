---
id: 1380
title: 'Implementing IPv6: Six steps to success'
date: 2014-06-25T10:00:08+00:00
author: Christian Elsen
excerpt: |
  Implementing IPv6 in your network does not require tearing down your aging IPv4 network and replacing it with a new IPv6-enabled network. Instead it is possible - and often wise - to run the IPv4 and IPv6 networks in parallel in what the industry calls a "dual-stack" network, thus adding IPv6 capabilities to your network's existing IPv4 capabilities. While such an endeavor is certainly not trivial, it might be easier than your think.
  The following article introduces a six step plan for implementing IPv6. It has served me well in past deployments and will hopefully give you some ideas and guidance.
layout: single
permalink: /2014/06/25/implementing-ipv6-six-steps-success/
redirect_from:
  - /2014/06/25/implementing-ipv6-six-steps-success/amp/
  - /2014/06/implementing-ipv6-six-steps-success/
image: /content/uploads/2014/06/ipv6.png
categories:
  - EdgeCloud
tags:
  - IPv6
  - Network
toc: true
---
Implementing IPv6 in your network does not require tearing down your aging IPv4 network and replacing it with a new IPv6-enabled network. Instead it is possible - usually even wise - to run the IPv4 and IPv6 networks in parallel in what the industry calls a "dual-stack" network, thus adding IPv6 capabilities to your network's existing IPv4 capabilities. While such an endeavor is certainly not trivial, it might be easier than your think.

The following article introduces a six step process for successfully implementing IPv6. It has served me well in past deployments and will hopefully give you some ideas and guidance.

### Goal

Dual-stack as defined in [RFC 4213](https://tools.ietf.org/html/rfc4213) refers to side-by-side implementation of IPv4 and IPv6. In this case both protocols run on the same network infrastructure, and there's no need to encapsulate IPv6 inside IPv4 (using tunneling) or vice-versa. This approach has to be considered the most desirable IPv6 transition mechanisms until IPv6 completely supplants IPv4. While it avoids many complexities and pitfalls of tunneling, it is not always possible to implement, since outdated network equipment may not support IPv6 at all.

The goal of the highlighted implementation steps in this article will focus on implementing dual-stack in an existing network. Such a network could be a data center network, a campus network, a Wide Area Network, or even wireless network. You should still have a look at [other transition mechanism](https://en.wikipedia.org/wiki/IPv6#Transition_mechanisms) and decide what best suits your requirements.

### Overview

After having determined the goal, let's have a first look at the mentioned six steps for implementing IPv6, before going into details (See Figure 1).

{% include figure image_path="/content/uploads/2014/06/6StepsToIPv6.png" caption="Figure 1: Six steps for a successful IPv6 implementation" %}

The proposed steps include:

1. **Training and Education**: Enable technical staff (engineers, support, ...) with IPv6 experience.
2. **Network Audit**: What can run IPv6 today, and what needs to be upgraded?
3. **Network Optimization**: Is the IPv4 network the best it can be?
4. **Managing IPv6 address space**: Acquire IPv6 address space and transit, draft your IPv6 address plan.
5. **Deploy IPv6 in the network**: Roll-Out IPv6 addressing and routing in the network.
6. **Enable Network Services**: This includes Active Directory/LDAP, DNS, NTP, ...

Let's look at each of these steps in more detail.

#### Step 1: Training and Education

While IPv6 is very similar to IPv4, it is still different enough to stumble at times. An example for this is the functionality of [automatic address assignment](/ipv6-address-management-hosts/) via DHCPv6, which is quite different from DHCP in the IPv4 world.

Therefore it is very important to train and educate the involved technical stakeholders in an IPv6 implementation project. Ensuring that network architects, engineers and support staff not only know the theory of IPv6, but at least had some hands-on experience in a lab setup, is crucial to the overall success.

A good start for IPv6 related training is the [6deploy IPv6 e-learning package](http://www.6deploy.eu/e-learning/english/). Other valuable resources are the [ARIN IPv6 wiki](https://getipv6.info/display/IPv6/Educating+Yourself+about+IPv6), the [RIPE IPv6 Act Now](https://www.ripe.net/publications/ipv6-info-centre/) page or [APNIC's Training](https://training.apnic.net/home) page.

#### Step 2: Network Audit

Next you need to find out not only what equipment you have in your network, but also if it will support IPv6. The ugly truth is that products from almost all vendors have issues and bugs when it comes to IPv6. In many cases even though IPv6 functionality is available according to product specifications, these capabilities are either not tested at all or not to the breadth and depth of IPv4. Even if equipment meets requirements of the [NIST USGv6](https://www-x.antd.nist.gov/usgv6/index.html) or the [IPv6 Ready logo](https://www.ipv6ready.org/) program, it doesn't mean that it's usable in your network for your use case.

With this it is unfortunately unrealistic to just “move” an Enterprise network to IPv6, as you can't necessarily believe all the vendor specifications. Instead you will have to go beyond the pure cataloging of your equipment and actually need to test the required IPv6 functionality yourself.

For missing or broken IPv6 functionality, you will then have to work with the product's vendor to acquire a fix, e.g. via a software upgrade or update. Often it is not possible to update the software and a hardware upgrade is required. In case the vendor cannot provide such a fix, or at least a roadmap with a firm timeline on anticipated fixes, it is highly recommended that you completely replace this vendor's product.

As the outcome of this step, you should have information on what equipment you use, what can be made to support IPv6 via software changes, what needs a hardware swap and especially within which time frame you can realistically expect all these upgrades and swaps to happen.

#### Step 3: Network Optimization

The IPv6 implementation in a network is often a quite large endeavor. But it is also your perfect chance to clean up your existing network - which some might even call a "mess". Most enterprise networks have organically grown over time into what they are today and include numerous artifacts from different implementation phases.

As such, you should have another look at your existing network and attempt to optimize it. Whatever you can optimize and especially simplify in your existing network today will make your life easier when adding IPv6.

While optimizing your network, you should use the following guidelines:

* **Simplify**: Reduce the complexity of your network as much as possible, as you'll end up adding complexity unintentionally over time again anyways.
* **Unify**: Standardize on components within your network. More coherence leads to less headaches while managing components.
* **Amplify**: As your previous network plans probably ended up being too small, this time plan big, really big!

Keep in mind: If you can get rid of a component altogether, there is no need to upgrade it to IPv6.

#### Step 4: Managing IPv6 address space

Nowadays it is very easy to acquire IPv6 address space as well as transit for it. If you already own IPv4 address space with your own Autonomous System (AS) you can request IPv6 address space from your [Regional Internet registry (RIR)](https://en.wikipedia.org/wiki/Regional_Internet_registry). For transit of this IPv6 address space contact your existing  IPv4 peering partners who can usually provide you with IPv6 peering as well. In case they do not offer IPv6 peering it's a good idea to look for another ISP, one that can.

If you do not own your address space, but use IPv4 addresses provided by your service provider, you can usually receive IPv6 addresses and associated transit from this service provider.

You will either receive a /32 or a /48 IPv6 address space. In IPv6 addressing, a /32 results in 65,536 subnets, each of which is the size of a /48. Each /48 contains 65,536 /64s, which is the minimum size of a subnet. Each /64 contains 18,446,744,073,709,551,616 IPv6 addresses. This means that each IPv6 /32 allocation contains 4.29 billion /64s. This is probably enough address space for a typical enterprise network. But on the other hand: What are we gonna do with all these addresses? That's where a solid IPv6 address plan comes into the picture, allocating this address space to locations and/or functions. While you might not necessarily have such an address plan for your IPv4 network, it is crucial to have one for IPv6.

If you ask "Why?", consider the following analogy: It might be possible to put together a puzzle with a few hundred or even thousand pieces without looking at the cover and seeing the picture of the final puzzle. But it's pretty much impossible to do he same with a few million or billion puzzle pieces.

A very good resource on IPv6 address planning is RIPE’s document on [Preparing an IPv6 address plan](https://www.ripe.net/support/training/material/IPv6-for-LIRs-Training-Course/Preparing-an-IPv6-Addressing-Plan.pdf/view) or the book [IPv6 Address Planning](http://amzn.to/1nA8ckm) from Infoblox' IPv6 evangelist Tom Coffeen.

As highlighted in my previous article [IPv6 deployment: Using link-local addresses as default gateway](/2013/08/07/ipv6-link-local-addresses-as-default-gateway/), I'm using the ULA address range fd53::/64 for DNS Anycast, where my DNS resolvers are fd53::11 and fd53::12 everywhere in the network. Also I use the Link Local address fe80::1 as the default gateway for static addressing. Following RIPE's recommendation I reserve a /64 network for point-to-point links, while addressing them as a /127 for 2 member addresses or /126 for 4 member addresses (e.g. for VRPP/HSRP). Furthermore I only subnet on nibble boundaries (network mask which aligns on a 4-bit boundary), making it easier to perform the math around IPv6 addresses and subnets.

Last but not least: At this point often the question comes up whether to use ULA addresses throughout the entire company along with IPv6-to-IPv6 Network Prefix Translation ([RFC 6296](https://tools.ietf.org/html/rfc6296)) or IPv6-to-IPv6 Network Address Translation ([NAT66](https://tools.ietf.org/html/draft-mrw-behave-nat66-02)), or not. This question is especially posed based on the desire to simulate the usage of IPv4's [RFC 1918](https://tools.ietf.org/html/rfc1918) address space along with NAT, coupled with the false believe that this provides security to your network. In short: [It doesn't](http://blog.ipspace.net/2011/12/is-nat-security-feature.html).

From my experience of using both approaches, Global Address space as well as ULA with NPT, I could not find any benefit of the ULA+NPT approach. Instead it only created more hassles and work. With this approach you now have to managed twice the amount of address space. So instead be happy that NAT is (hopefully) finally dead with IPv6 and use Global Unicast addresses.

#### Step 5: Deploy IPv6 in the network

Once you made it up to here, it's time to put your preparation into action. Surprisingly this step will be very easy, if you've done all your homework right. Configuring IPv6 addresses on network device interfaces is usually straight forward and configuring routing protocols - such as OSPFv3 - with IPv6 is also quite simple.

For Cisco IOS devices you can refer to the [IPv6 Implementation Guide](http://www.cisco.com/c/en/us/td/docs/ios-xml/ios/ipv6/configuration/15-2s/ipv6-15-2s-book.html) or the book [Cisco Self-Study: Implementing Cisco IPv6 Networks](http://amzn.to/1l7EFfh). Also recent course material for the [Cisco Certified Network Associate (CCNA) Routing and Switching](https://www.cisco.com/c/en/us/training-events/training-certifications/certifications/associate/ccna-routing-switching.html) certification includes details on implementing IPv6.

For address management in IPv6 you have different options as I described in the previous article [IPv6 Address management of hosts](/2013/11/18/ipv6-address-management-hosts/). In real life you will usually either use manual assignment of IPv6 addresses to e.g. server systems, or Stateful DHCPv6, where O(ther) and M(anaged) flags are set, while the (A)utonomous flag is unset inside the Router Announcements (RA). While address assignment via Stateless Address Auto Configuration (SLAAC) is often touted as one of the benefits of IPv6, it still requires DHCPv6 to assign DNS resolver information due to the lack of RDNSS ([RFC 6106](https://tools.ietf.org/html/rfc6106)) support in modern client OSes. This makes this approach as complicated and complex as using Stateful DHCPv6 right away.

#### Step 6: Enable Network Services

After configuring your network components, ranging from L3 switches, over firewalls and routers to load balancers or WAN accelerators, you're almost ready to connect end-users via IPv6. What's missing are network services such as [Domain Name System](https://en.wikipedia.org/wiki/Domain_Name_System) (DNS), [Network Time Protocol](https://en.wikipedia.org/wiki/Network_Time_Protocol) (NTP), [Remote Authentication Dial In User Service](https://en.wikipedia.org/wiki/RADIUS) (RADIUS) or Microsoft Active Directory.

While the network services available in your network might vary and differ from the list above, only by making services available via IPv6, are you actually adding value via IPv6. Otherwise your IPv6 implementation is like a highway without any on or off ramps.

Similar to the previous step, enabling IPv6 on devices or hosts for such network services is usually straight forward once you have verified that the product in its current version actually supports IPv6.

### Summary

Hopefully you've seen that implementing IPv6 in addition to IPv4 in your network isn't that hard. A successful IPv6 implementation often comes down to the right mindset of the involved stakeholders. The team needs to realize that IPv6 is not a bolt-on to IPv4. Instead it will replace IPv4, eventually. As such you should focus on designing based on this reality and ensure that IPv6 has at least the same status as IPv4. Even if you don't change any existing equipment and services, but make sure that all new equipment and services are IPv6 capable, it's just a matter of time until your network will support IPv6.

With that  IPv4 is the past, IPv6 is the future. You should know your history, but put your energy into the future.
