---
title: Direct Connect Public VIF for S3 traffic only
author: Christian Elsen
excerpt: How to use a Direct Connect Public VIF solely for S3 traffic only
layout: single
image: /content/uploads/2026/01/aws-dx-public-vid-for-s3-only.png
header:
  og_image: /content/uploads/2026/01/aws-dx-public-vid-for-s3-only.png
permalink: /2026/01/13/aws-dx-public-vid-for-s3-only/
categories:
  - EdgeCloud
tags:
  - AWS
  - Network
  - Direct-Connect
toc: true
---

When using AWS Direct Connect with a Public Virtual Interface (VIF) to access S3, customers often face a challenge: by default, the Public VIF receives all AWS public IP prefixes via BGP, not just those for S3. This means traffic to all AWS services - including EC2, Lambda, and others - will route over the expensive Direct Connect connection instead of the internet, significantly increasing data transfer costs.

This article explores a solution that allows you to route only S3 traffic over Direct Connect while sending all other AWS traffic over the internet, optimizing both costs and bandwidth usage.

# The Problem

AWS Direct Connect Public VIFs are designed to provide access to AWS public services like S3, but they come with a significant limitation: when you establish a BGP session with AWS (AS16509), you receive the complete set of AWS public IP prefixes for the region. This includes prefixes for:

* Amazon S3
* Amazon EC2
* AWS Lambda
* All other AWS services with public endpoints

This means your Direct Connect connection will carry traffic not only to your own AWS workloads, but also to other AWS customers' workloads hosted on these services. With recent estimates showing that up to 80% of the Internet might be running on AWS, this can result in substantial unintended traffic.

For customers who primarily want to use Direct Connect for S3 access - often for large data transfers, backups, or content distribution - this creates two problems:

1. **Increased costs:** All AWS traffic routes over Direct Connect, incurring higher data transfer charges compared to internet egress
2. **Bandwidth consumption:** Non-S3 traffic consumes valuable Direct Connect bandwidth that could be reserved for S3 transfers

# The Solution: BGP Prefix Filtering

The solution involves implementing BGP prefix filtering on your router to accept only S3-specific IP prefixes from AWS while rejecting all others. This creates a hybrid routing scenario where:

* S3 traffic → Direct Connect Public VIF (optimized path)
* All other AWS traffic → Internet (cost-effective path)

{% include figure image_path="/content/uploads/2026/01/s3-only-pubvif-architecture.png" caption="Figure 1: Architecture with S3-only prefix filtering" %}

The challenge lies in identifying and maintaining the correct S3 IP prefixes for each AWS region, as these prefixes change over time when AWS expands their infrastructure.

# Automated Solution: s3-only-pubvif Repository

The [s3-only-pubvif](https://github.com/chriselsen/s3-only-pubvif) Github repository provides an automated solution to this challenge by:

## Generating Region-Specific Prefix Lists

The repository automatically generates BGP prefix lists for S3 traffic in all AWS regions through an event-driven process:

1. **SNS notification trigger:** AWS [publishes notifications](https://docs.aws.amazon.com/vpc/latest/userguide/subscribe-notifications.html) to the SNS topic `arn:aws:sns:us-east-1:806199016981:AmazonIpSpaceChanged` whenever changes are made to IP ranges
2. **Lambda webhook function:** A Lambda function subscribes to this SNS topic and triggers a GitHub Actions workflow via webhook when IP range changes are detected
3. **Automated processing:** The GitHub Actions workflow downloads the updated [ip-ranges.json](https://ip-ranges.amazonaws.com/ip-ranges.json) file from AWS
4. **Filtering S3 prefixes:** The workflow extracts only the IP prefixes tagged with "service": "S3" for each region
5. **Creating router configurations:** Ready-to-use prefix lists are generated for both Cisco IOS and Juniper routers

This event-driven approach ensures that prefix lists are updated immediately when AWS makes infrastructure changes, rather than relying on periodic polling that could miss updates or create delays.

## Supporting Multiple Router Platforms

The repository provides configurations for the two most common enterprise router platforms:

**Cisco IOS format:**
```
ip prefix-list aws-s3-us-east-1 seq 10 permit 52.216.0.0/15 le 24
ip prefix-list aws-s3-us-east-1 seq 20 permit 54.231.0.0/16 le 24
ipv6 prefix-list aws-s3-us-east-1 seq 30 permit 2600:1f60:8000::/39 le 48
```

**Juniper format:**
```
policy-options {
    prefix-list aws-s3-us-east-1 {
        52.216.0.0/15 orlonger;
        54.231.0.0/16 orlonger;
        2600:1f60:8000::/39 orlonger;
    }
}
```

## Automated Updates

The repository implements automated updates through:

* **GitHub Actions workflow:** Automatically triggered when AWS publishes changes to ip-ranges.json
* **SNS integration:** AWS publishes notifications to the SNS topic `arn:aws:sns:us-east-1:806199016981:AmazonIpSpaceChanged` when IP ranges change
* **Lambda webhook:** A Lambda function can subscribe to this SNS topic and trigger the GitHub Actions workflow

# Implementation Considerations

## BGP Prefix Length Filtering

The generated prefix lists use length restrictions to handle BGP route announcements:

* **IPv4 prefixes:** Use `le 24` (less than or equal to /24) to match more specific announcements
* **IPv6 prefixes:** Use `le 48` (less than or equal to /48) to match more specific announcements

This ensures that even if AWS announces more specific prefixes than those listed in ip-ranges.json, your router will still accept them. The S3 prefixes announced over Direct Connect Public VIF are identical to those announced over the Internet, ensuring consistent routing behavior.

## Return Traffic Considerations

An important limitation to understand: these prefix filters only control outbound traffic from your network to AWS. Return traffic from AWS to your network will use whichever path AWS chooses based on the prefixes you announce via BGP.

To minimize exposure while maintaining S3 connectivity, the repository recommends:

* **Announce minimal prefixes:** Only announce a /32 IPv4 prefix (single IP address) to AWS
* **Use NAT/PAT:** Implement Network Address Translation on your router to access S3 from internal networks

This approach ensures that while you can reach S3 over Direct Connect, other AWS services cannot easily reach your internal networks via the Direct Connect path.

# Regional Coverage

The repository provides prefix lists for all AWS regions, including:

* All standard AWS commercial regions (us-east-1, eu-west-1, ap-southeast-1, etc.)
* AWS GovCloud regions (us-gov-east-1, us-gov-west-1)
* Newer regions like Europe Sovereign Cloud (eusc-de-east-1)

Notably excluded are China regions (cn-north-1, cn-northwest-1), which operate under different IP range management.

# Cost Optimization Benefits

Implementing S3-only prefix filtering can provide significant cost savings:

* **Direct Connect data transfer:** Currently $0.02/GB for most regions
* **Internet data transfer:** Varies by service but generally lower for non-S3 traffic
* **Bandwidth optimization:** Reserve Direct Connect capacity for high-volume S3 transfers

For organizations with large S3 workloads but moderate usage of other AWS services, this approach can reduce overall AWS networking costs while maintaining optimal performance for S3 access.

# Summary

The s3-only-pubvif repository solves a common challenge faced by AWS customers using Direct Connect Public VIFs: how to route only S3 traffic over the expensive Direct Connect connection while sending other AWS traffic over the internet.

By providing automated, up-to-date BGP prefix lists for all AWS regions and supporting major router platforms, the repository enables customers to implement cost-effective hybrid routing strategies. The solution is particularly valuable for organizations with significant S3 workloads who want to optimize their AWS networking costs without sacrificing performance.

The automated update mechanism ensures that the prefix lists remain current as AWS expands their infrastructure, providing a maintenance-free solution for long-term deployments.
