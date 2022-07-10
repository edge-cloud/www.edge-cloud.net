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
* **Avoid blocking of IP space:** [AWS publishes its current IP address ranges in JSON format](https://docs.aws.amazon.com/general/latest/gr/aws-ip-ranges.html), which makes it very easy for various content or service provider to block all of this address space. This often happens for unknown or unclear reasons. Address space used for BYOIP is not published via this JSON file.
* **Hard-coded IP addresses:** There is a wide set of devices in the field that might be using hard-coded IP addresses to contact a service instead of relying on [DNS](https://en.wikipedia.org/wiki/Domain_Name_System). Therefore when moving such a service to AWS, it is often necessary to move the corresponding IP address and its IP block along to AWS. Most frequently this proves easier than updating hundreds if not thousands of devices in the field.   

# Requirements

The AWS documentation lists various [requirements](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-byoip.html#byoip-requirements) for using BYOIP. One key requirement is to be able to demonstrate "control" over the IP space in question.

It's widely recognized within the Internet community that you can demonstrate sufficient control over IP address space for the purpose of announcement from another ASN, by being able to create the corresponding Route Origin Authorization (ROA) record. Later within the process you will see how you can demonstrate control over your IP space by creating the necessary ROA record.

# Overall process

The overall process to bring IPv4 or IPv6 address space to AWS via the BYOIP process consists of multiple steps and is outlined in figure 1.

{% include figure image_path="/content/uploads/2021/10/BYOIP-AWS-Process.png" caption="Figure 1: AWS Process to prepare and provison VPC BYOIP." %}

* **Step 1: Configuration of IP address space via your RIR/LIR** - This includes creating appropriate RIR Resource DB records (aka. "Allocation" in the case of RIPE), as well as a Route Origin Authorization (ROA) record. While this step is necessary for BYOIP, it also represents good hygiene when using IP address space in general.

* **Step 2: Preparation of Self-signed X.509 certificates** - While ROA is used to demonstrate control over the IP address space, it cannot be used to match a particular IP space to a certain AWS account ID. This is done via steps 2 - 5, whereas Step 2 generates a self-signed X.509 certificate pair for later usage.

* **Step 3: Uploading the public key to the RIR Resource DB (RDAP record)** - Placing the public key portion of the self-signed X.509 certificate into the description field of the IP address space's RDAP record allows AWS to validate the mapping of the corresponding address space to an AWS account. This approach assumes that only someone with control over the IP address space can make changes to the corresponding RIR Resource DB record.

* **Step 4: Creating a signed message** - In this step you tie the IP address space to a certain AWS account ID. This is done by creating a signed message that by itself creates information about the IP address space and the AWS account ID and is signed using the above mentioned self-signed X.509 certificates.

* **Step 5: Provision address** - The signed message from step 4 is used to request the provisioning of the IP address space within AWS VPC. AWS validates the request against the RIR Resources DB and the RPKI publication point to ensure that you have sufficient control over the space.  

# RIR/LIR Configuration

In this blog post I will use IPv6 space allocated by my Local Internet Registry (LIR) [SnapServ](https://snapserv.net/) from the Regional Internet Registry (RIR) [RIPE NCC](https://www.ripe.net/).

RIPE policy ([IPv4](https://www.ripe.net/publications/docs/ripe-733), [IPv6](https://www.ripe.net/publications/docs/ripe-738)) states that any IP address sub-block that is used in a different network must be sub-allocated by the RIR or assigned by the end-user within the RIPE database.

For this particular example we will focus on the red circle in Figure 2:

{% include figure image_path="/content/uploads/2021/10/BYOIP-RIPE-Assignment.png" caption="Figure 2: RIPE Assignment for IPv4 and IPv6 address space with example highlighted in red." %}

## Assignment

While the [/40 block](https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=2a06:e881:7300::%2F40&type=inet6num) with the status "Allocated-By-LIR" already exists at this point, I need to create a new assignment for the [/48 block](https://apps.db.ripe.net/db-web-ui/lookup?source=ripe&key=2a06:e881:73ff::%2F48&type=inet6num) with the status "Assigned" to fulfill the RIPE policy. 

Without going into full details of how to [document IPv6 assignments in the RIPE database](https://www.ripe.net/manage-ips-and-asns/db/support/documentation/documenting-ipv6-assignments-in-the-ripe-database), or what attributes the [inet6num object](https://www.ripe.net/manage-ips-and-asns/db/support/documentation/ripe-database-documentation/rpsl-object-types/4-2-descriptions-of-primary-objects/4-2-3-description-of-the-inet6num-object) can include, the resulting inet6num object in RPSL format will look like this:

```
inet6num:       2a06:e881:73ff::/48
netname:        EU-CHRISTIANELSEN-AWS
country:        EU
admin-c:        CE2932-RIPE
tech-c:         CE2932-RIPE
status:         ASSIGNED
mnt-by:         Christian_Elsen-MNT
source:         RIPE

```

For now we have merely created this inet6num object in the RIPE database for documentation purposes and to fulfill the RIPE policy. Later on you'll see that we will come back to this object and update it with the self-signed X.509 certificate. 


## Resource Public Key Infrastructure (RPKI)

Next we need to create a Route Origin Authorization (ROA), a cryptographically signed object that states which Autonomous System (AS) is authorized to originate a particular IP address prefix. For address objects with the status of "Assigned PI" for Provider Independent (See Figure 2), one would accomplish this via the Regional Internet Registry (RIR). In my case that would be the [RIPE RPKI Dashboard](https://my.ripe.net/#/rpki) and look like depicted in Figure 3. 

{% include figure image_path="/content/uploads/2021/10/BYOIP-RIPE-RPKI.png" caption="Figure 3: RIPE RPKI dashboard for managing Provider Independent (PI) resources." %}

But you'll remember from above that for this post I'm not using a Provider Independent IP block, but rather an IPv6 block in the "Assigned" state. Therefore I have to turn to my LIR in order to create the ROA. Luckily my LIR provides a web interface to accomplish this task (See Figure 4). 

This allows me to create two ROA entries to map the /48 prefix in question to both the origin ASN of AS14618 and AS16509. As the prefix is a /48 , selecting a "Maximum Length" of 48 for the ROA object is the only choice. 

{% include figure image_path="/content/uploads/2021/10/BYOIP-LIR-RPKI.png" caption="Figure 4: LIR RPKI dashboard for managing Assigned resources." %}

AWS recommends to create a ROA object for both AS14618 - which is used for the US-East-1 (N.Virginia) region - as well as AS16509 - which is used for all other commercial AWS regions. If you want to use BYOIP with GovCloud (US) select AS8987 in your ROA object instead.  

# AWS Preparation

# AWS Configuration

# Validation

https://rpki.cloudflare.com/?view=explorer&prefix=2a06%3Ae881%3A7300%3A%3A%2F40&prefixMatch=lspec

https://rpki.cloudflare.com/?view=explorer&prefix=2a06%3Ae881%3A73ff%3A%3A%2F48&prefixMatch=mspec

**Bold**

**Note:** This is a notice box
{: .notice--info}

```
#
# Code
#

```



{% include figure image_path="/content/uploads/2021/10/BYOIP-AWS-VPC-Pool.png" caption="Figure 3: Resulting IPv6 pool within a VPC." %}



$$
   Buffer (Mbit) = bandwidth (Mbit/s) × delay (s)
$$
