---
title: Monitoring IPv6 websites and SaaS apps via ThousandEyes
date: 2014-06-02T08:22:23+00:00
author: Christian Elsen
excerpt: ThousandEyes is a SaaS offering for monitoring SaaS application and website performance and provides deep insight into the underlying network including IPv6.
layout: single
permalink: /2014/06/02/monitoring-ipv6-websites-via-thousandeyes/
redirect_from:
  - /2014/06/02/monitoring-ipv6-websites-via-thousandeyes/amp/
categories:
  - EdgeCloud
tags:
  - IPv6
  - Management
  - Network
toc: true
---
Recently I stumbled over a small startup in San Francisco called [ThousandEyes](https://www.thousandeyes.com/). They provide a service for complete, end-to-end visibility of cloud applications and infrastructure telling you where and why services are breaking or under-performing. This allows SaaS providers to ensure that their application can be leveraged by customers at various locations throughout the world with an optimal or at least acceptable performance. But it also allows Enterprise customers to ensure that the SaaS applications used by the company are available from all campuses and branch offices at the desired performance, taking into consideration all elements of the delivery chain (See Figure 1).

{% include figure image_path="/content/uploads/2014/05/TE2.png" caption="Figure 1: End-to-end visibility of cloud applications and infrastructure telling you where and why services are breaking" %}

# Getting started

## Deploying Agents

ThousandEyes leverages so-called agents that probe a target via various tests which can be individually defined. These agents can either be deployed at the network edge or even better deep inside the network, close to the actual end-user of the monitored service. Agents are offered as either a virtual appliance or as a Linux package for various distributions (See Figure 2).

{% include figure image_path="/content/uploads/2014/05/Intro1.png" caption="Figure 2: Setting up local monitoring agents" %}

While it's great to see that ThousandEyes supports IPv6 at all, there are some limitations. On an IPv4/IPv6 dualstack host you unfortunately have to choose between running the agent either against an IPv4 or IPv6 address. Right now it is not possible to chose both at the same time. It would make more sense if this was possible along with specifying via the test which protocol to use. This way ThousandEyes doesn't provide the capability to easily compare IPv4 vs. IPv6 traffic out of the box.

Instead I had to simulate such a setup by using two agents, one for IPv4 and one for IPv6. Adding more agents would break this model and makes things hard to read and understand.

Also it is currently not possible to install more than one agent on a Linux host requiring separate hosts for the IPv4 and IPv6 agents. But thanks to [Docker](https://www.docker.com/) I was able to deploy one agent against the IPv6 address and one agent inside a Docker container against an IPv4 address on the same host. The two agents that you therefore see in Figure 2 are actually both running on the same host. With this I could go on with my initially intended use case.

I'm confident that these minor shortcomings will be fixed over time as more and more Enterprise and SaaS provider customers adopt this tool.

## Defining Tests

You can define four kinds of tests within ThousandEyes. Depending on which test you select, sub-tests are either automatically created or can be created on demand. The example in Figure 3 shows a "HTTP Server Only" test which probes the URL of this blog site with a given interval. This test will provide you with web site specific metrics around Availability, Response Time and Fetch Time. More advanced Web tests are possible, but I will not cover them here.

With the tick box "Enable network measurements" you activate a so-called network test against the same hostname and port that gives insight into end-to-end metrics like Latency, Packet Loss or Jitter. Also tests for providing information around Bandwidth and MTU - important for discovering problematic tunnels - can be added. A network test can also be configured manually.

A network test will also automatically create a BGP test against the IPv4 and/or IPv6 prefix that the hostname resolves to. More about this later on.

Unfortunately, it is currently not very intuitive which tests are created and what hierarchy exists between them while you create them. Your best indicator is to look at the Alert Rules field. For each kind of test that will be created, a separate Alert Rule is created. In this example you see the three rules corresponding to the three tests I just mentioned.

{% include figure image_path="/content/uploads/2014/05/Intro2.png" caption="Figure 3: Setting up tests against applications and websites" %}

# Dashboard

Once you've setup the agents and tests, you can move to the Dashboard and wait for some initial data to come in. The Dashboard provides you key metric information about the tests you defined. In the case of a "HTTP Server Only" test you will see the average Availability and Response time across all agents (See Figure 4). Clicking on one of the tests will then provide you additional deeper information.

The Dashboard will also show you alarms and the status of your agents.

{% include figure image_path="/content/uploads/2014/05/Intro3.png" caption="Figure 4: Keeping an eye on important metrics" %}

## Web-HTTP Server Test

At the Web-HTTP Server level for a test we can see additional information around Availability, Response Time and Fetch time for the configured URL. These are nicely visible across a select-able time axis as well as across the different select-able agents.

In this example we notice that the Connect Time for the same URL differs quite dramatically between a connection over IPv4 and IPv6. The Connect Time over IPv4 being 5 ms and the Connect Time over IPv6 being more than twice of that with 13 ms (See Figure 5).

{% include figure image_path="/content/uploads/2014/05/Hetzner1.png" caption="Figure 5: Website performing better over IPv4 than IPv6" %}

Let's try to use ThousandEyes and figure out why our users will get a worse experience of our sample website via IPv6 than they would get over IPv4.

For this we drill down into the next layer of information, into the End-to-End metrics via the "Jump to..." function (See Figure 6).

{% include figure image_path="/content/uploads/2014/05/Hetzner1a.png" caption="Figure 6: Drill down via *Jump to...*" %}

## Network End-to-End Metrics

Within the Network End-to-End Metrics we will find information about Loss, Latency, Jitter and Bandwidth of the connection. Again, these are nicely visible across a select-able time axis as well as across the different select-able agents. With this we can quickly determine that our IPv4 agent has a lower latency towards the destination then the IPv6 agent. As both agents are basically the same machine, this should not be the case (See Figure 7). Let's drill down even more into the next layer of information.

{% include figure image_path="/content/uploads/2014/05/Hetzner2.png" caption="Figure 7: Cause: Latency higher over IPv6 than IPv4" %}

## Network Path Visualization

The Network Path Visualization is a graphical Traceroute on steroids. Using TCP instead of ICMP - which might be filtered or take a different path - it shows all detected path between an agent and target along with valuable information. Hovering the mouse over the hops of the IPv6 connection will show information about each of the hops. The same applies for the link between two hops (See Figure 8).

This way we can quickly determine that the IPv6 agent reaches the webserver for the configured URL via the Vienna Internet Exchange in Vienna, Austria. The agent itself is located in Nuremberg, Germany about 300 miles / 480 km away from Vienna.

{% include figure image_path="/content/uploads/2014/05/Hetzner3.png" caption="Figure 8: IPv6 route goes from Nuremberg to Vienna" %}

Looking at the IPv4 agent we can see that this in this case the webserver is located in Frankfurt, Germany about 100 miles / 160 km away (See Figure 9).

{% include figure image_path="/content/uploads/2014/05/Hetzner4.png" caption="Figure 9: IPv4 route goes from Nuremberg to Frankfurt" %}

This discrepancy in path chosen for IPv4 and IPv6 traffic as well as the distance between the locations explain the performance difference.

I need to point out that the URL in this example is served by [CloudFlare](https://www.cloudflare.com/), a content delivery network and distributed domain name server service which uses [Anycast](https://en.wikipedia.org/wiki/Anycast) for improving website performance and speed, and to protect websites from online threats. As CloudFlare has [Points-of-Presence (POPs)](https://www.cloudflare.com/network/) in both Vienna and Frankfurt, traffic can be served by either of these locations, both in IPv4 and IPv6.

The problem in this case appears to be on the side of the provider in Nuremberg as they prefer a path towards Frankfurt for connecting to AS13335 (CloudFlare) via IPv4 while preferring a path towards Vienna for the same AS via IPv6. Here another nice feature of ThousandEyes comes into play: Share This Screen. This allows me to share the current screen with either live data or "canned" data around the time I have currently selected with someone who is not a customer of ThousandEyes. I can therefore easily share what I just discovered with the Service Provider in Nuremberg, allowing them to reproduce and better understand the issue. A great feature that saves a lot of time (See Figure 10).

{% include figure image_path="/content/uploads/2014/05/Hetzner4_.png" caption="Figure 10: The *Share This Screen* feature allows others to see what I see" %}

## Network - BGP Route Visualization - IPv6

Let's drill down even further into the BGP Route Visualization. We will start with IPv6. Here we see the BGP connectivity between ThousandEyes public agents and the target AS. Unfortunately the number of IPv6 capable public agents is very limited. Nevertheless we can see CloudFlare (AS13335) connecting to large transit providers such as Telia Sonera (AS1299) (See Figure 11).

{% include figure image_path="/content/uploads/2014/05/Hetzner5.png" caption="Figure 11: IPv6 Peering of CloudFlare (AS13335; blue-green circle) observed from agents (green circle)" %}

## Network - BGP Route Visualization - IPv4

Next we will look at the BGP routes for IPv4. Before we can do so, we will notice something interesting. ThousandEyes has discovered three applicable prefixes for the URL that was provided. There is a /21 and two more specific /24 prefixes (See Figure 12). Note that the URLs hostname actually resolves via DNS to two IPv4 addresses, one in each of the /24 prefixes.

{% include figure image_path="/content/uploads/2014/05/Hetzner6.png" caption="Figure 12: CloudFlare announces three IPv4 prefixes" %}

An interesting feature of ThousandEyes is the ability to discover and show path changes for the case that a BGP peer was lost. Such path changes often result in brief moments of lost reachability while the path change propagates upstream. Or even worse it might cause route flapping, which can cause excessive activity in all the other directly connected routers.

Let's look at the /21 prefix first. With a much larger number of IPv4 public agents we get a pretty nice picture of CloudFlares route graph (See Figure 13). We can see direct connections to Transit providers such as nLayer (aka GTT; AS4436) or Telia Sonera (AS1299), but also to smaller peering partners such as SoftLayer (AS36351).

{% include figure image_path="/content/uploads/2014/05/Hetzner7.png" caption="Figure 13: IPv4 Peering of CloudFlare (AS13335)" %}

Now let's see what happens when we look at one of the more specific /24 prefixes. Well, we are seeing a surprise (See Figure 14). The more specific /24 prefix is actually not visible from the majority of other Autonomous Systems. It appears to be only visible via especially smaller providers that peer directly with CloudFlare.

{% include figure image_path="/content/uploads/2014/05/Hetzner8.png" caption="Figure 14: More specific prefix is not visible in all peers, depicted as red border" %}

CloudFlare uses a capability of BGP where a more specific route beats a less specific one, in order to perform clever traffic engineering. This approach allows CloudFlare to force end-user traffic via these direct peers to a more local POP, instead of preferring a transit provider and thus potentially terminating traffic farther away with a higher latency.

I wonder if CloudFlare has a tool as nice as ThousandEyes available to monitor and optimize their BGP traffic engineering.

ThousandEyes raises this anomaly as an alert, which you might have seen in Figure 4, even though it is not actually an issue but a desired behavior. Unfortunately there is no way to specify this as the desired behavior and disable the alarm for this.

# Discovering Issues with your ISP: IPv6 vs IPv4

Let's look at another interesting use case for ThousandEyes: IPv4 vs. IPv6 path performance. In this case we will have a look at an IPv4/IPv6 Dualstack target in the same physical location. Thus no Anycast this time.

One path leverages IPv6, the other one IPv4 (See Figure 15). Here we can clearly see issues with the IPv6 path - depicted in red - within the provider network that hosts the target.

{% include figure image_path="/content/uploads/2014/05/AboveNet01.png" caption="Figure 15: IPv4 vs IPv6 path with issues in IPv6 path" %}

Looking at one of the problematic links (highlighted in yellow) via the IPv6 path, we can see a high delay and loss rate (See Figure 16). We also see that this link is part of an MPLS tunnel.

{% include figure image_path="/content/uploads/2014/05/AboveNet03.png" caption="Figure 16: High Delay and Loss via IPv6 on a segment within an MPLS tunnel" %}

Looking at the same link via IPv4 (again highlighted in yellow), we don't see any loss and a reasonable delay (See Figure 17). It appears that the depicted provider has performance problems with its IPv6 traffic.

{% include figure image_path="/content/uploads/2014/05/AboveNet02.png" caption="Figure 17: No issues on same segment via IPv4" %}

It is no secret that older network equipment provides inferior performance for processing IPv6 traffic over IPv4 traffic. In extreme cases this can even mean that processing for IPv6 is done in software using the supervisor, while processing IPv4 is done in ASIC. Such an outdated network will obviously create massive issues as IPv6 vs. IPv4 traffic ratios pick up.

# Summary

ThousandEyes is a very interesting tool for gaining insight into SaaS application performance and your overall network infrastructure. If you are an enterprise relying on SaaS applications such as [Microsoft Office 365](https://products.office.com/en-us/) or [Google Apps](https://gsuite.google.com/), this is a great way to ensure that your employees get the performance they expect. It will help you identify issues and let you troubleshoot and resolve them quickly.

If you are a service provider offering a SaaS application, ThousandEyes is equally valuable as you are now not only able to monitor your service from various locations worldwide, but also drill down deep into any issues in the Internet that might degrade your customer's experience. In the end the customer cares about the end-to-end experience, where a SaaS provider has limited direct control over the delivery chain.

Let's hope that the existing rudimentary IPv6 support gets better over time as well.
