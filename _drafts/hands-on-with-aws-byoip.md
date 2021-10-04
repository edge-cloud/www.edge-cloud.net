---
title: Hands-on with AWS Bring your own IP addresses (BYOIP) in Amazon EC2
author: Christian Elsen
excerpt: Using AWS Bring your own IP addresses (BYOIP) in Amazon EC2 capability with a real life example of an IPv6 prefix, showing provisioning and troubleshooting steps.
layout: single
permalink: /2021/10/01/hands-on-with-aws-byoip/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
  - IPv6
toc: true
---

This blog post will walk you through the [Bring your own IP addresses (BYOIP) for Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-byoip.html), using a real-life example. With BYOIP you can bring part or all of your publicly routable IPv4 or IPv6 address ranges to your AWS account. While you continue to own the address range, AWS advertises it on the internet for you under the Amazon [Autonomous System Numbers (ASNs)](https://en.wikipedia.org/wiki/Autonomous_system_(Internet)). Within your AWS account, these BYOIP address ranges appear as an [address pool](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html).

While [other blog posts on AWS BYOIP](https://aws.amazon.com/blogs/networking-and-content-delivery/introducing-bring-your-own-ip-byoip-for-amazon-vpc/) exist, they are usually completely theoretical and thereby hard to follow. In this blog post instead I will use real IPv6 address space, allowing you to validate the various steps through various publicly available databases and systems.

# Benefits

You might wonder what the benefits of using BYOIP for Amazon EC2 is. They include among others:

* **Trusted IP space:** You might be using trusted IP space for your service, such as a transactional e-Mail service that requires a high reputation of IP space, or a VPN service.
* **Avoid blocking of IP space:** 

# Requirements

While the AWS documentation lists various [requirements](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-byoip.html#byoip-requirements), the statements on IP address "ownership" can be ignored. This is due to IP address "ownership" being a quite fuzzy term and "control" being a better term.

It's widely recognized within the Internet community that you can demonstrate sufficient control over IP address space for the purpose of announcement from another ASN, by being able to create the corresponding Route Origin Authorization (ROA) record.

While you will later see how

# Overall process

{% include figure image_path="/content/uploads/2021/10/BYOIP-AWS-Process.png" caption="Figure 1: AWS Process to prepare and provison VPC BYOIP." %}


# RIR/LIR Configuration

## Assignment

## Resource Public Key Infrastructure (RPKI)

# AWS Preparation

# AWS Configuration

# Validation

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```

{% include figure image_path="/content/uploads/2021/10/BYOIP-RIPE-Assignment.png" caption="Figure 2: RIPE Assignment for IPv4 and IPv6 address space with example highlighted in red." %}


{% include figure image_path="/content/uploads/2021/10/BYOIP-AWS-VPC-Pool.png" caption="Figure 3: Resulting IPv6 pool within a VPC." %}



$$
   Buffer (Mbit) = bandwidth (Mbit/s) × delay (s)
$$
