---
title: Using F5 Big-IP LTM with IPv6
date: 2013-08-12T08:00:22+00:00
author: Christian Elsen
excerpt: 'A very simple way to enable legacy IPv4-based web applications to be reachable via IPv6 is to use an IPv4/IPv6-enabled load balancer - such as the F5 Big-IP LTM - to frontend the application. This is e.g. the approach that Netflix took in mid 2012 to enable their service for IPv6 via the AWS Elastic Load Balancers (ELBs). In this post we will use the F5 Big-IP Local Traffic Manager (LTM) load balancer to provide this capability.'
layout: single
permalink: /2013/08/12/f5-big-ip-ltm-with-ipv6/
redirect_from:
  - /2013/08/12/f5-big-ip-ltm-with-ipv6/amp/
  - /2013/08/f5-big-ip-ltm-with-ipv6/
categories:
  - EdgeCloud
tags:
  - F5
  - IPv6
toc: true
toc_sticky: true
---
A very simple way to enable legacy IPv4-based web applications to be reachable via IPv6 is to use an IPv4/IPv6-enabled load balancer to frontend the application. This is e.g. the [approach that Netflix took](http://techblog.netflix.com/2012/07/enabling-support-for-ipv6.html) in mid 2012 to enable their service for IPv6 via the AWS Elastic Load Balancers (ELBs).

# Architecture

In this post we will use the [F5 Big-IP Local Traffic Manager (LTM)](https://f5.com/products/big-ip/local-traffic-manager-ltm) load balancer to provide this capability. You can either use a physical device or even better the [Virtual Edition](https://f5.com/products/deployment-methods/virtual-editions).

Figure 1 shows how this approach would work: The End-User will connect to the load balancer via IPv6, which means that the load balancer needs to have an IPv6 address reachable by the end-users on its external facing interface. The load balancer then connects to the legacy IPv4 web application via IPv4. This means that no changes are necessary to this legacy web application.

If you are already using a load balancer to frontend your application for IPv4, this same load balancer can also terminate your IPv6 traffic. But you're also free to use a separate "IPv6-only" load balancer, if your operational need dictates this.

{% include figure image_path="/content/uploads/2013/08/Overview.png" caption="Figure 1: F5 Big-IP LTM brokering IPv6 traffic to legacy IPv4 Web App" %}

# F5 Big-IP and IPv6

On a first look at the GUI it doesn't appear that the F5 Big-IP supports IPv6 addresses on its interfaces or for nodes. In the corresponding dialogues there are only fields for "IP Address" and "Netmask". For IPv6 we would expect a field for a subnet prefix length instead of the netmask. It turns out that these dialogues gladly accept IPv6 addresses in the typical notation of eight groups of four hexadecimal digits separated by colons along with the subnet prefix length translated into a subnet mask following the same notation.

Although this appears to be a bit awkward at first sight, it will turn out to be much less of a hassle quite quickly: [RFC 5375 (IPv6 Unicast Address Assignment Considerations)](https://tools.ietf.org/html/rfc5375) strongly recommends that in IPv6 the subnet prefix length should always be /64. With that we only need to convert this subnet prefix length of /64 into the legacy style netmask notation.

Using the [mechanism known from IPv4](https://en.wikipedia.org/wiki/Subnetwork), the IPv6 subnet mask for a /64 network would therefore be `FFFF:FFFF:FFFF:FFFF:0000:0000:0000:0000` or in short `FFFF:FFFF:FFFF:FFFF::`. Especially the first notation lets us quickly verify that this netmask is correct:

IPv6 addresses are 128 bit long. If we want to mask out a subnet with the length of 64 bit, this would require us to mask out half of the bits. With the previously mentioned notation of eight groups of four hexadecimal digits separated by colons, this translates into the four first groups being FFFF in hex, which translates to all 1s in binary. And the remaining four groups being all zeros.

**Note:** In older versions of Big-IP, F5 has a bug that doesn't allow you to use address shortening via double-colons ("::") through the GUI or tmsh. Instead all IPv6 addresses need to be written out. Thus the address `20BA:DD06:F00D:1234::11` would need to become `20BA:DD06:F00D:1234:0:0:0:11`.
{: .notice--info}

# Configuration

## Configure the external interface for IPv6

In a first step we need to assign an IPv6 address to the external interface of the F5 Big-IP load balancer. In this example we will use the two IPv6 addresses `20BA:DD06:F00D:1234::11/64` and `20BA:DD06:F00D:1234::12/64` for the actual nodes and `20BA:DD06:F00D:1234::10/64` as the floating address.

Let's start by creating a new Self-IP under the **Network -> Self IPs** tab.

{% include figure image_path="/content/uploads/2013/08/Self-IPs1_HL.png" caption="Figure 2: Create new Self-IP" %}

Next enter the IPv6 address for the individual node as the IP address, along with the Netmask of `FFFF:FFFF:FFFF:FFFF::`. Repeat the same for the second node in an HA setup.

{% include figure image_path="/content/uploads/2013/08/Self-IPs2.png" caption="Figure 3: Use an IPv4-style subnet mask for the IPv6 address instead of the typical prefix length" %}

Now we need to configure the floating IPv6 address in a similar way:

{% include figure image_path="/content/uploads/2013/08/Self-IPs3.png" caption="Figure 4: Create a floating IPv6 address in a similar fashion" %}

## Configure an IPv6 Default Route

At this point we should be able to ping the previously created IPv6 interfaces from the same IPv6 network. Obviously we want more than this local-only connectivity and therefore need to configure an IPv6 default route on the F5 Big-IP devices. Do so by creating a new route under the **Network -> Routes** tab.

{% include figure image_path="/content/uploads/2013/08/Route1_HL.png" caption="Figure 5: Create a new route for the IPv6 default route" %}

While a default route in IPv4 can be written as 0.0.0.0/0, the IPv6 equivalent is even simpler with ::/0. Thus not only the actual IPv6 address is just ::, but so is also the Netmask. Remember to specify the correct IPv6 address for the gateway as shown in Figure 6.

{% include figure image_path="/content/uploads/2013/08/Route2.png" caption="Figure 6: Specify the destination address for the IPv6 default route" %}

## Creating Virtual Servers

The creation of a virtual server for our legacy IPv4 web application differs only slightly in IPv6 from what you might have already configured for the IPv4 equivalent. Only the IP Address has to be specified as an IPv6 address on the previously configured IPv6 subnet. As Figure 7 shows, all other capabilities can be used the same way.

{% include figure image_path="/content/uploads/2013/08/VirtualServer2.png" caption="Figure 7: Create the virtual servers similar to their IPv4 correspondent, but with an IPv6 address" %}

# VMware vCloud Director via IPv6?

In a [previous post](/2013/05/20/configuring-f5-big-ip-with-vcd/) I have shown how to configure the F5 Big-IP LTM with VMware vCloud Director (vCD) in an IPv4 setup. These two posts combined raise the question whether one could use an F5 Big-IP load balancer to quickly and easily enable VMware vCloud director to be accessible via IPv6 without having to change anything within vCD itself.

It is straight forward and easy to apply the above to the mentioned post and indeed make the HTTP Redirect, the HTTPS traffic and even the Console Proxy available under an IPv6 address via the F5 Big-IP. The HTTP Redirect as well as the HTTPS traffic will work without a flaw, making the web interface of vCD available via IPv6.

Unfortunately it is currently not possible to use the VMware Remote Console (VMRC) via the Console Proxy and IPv6, due to the locally installed VMRC tool incorrectly handling the masking of IPv6 addresses. Thus you will only be able to provide the web portion of vCD via IPv6, while still having to rely on IPv4 for the VMRC part.
