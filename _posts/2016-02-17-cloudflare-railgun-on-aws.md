---
id: 2175
title: CloudFlare Railgun on AWS
date: 2016-02-17T08:00:51+00:00
author: Christian Elsen
excerpt: 'Instructions for configuring a highly available CloudFlare Railgun setup within Amazon Web Services (AWS), using ElastiCache, AutoScaling and Elastic Load Balancing (ELB). '
layout: single
permalink: /2016/02/17/cloudflare-railgun-on-aws/
redirect_from: 
  - /2016/02/17/cloudflare-railgun-on-aws/amp/
categories:
  - EdgeCloud
tags:
  - AWS
  - Cloudflare
---
This tutorial will show you how to configure <a href="https://www.cloudflare.com/website-optimization/railgun/" target="_blank">CloudFlare Railgun</a> within <a href="https://aws.amazon.com/" target="_blank">Amazon Web Services (AWS)</a>. We will leverage <a href="https://aws.amazon.com/elasticache/" target="_blank">Amazon ElastiCache</a> together with <a href="https://aws.amazon.com/elasticloadbalancing/" target="_blank">AWS Elastic Load Balancing</a>, <a href="https://aws.amazon.com/autoscaling/" target="_blank">AWS Auto Scaling</a> and <a href="https://aws.amazon.com/ec2/" target="_blank">Amazon EC2</a> to quickly and simply achieve this goal (See Figure 1).

<div id="attachment_2207" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/cloudcraft-CloudFlare-Railgun.png" rel="attachment wp-att-2207"><img src="/content/uploads/2016/02/cloudcraft-CloudFlare-Railgun-600x381.png" alt="Figure 1: CloudFlare Railgun Setup with Amazon Web Services (AWS)" width="600" height="381" class="size-large wp-image-2207" srcset="/content/uploads/2016/02/cloudcraft-CloudFlare-Railgun-600x381.png 600w, /content/uploads/2016/02/cloudcraft-CloudFlare-Railgun-350x223.png 350w, /content/uploads/2016/02/cloudcraft-CloudFlare-Railgun-768x488.png 768w, /content/uploads/2016/02/cloudcraft-CloudFlare-Railgun.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 1: CloudFlare Railgun Setup with Amazon Web Services (AWS)
  </p>
</div>

This setup should especially be appealing to CloudFlare customers, operating their origin servers in one or more Amazon Web Services (AWS) regions, and who want to leverage the power of AWS to compensate automatically against failures of the CloudFlare Railgun Listener application.

### About CloudFlare Railgun

<a href="https://www.cloudflare.com/website-optimization/railgun/" target="_blank">CloudFlare Railgun</a> accelerates the connection between each CloudFlare point-of-presence (PoP) and a customer origin server so that requests that cannot be served from the CloudFlare cache are nevertheless served very fast. By leveraging techniques similar to those used in the compression of high-quality video, Railgun compresses previously uncacheable web objects up to 99.6%.

Railgun consists of two software components: the Listener and Sender. The Railgun Listener is installed on a server close to the customer origin server, or in some cases on the origin server itself. It’s a small piece of software that runs on a standard server and services requests from CloudFlare using the encrypted, binary Railgun protocol. Railgun Listener is a single executable whose only dependency is a running Memcache instance. It runs on 64-bit Linux and BSD systems as a daemon.

The Listener requires a single port (TCP/2408) open from the Internet for the Railgun protocol so that CloudFlare PoPs can contact it. And it requires access to the website to be accelerated via HTTP and HTTPS. The website still needs to be accessible over ports TCP/80 and TCP/443 by the CloudFlare PoPs, as a fallback path in case of Railgun experiencing any issues.

Ideally, the Listener would be placed on a server with fast access to the Internet and low latency. Installation is simply a matter of installing via an RPM or .deb file.

Railgun is available for customers with a CloudFlare <a href="https://www.cloudflare.com/plans/" target="_blank">Business</a> or <a href="https://www.cloudflare.com/plans/enterprise/" target="_blank">Enterprise</a> plan or customers hosted with an <a href="https://www.cloudflare.com/partners/view-partners/" target="_blank">Optimized Hosting Partner</a>.

### Setup Overview

As outlined in Figure 1, the setup will consist of the following elements:

  * <a href="https://aws.amazon.com/vpc/" target="_blank">Amazon Virtual Private Cloud (VPC)</a>: Provide network isolation with a public subnet to operate the Railgun nodes and a private subnet to operate the Railgun to Memcached connection.
  * <a href="https://aws.amazon.com/elasticache/" target="_blank">Amazon ElastiCache</a>: A managed Memcached cluster to fulfill the Railgun requirements. The cluster can contain one or more nodes.
  * <a href="https://aws.amazon.com/elasticloadbalancing/" target="_blank">AWS Elastic Load Balancing</a>: A managed load balancer to distribute traffic across multiple Railgun instances within the same AWS region.
  * <a href="https://aws.amazon.com/autoscaling/" target="_blank">AWS Auto Scaling</a>: Automatically replace failed Railgun instances.
  * <a href="https://aws.amazon.com/ec2/" target="_blank">Amazon EC2</a>: Run a 64-bit Linux and automatically install the latest version of CloudFlare Railgun.

The following sections walk you step-by-step through the setup. In this example we will use a Memcached cluster with 2 nodes, spread across two <a href="http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html" target="_blank">AWS Availability Zones</a>, as well as 2 Railgun nodes, spread across two AWS Availability Zones. While this setup will provide ideal redundancy, it might not suit your direct business needs. Therefore please adapt the setup accordingly.

### VPC Setup

We will use <a href="https://aws.amazon.com/vpc/" target="_blank">Amazon Virtual Private Cloud (VPC)</a> to provide network isolation. The Railgun nodes will be placed on two public network segments, so that they are reachable from the public Internet and therefore from the CloudFlare PoPs. Two private network segments will be used for traffic between the Railgun nodes and the ElastiCache based Memcached instances.

Two security groups, one for Railgun and one for ElastiCache, will be used to ensure that only valid traffic can reach the nodes.

Let's get started by creating a VPC of type "VPC with Public and Private Subnets" (See Figure 2).

<div id="attachment_2176" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/001-VPC01.png" rel="attachment wp-att-2176"><img src="/content/uploads/2016/02/001-VPC01-600x232.png" alt="Figure 2: VPC with Public and Private Subnets - Step 1" width="600" height="232" class="size-large wp-image-2176" srcset="/content/uploads/2016/02/001-VPC01-600x232.png 600w, /content/uploads/2016/02/001-VPC01-350x135.png 350w, /content/uploads/2016/02/001-VPC01-768x297.png 768w, /content/uploads/2016/02/001-VPC01.png 1048w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 2: VPC with Public and Private Subnets - Step 1
  </p>
</div>

Choose your preferred IP CIDR block and provide a meaningful VPC name, such as "Railgun-HA". Consciously pick an Availability Zone for both subnets and include the AZ identifier in the subnet name. This will later help you identify which subnet is used for what purpose and resides in what AZ. For the NAT instance information chose "Use a NAT gateway instead" (see Figure 3).

<div id="attachment_2177" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/002-VPC02.png" rel="attachment wp-att-2177"><img src="/content/uploads/2016/02/002-VPC02-600x335.png" alt="Figure 3: VPC with Public and Private Subnets - Step 2" width="600" height="335" class="size-large wp-image-2177" srcset="/content/uploads/2016/02/002-VPC02-600x335.png 600w, /content/uploads/2016/02/002-VPC02-350x196.png 350w, /content/uploads/2016/02/002-VPC02-768x429.png 768w, /content/uploads/2016/02/002-VPC02.png 1159w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 3: VPC with Public and Private Subnets - Step 2
  </p>
</div>

The VPC template for "VPC with Public and Private Subnets" will only create a single public and private subnet. But we will want to leverage two public and two private subnets, across two AZ in order to build a true highly available solution. Therefore we now need to create another public and private subnet within the VPC.

Let's start by creating another public subnet. Pick a different AZ to the one that was selected when creating the VPC. Also try to come up with a pattern for assigning the CIDR blocks. Here I use even numbers for the third octet in case it is a public subnet and uneven numbers in case it is a private subnet (See Figure 4).

<div id="attachment_2178" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/003-VPC03.png" rel="attachment wp-att-2178"><img src="/content/uploads/2016/02/003-VPC03-600x315.png" alt="Figure 4: Add another Public subnet" width="600" height="315" class="size-large wp-image-2178" srcset="/content/uploads/2016/02/003-VPC03-600x315.png 600w, /content/uploads/2016/02/003-VPC03-350x184.png 350w, /content/uploads/2016/02/003-VPC03.png 655w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 4: Add another Public subnet
  </p>
</div>

In order to make the newly created subnet a public subnet, you have to change the routing policy, so that the destination 0.0.0.0/0 points to an internet gateway, which is indicated via the target name prefix of "igw" (See Figure 5).

<div id="attachment_2180" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/005-VPC05.png" rel="attachment wp-att-2180"><img src="/content/uploads/2016/02/005-VPC05-600x268.png" alt="Figure 5: Configure the Internet Gateway for the Public Subnet" width="600" height="268" class="size-large wp-image-2180" srcset="/content/uploads/2016/02/005-VPC05-600x268.png 600w, /content/uploads/2016/02/005-VPC05-350x156.png 350w, /content/uploads/2016/02/005-VPC05.png 620w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 5: Configure the Internet Gateway for the Public Subnet
  </p>
</div>

Next create another private subnet. Here also pick a different AZ to the one that was selected for the first private subnet when creating the VPC (See Figure 6).

<div id="attachment_2179" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/004-VPC04.png" rel="attachment wp-att-2179"><img src="/content/uploads/2016/02/004-VPC04-600x314.png" alt="Figure 6: Add another Private subnet" width="600" height="314" class="size-large wp-image-2179" srcset="/content/uploads/2016/02/004-VPC04-600x314.png 600w, /content/uploads/2016/02/004-VPC04-350x183.png 350w, /content/uploads/2016/02/004-VPC04.png 657w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 6: Add another Private subnet
  </p>
</div>

After successfully creating all the necessary subnets, it's time to create the security groups. One will be used to allow Railgun traffic and another one will be used to allow Memcached traffic.

Let's start by creating the Security Group for Memcached traffic (See Figure 7).

<div id="attachment_2181" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/005-VPC06.png" rel="attachment wp-att-2181"><img src="/content/uploads/2016/02/005-VPC06-600x250.png" alt="Figure 7: Create a Security Group for Memcached" width="600" height="250" class="size-large wp-image-2181" srcset="/content/uploads/2016/02/005-VPC06-600x250.png 600w, /content/uploads/2016/02/005-VPC06-350x146.png 350w, /content/uploads/2016/02/005-VPC06.png 654w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 7: Create a Security Group for Memcached
  </p>
</div>

For the newly created Memcached security group, add an Inbound Rule. Select "Custom TCP Rule" with the protocol TCP and the port range 11211. As the Source you can select the IP range of your newly created VPC or limit it even further to the public subnets (See Figure 8).

<div id="attachment_2182" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/005-VPC07.png" rel="attachment wp-att-2182"><img src="/content/uploads/2016/02/005-VPC07-600x146.png" alt="Figure 8: Configure the Inbound Rules for the Memcached Security Group" width="600" height="146" class="size-large wp-image-2182" srcset="/content/uploads/2016/02/005-VPC07-600x146.png 600w, /content/uploads/2016/02/005-VPC07-350x85.png 350w, /content/uploads/2016/02/005-VPC07-768x186.png 768w, /content/uploads/2016/02/005-VPC07.png 936w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 8: Configure the Inbound Rules for the Memcached Security Group
  </p>
</div>

Next, create a Security Group for Railgun traffic (See Figure 9).

<div id="attachment_2183" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/005-VPC08.png" rel="attachment wp-att-2183"><img src="/content/uploads/2016/02/005-VPC08-600x251.png" alt="Figure 9: Create a Security Group for Railgun" width="600" height="251" class="size-large wp-image-2183" srcset="/content/uploads/2016/02/005-VPC08-600x251.png 600w, /content/uploads/2016/02/005-VPC08-350x146.png 350w, /content/uploads/2016/02/005-VPC08.png 655w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 9: Create a Security Group for Railgun
  </p>
</div>

For the newly created Railgun security group, add an Inbound Rule. Select "Custom TCP Rule" with the protocol TCP and the port range 2408. As the Source you can select 0.0.0.0/0 to open up access to all of the public Internet. As an alternative you could limit access even further to the <a href="https://www.cloudflare.com/ips/" target="_blank">CloudFlare IP ranges</a> only (See Figure 8).

<div id="attachment_2184" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/005-VPC09.png" rel="attachment wp-att-2184"><img src="/content/uploads/2016/02/005-VPC09-600x145.png" alt="Figure 10: Configure the Inbound Rules for the Railgun Security Group" width="600" height="145" class="size-large wp-image-2184" srcset="/content/uploads/2016/02/005-VPC09-600x145.png 600w, /content/uploads/2016/02/005-VPC09-350x85.png 350w, /content/uploads/2016/02/005-VPC09-768x186.png 768w, /content/uploads/2016/02/005-VPC09.png 942w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 10: Configure the Inbound Rules for the Railgun Security Group
  </p>
</div>

This completes the setup steps for the VPC and the Security Groups.

### ElastiCache Setup

One of the pre-requisites for running CloudFlare Railgun is access to Memcached. ElastiCache provides us a managed Memcached cluster. While a Memcached cluster does not provide full protection against the failure of a cluster node, the impact of such a failure would at least be compensated. In case of a two node cluster, only approximately half of the keys would be lost in case one node fails.

In this tutorial we will create a two node ElastiCache cluster with the engine Memcached. Before we can do this, we need to create a Cache Subnet Group. A Cache Subnet Group attaches the nodes of an ElastiCache cluster to a certain VPC subnet. Here we want to attach our ElastiCache cluster to the private subnet, that we created in the previous step.

Lookup the subnet IDs for the two private subnets that you created and start the creation of the Cache Subnet Group. Pick the VPC that you created, and for each of the two Availability Zones, specify the two private subnets (See Figure 11).

<div id="attachment_2185" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/006-ElastiCache01.png" rel="attachment wp-att-2185"><img src="/content/uploads/2016/02/006-ElastiCache01-600x315.png" alt="Figure 11: Create a Cache Subnet Group for Memcached" width="600" height="315" class="size-large wp-image-2185" srcset="/content/uploads/2016/02/006-ElastiCache01-600x315.png 600w, /content/uploads/2016/02/006-ElastiCache01-350x184.png 350w, /content/uploads/2016/02/006-ElastiCache01-768x403.png 768w, /content/uploads/2016/02/006-ElastiCache01.png 854w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 11: Create a Cache Subnet Group for Memcached
  </p>
</div>

Next start the creation of a new ElastiCache cluster and chose the engine type "Memcached" (See Figure 12).

<div id="attachment_2186" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/007-ElastiCache02.png" rel="attachment wp-att-2186"><img src="/content/uploads/2016/02/007-ElastiCache02-600x253.png" alt="Figure 12: Create an ElastiCache cluster with the engine Memcached - Step 1" width="600" height="253" class="size-large wp-image-2186" srcset="/content/uploads/2016/02/007-ElastiCache02-600x253.png 600w, /content/uploads/2016/02/007-ElastiCache02-350x148.png 350w, /content/uploads/2016/02/007-ElastiCache02-768x324.png 768w, /content/uploads/2016/02/007-ElastiCache02.png 987w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 12: Create an ElastiCache cluster with the engine Memcached - Step 1
  </p>
</div>

Chose the node type depending on your performance needs and select the number of nodes that you want in your cluster. In this example we will use 2 nodes, in order to achieve a certain level of redundancy (See Figure 13).

<div id="attachment_2187" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/008-ElastiCache03.png" rel="attachment wp-att-2187"><img src="/content/uploads/2016/02/008-ElastiCache03-600x335.png" alt="Figure 13: Create an ElastiCache cluster with the engine Memcached - Step 2" width="600" height="335" class="size-large wp-image-2187" srcset="/content/uploads/2016/02/008-ElastiCache03-600x335.png 600w, /content/uploads/2016/02/008-ElastiCache03-350x196.png 350w, /content/uploads/2016/02/008-ElastiCache03-768x429.png 768w, /content/uploads/2016/02/008-ElastiCache03.png 966w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 13: Create an ElastiCache cluster with the engine Memcached - Step 2
  </p>
</div>

Select the Cache Subnet Group that you created at the beginning of this section. Use the Availability Zone policy of "Spread Nodes Across Zones". This will ensure that in case of a Availability Zone failure, you still have one ElastiCache node left. For the VPC Security Group select the "Memcached" security group that you created (See Figure 14).

<div id="attachment_2188" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/009-ElastiCache04.png" rel="attachment wp-att-2188"><img src="/content/uploads/2016/02/009-ElastiCache04-600x314.png" alt="Figure 14: Create an ElastiCache cluster with the engine Memcached - Step 3" width="600" height="314" class="size-large wp-image-2188" srcset="/content/uploads/2016/02/009-ElastiCache04-600x314.png 600w, /content/uploads/2016/02/009-ElastiCache04-350x183.png 350w, /content/uploads/2016/02/009-ElastiCache04-768x402.png 768w, /content/uploads/2016/02/009-ElastiCache04.png 998w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 14: Create an ElastiCache cluster with the engine Memcached - Step 3
  </p>
</div>

Wait for the ElastiCache cluster to be created and note down the configuration endpoint address (See Figure 15). You will need this address in a later step.

<div id="attachment_2190" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/010-ElastiCache06.png" rel="attachment wp-att-2190"><img src="/content/uploads/2016/02/010-ElastiCache06-600x380.png" alt="Figure 15: Lookup the Memcached endpoint address " width="600" height="380" class="size-large wp-image-2190" srcset="/content/uploads/2016/02/010-ElastiCache06-600x380.png 600w, /content/uploads/2016/02/010-ElastiCache06-350x222.png 350w, /content/uploads/2016/02/010-ElastiCache06-768x487.png 768w, /content/uploads/2016/02/010-ElastiCache06.png 1197w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 15: Lookup the Memcached endpoint address
  </p>
</div>

This completes the setup steps for the ElastiCache Memcached cluster.

## Elastic Load Balancer (ELB) Setup

The Elastic Load Balancer (ELB) serves the purpose of distributing incoming traffic from the CloudFlare PoPs among the active Railgun nodes. As the ELB and its hostname serve as the termination point for CloudFlare Railgun traffic, it is very simple to replace a failed Railgun node behind the ELB, without making any configuration changes to the Railgun setup.

This configuration also allows to scale out the number of Railgun nodes or scale up the size of the Railgun nodes, without impacting production traffic.

Create a new ELB inside the VPC that you are using for the Railgun setup. For the Listener Configuration chose TCP as the Load Balancer as well as Instance protocol. Enter "2408" as the Load Balancer and Instance port. For the subnets, select the two public subnets that you created earlier (See Figure 16).

<div id="attachment_2191" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/011-ELB01.png" rel="attachment wp-att-2191"><img src="/content/uploads/2016/02/011-ELB01-600x470.png" alt="Figure 16: Define an Elastic Load Balancer - Step 1" width="600" height="470" class="size-large wp-image-2191" srcset="/content/uploads/2016/02/011-ELB01-600x470.png 600w, /content/uploads/2016/02/011-ELB01-350x274.png 350w, /content/uploads/2016/02/011-ELB01-768x602.png 768w, /content/uploads/2016/02/011-ELB01.png 1182w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 16: Define an Elastic Load Balancer - Step 1
  </p>
</div>

Next assign the security group Railgun, which you have created in an earlier step. This will ensure that only Railgun traffic is allowed through the ELB (See Figure 17).

<div id="attachment_2192" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/012-ELB02.png" rel="attachment wp-att-2192"><img src="/content/uploads/2016/02/012-ELB02-600x188.png" alt="Figure 17: Define an Elastic Load Balancer - Step 2" width="600" height="188" class="size-large wp-image-2192" srcset="/content/uploads/2016/02/012-ELB02-600x188.png 600w, /content/uploads/2016/02/012-ELB02-350x110.png 350w, /content/uploads/2016/02/012-ELB02-768x241.png 768w, /content/uploads/2016/02/012-ELB02.png 1180w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 17: Define an Elastic Load Balancer - Step 2
  </p>
</div>

Next, configure the Health Check. This will determine how the ELB will probe the Railgun nodes and determine whether they are healthy. As the ping protocol select TCP with the ping port of 2408. This is necessary as the protocol between Railgun Listener and Railgun Sender is a binary protocol and not HTTP or HTTPS. Under Advanced Details you can reduce the timeout, interval and thresholds to the minimum values for a fast failover reaction (See Figure 18).

<div id="attachment_2193" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/013-ELB03.png" rel="attachment wp-att-2193"><img src="/content/uploads/2016/02/013-ELB03-600x188.png" alt="Figure 18: Define an Elastic Load Balancer - Step 4" width="600" height="188" class="size-large wp-image-2193" srcset="/content/uploads/2016/02/013-ELB03-600x188.png 600w, /content/uploads/2016/02/013-ELB03-350x110.png 350w, /content/uploads/2016/02/013-ELB03-768x241.png 768w, /content/uploads/2016/02/013-ELB03.png 1183w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 18: Define an Elastic Load Balancer - Step 4
  </p>
</div>

In the next step you would add the various instances to the ELB. As we have not yet created any Railgun instances, we will not add any instance here.

Instead we will solely ensure that the box for "Enable Cross-Zone Load Balancing" has been ticked (See Figure 19).

<div id="attachment_2194" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/014-ELB04.png" rel="attachment wp-att-2194"><img src="/content/uploads/2016/02/014-ELB04-600x258.png" alt="Figure 19: Define an Elastic Load Balancer - Step 5" width="600" height="258" class="size-large wp-image-2194" srcset="/content/uploads/2016/02/014-ELB04-600x258.png 600w, /content/uploads/2016/02/014-ELB04-350x150.png 350w, /content/uploads/2016/02/014-ELB04-768x330.png 768w, /content/uploads/2016/02/014-ELB04.png 1183w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 19: Define an Elastic Load Balancer - Step 5
  </p>
</div>

You can tag the ELB with a name (See Figure 20).

<div id="attachment_2195" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/015-ELB05.png" rel="attachment wp-att-2195"><img src="/content/uploads/2016/02/015-ELB05-600x159.png" alt="Figure 20: Define an Elastic Load Balancer - Step 6" width="600" height="159" class="size-large wp-image-2195" srcset="/content/uploads/2016/02/015-ELB05-600x159.png 600w, /content/uploads/2016/02/015-ELB05-350x93.png 350w, /content/uploads/2016/02/015-ELB05-768x204.png 768w, /content/uploads/2016/02/015-ELB05.png 1178w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 20: Define an Elastic Load Balancer - Step 6
  </p>
</div>

Before completing the creation of the ELB, you can validate that all settings have been configured correctly (See Figure 21).

<div id="attachment_2196" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/016-ELB06.png" rel="attachment wp-att-2196"><img src="/content/uploads/2016/02/016-ELB06-600x392.png" alt="Figure 21: Define an Elastic Load Balancer - Step 7" width="600" height="392" class="size-large wp-image-2196" srcset="/content/uploads/2016/02/016-ELB06-600x392.png 600w, /content/uploads/2016/02/016-ELB06-350x229.png 350w, /content/uploads/2016/02/016-ELB06-768x502.png 768w, /content/uploads/2016/02/016-ELB06.png 1180w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 21: Define an Elastic Load Balancer - Step 7
  </p>
</div>

Once the ELB has been created successfully, lookup the DNS name and note it down (See Figure 22). You will need it in a subsequent step.

<div id="attachment_2197" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/017-ELB07.png" rel="attachment wp-att-2197"><img src="/content/uploads/2016/02/017-ELB07-600x282.png" alt="Figure 22: Lookup the ELB DNS name" width="600" height="282" class="size-large wp-image-2197" srcset="/content/uploads/2016/02/017-ELB07-600x282.png 600w, /content/uploads/2016/02/017-ELB07-350x165.png 350w, /content/uploads/2016/02/017-ELB07-768x362.png 768w, /content/uploads/2016/02/017-ELB07.png 1232w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 22: Lookup the ELB DNS name
  </p>
</div>

This completes the setup steps for the Elastic Load Balancer (ELB).

### Auto Scaling Setup

In this setup we will use Auto Scaling primarily to automatically replace failed Railgun instances. To do so, we configure an auto scaling group with a minimum of 2 instances.

Part of the Auto Scaling configuration is a launch group, where instead of using a pre-built Railgun AMI, we will built a Linux OS with the latest Railgun version on the fly. This will dramatically reduce the overhead for managing and updating custom OS images.

Start by creating a Launch Configuration, where you select the latest Ubuntu Server LTS version as your prefered AMI (See Figure 23).

<div id="attachment_2198" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/018-EC2_01.png" rel="attachment wp-att-2198"><img src="/content/uploads/2016/02/018-EC2_01-600x369.png" alt="Figure 23: Create a Launch Configuration - Step 1" width="600" height="369" class="size-large wp-image-2198" srcset="/content/uploads/2016/02/018-EC2_01-600x369.png 600w, /content/uploads/2016/02/018-EC2_01-350x215.png 350w, /content/uploads/2016/02/018-EC2_01-768x472.png 768w, /content/uploads/2016/02/018-EC2_01.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 23: Create a Launch Configuration - Step 1
  </p>
</div>

As mentioned we will instruct the launch configuration to install and configure the latest version of CloudFlare Railgun on the fly. This can be done via the EC2 <a href="http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html" target="_blank">Cloud Init</a> method, where we pass a shell script into the newly created Linux OS.

Below is the script that will be executed upon boot. It will install and configure CloudFlare Railgun. You will have to replace three values within the script:

  * Railgun Activation token: You can find this token within the CloudFlare Web UI.
  * Railgun Host: The hostname of the ELB. You should have noted this down in an earlier step.
  * Memcached Server: The hostname of the ElastiCache Memcached cluster. You should have noted this down in an earlier step.

<pre>#!/bin/bash
echo 'deb http://pkg.cloudflare.com/ '`lsb_release -c -s`' main' | tee /etc/apt/sources.list.d/cloudflare-main.list
curl -C - https://pkg.cloudflare.com/pubkey.gpg | sudo apt-key add -
apt-get update
apt-get install -y railgun-stable
sed -i "s/memcached.servers = 127.0.0.1:11211/memcached.servers = railgun-ha.zazcvl.cfg.euc1.cache.amazonaws.com:11211/" /etc/railgun/railgun.conf
sed -i "s/activation.token = YOUR_TOKEN_HERE/activation.token = 123a4567bc123d4e567abcd89012345a/" /etc/railgun/railgun.conf
sed -i "s/activation.railgun_host = YOUR_PUBLIC_IP_OR_HOSTNAME/activation.railgun_host = Railgun-HA-1142856350.eu-central-1.elb.amazonaws.com/" /etc/railgun/railgun.conf
service railgun start
</pre>

Give your Launch Configuration a name and paste the above script into User Data field (See Figure 24).

<div id="attachment_2199" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/019-EC2_02.png" rel="attachment wp-att-2199"><img src="/content/uploads/2016/02/019-EC2_02-600x420.png" alt="Figure 24: Create a Launch Configuration - Step 3" width="600" height="420" class="size-large wp-image-2199" srcset="/content/uploads/2016/02/019-EC2_02-600x420.png 600w, /content/uploads/2016/02/019-EC2_02-350x245.png 350w, /content/uploads/2016/02/019-EC2_02-768x537.png 768w, /content/uploads/2016/02/019-EC2_02.png 1036w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 24: Create a Launch Configuration - Step 3
  </p>
</div>

Within the Security Group configuration step, select the existing security group "Railgun" (See Figure 25). You have configured this security group in a previous step.

<div id="attachment_2200" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/020-EC2_03.png" rel="attachment wp-att-2200"><img src="/content/uploads/2016/02/020-EC2_03-600x246.png" alt="Figure 25: Create a Launch Configuration - Step 5" width="600" height="246" class="size-large wp-image-2200" srcset="/content/uploads/2016/02/020-EC2_03-600x246.png 600w, /content/uploads/2016/02/020-EC2_03-350x144.png 350w, /content/uploads/2016/02/020-EC2_03-768x315.png 768w, /content/uploads/2016/02/020-EC2_03.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 25: Create a Launch Configuration - Step 5
  </p>
</div>

Next we have to create the Auto Scaling Group, which ties the Launch Configuration, Elastic Load Balancer and VPCs together to automatically launch the Railgun nodes.

Under Network chose the VPC that you are using for this Railgun setup and under subnet select the two public subnets of the VPC.

Select the ELB that you configured under Load Balancing and pick ELB as the Health Check Type (See Figure 26). This will ensure that Railgun nodes that do not accept connections over TCP/2408 anymore are considered unhealthy, will be terminated and replaced.

<div id="attachment_2201" style="width: 567px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/021-EC2_04.png" rel="attachment wp-att-2201"><img src="/content/uploads/2016/02/021-EC2_04-557x600.png" alt="Figure 26: Create an Auto Scaling Group - Step 1" width="557" height="600" class="size-large wp-image-2201" srcset="/content/uploads/2016/02/021-EC2_04-557x600.png 557w, /content/uploads/2016/02/021-EC2_04-325x350.png 325w, /content/uploads/2016/02/021-EC2_04-768x827.png 768w, /content/uploads/2016/02/021-EC2_04.png 861w" sizes="(max-width: 557px) 100vw, 557px" /></a>

  <p class="wp-caption-text">
    Figure 26: Create an Auto Scaling Group - Step 1
  </p>
</div>

As we are solely using the Auto Scaling capability to replace failed Railgun nodes, pick "Keep this group at its initial size" for the scaling policy (See Figure 27).

<div id="attachment_2202" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/022-EC2_05.png" rel="attachment wp-att-2202"><img src="/content/uploads/2016/02/022-EC2_05-600x106.png" alt="Figure 27: Create an Auto Scaling Group - Step 2" width="600" height="106" class="size-large wp-image-2202" srcset="/content/uploads/2016/02/022-EC2_05-600x106.png 600w, /content/uploads/2016/02/022-EC2_05-350x62.png 350w, /content/uploads/2016/02/022-EC2_05-768x136.png 768w, /content/uploads/2016/02/022-EC2_05.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 27: Create an Auto Scaling Group - Step 2
  </p>
</div>

Next provide what tags you want to apply to all EC2 instances that are created as part of the Auto Scaling group. It is highly recommended to at least define the tag "Name" (See Figure 28).

<div id="attachment_2203" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/023-EC2_06.png" rel="attachment wp-att-2203"><img src="/content/uploads/2016/02/023-EC2_06-600x121.png" alt="Figure 28: Create an Auto Scaling Group - Step 4" width="600" height="121" class="size-large wp-image-2203" srcset="/content/uploads/2016/02/023-EC2_06-600x121.png 600w, /content/uploads/2016/02/023-EC2_06-350x71.png 350w, /content/uploads/2016/02/023-EC2_06-768x155.png 768w, /content/uploads/2016/02/023-EC2_06.png 1400w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 28: Create an Auto Scaling Group - Step 4
  </p>
</div>

This not only concludes the configuration of the Auto Scaling setup, but of your entire setup. AWS should now automatically spin up EC2 images, automatically install and configure CloudFlare Railgun inside of them and add them to the ELB load balancer. Have a look at the next section for learning how to test your setup.

### Testing the setup

Now, with the setup in place it's time to wait for the Railgun nodes to boot up and configure correctly. You can head over to the ELB setup and look at the instances under the configured load balancer. While the nodes are still initializing you should see the status "OutOfService" displayed (See Figure 29).

<div id="attachment_2205" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/024-STAT01.png" rel="attachment wp-att-2205"><img src="/content/uploads/2016/02/024-STAT01-600x337.png" alt="Figure 29: Monitor the Load Balancer Instances" width="600" height="337" class="size-large wp-image-2205" srcset="/content/uploads/2016/02/024-STAT01-600x337.png 600w, /content/uploads/2016/02/024-STAT01-350x197.png 350w, /content/uploads/2016/02/024-STAT01-768x432.png 768w, /content/uploads/2016/02/024-STAT01.png 1234w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 29: Monitor the Load Balancer Instances
  </p>
</div>

After a few minutes the status of the instances should change to "InService", indicating that the Railgun Listener nodes are up and running and accept traffic over port TCP/2408 (See Figure 30).

<div id="attachment_2206" style="width: 610px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/024-STAT01-.png" rel="attachment wp-att-2206"><img src="/content/uploads/2016/02/024-STAT01--600x82.png" alt="Figure 30: ELB instances in status &quot;InService&quot;" width="600" height="82" class="size-large wp-image-2206" srcset="/content/uploads/2016/02/024-STAT01--600x82.png 600w, /content/uploads/2016/02/024-STAT01--350x48.png 350w, /content/uploads/2016/02/024-STAT01--768x105.png 768w, /content/uploads/2016/02/024-STAT01-.png 909w" sizes="(max-width: 600px) 100vw, 600px" /></a>

  <p class="wp-caption-text">
    Figure 30: ELB instances in status "InService"
  </p>
</div>

Now you can login to the CloudFlare Dashboard and test the Railgun setup. If everything is working you should see a "compression\_ratio", as well as "origin\_response_time" displayed (See Figure 31).

<div id="attachment_2204" style="width: 403px" class="wp-caption aligncenter">
  <a href="/content/uploads/2016/02/023-RG01.png" rel="attachment wp-att-2204"><img src="/content/uploads/2016/02/023-RG01-393x600.png" alt="Figure 31: Validate the functionality of Railgun" width="393" height="600" class="size-large wp-image-2204" srcset="/content/uploads/2016/02/023-RG01-393x600.png 393w, /content/uploads/2016/02/023-RG01-229x350.png 229w, /content/uploads/2016/02/023-RG01.png 602w" sizes="(max-width: 393px) 100vw, 393px" /></a>

  <p class="wp-caption-text">
    Figure 31: Validate the functionality of Railgun
  </p>
</div>

### Summary

This tutorial showed you how to use Amazon Web Services (AWS), with the services <a href="https://aws.amazon.com/elasticache/" target="_blank">Amazon ElastiCache</a> together with <a href="https://aws.amazon.com/elasticloadbalancing/" target="_blank">AWS Elastic Load Balancing</a>, <a href="https://aws.amazon.com/autoscaling/" target="_blank">AWS Auto Scaling</a> and <a href="https://aws.amazon.com/ec2/" target="_blank">Amazon EC2</a> to quickly and easily setup a highly available CloudFlare Railgun Listener setup.
